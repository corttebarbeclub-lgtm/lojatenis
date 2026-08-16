-- Fase 5: suporte a operações offline do PDV (venda e sangria/suprimento
-- em caixa já aberto). Abrir/fechar caixa continua exigindo conexão.
--
-- Idempotência real: cada operação que pode ser reenviada (retry de rede
-- ao sincronizar) carrega um client_operation_id gerado no dispositivo no
-- momento da criação — não no envio. unique() nessa coluna garante que a
-- mesma operação nunca é aplicada duas vezes, mesmo com reenvio.

alter table sales add column client_operation_id uuid;
create unique index sales_client_operation_id_idx
  on sales(tenant_id, client_operation_id) where client_operation_id is not null;

alter table cash_movements add column client_operation_id uuid;
create unique index cash_movements_client_operation_id_idx
  on cash_movements(tenant_id, client_operation_id) where client_operation_id is not null;

-- ---------------------------------------------------------------------------
-- Conflitos de sincronização: uma venda offline pode chegar ao servidor
-- depois que o estoque já foi consumido por outra operação (dois caixas
-- offline vendendo o último par). Nunca resolvido silenciosamente — a
-- venda original fica registrada aqui para o gestor decidir.
-- ---------------------------------------------------------------------------

create type sync_conflict_status as enum ('pending', 'resolved');

create table sync_conflicts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_operation_id uuid not null,
  operation_type text not null,       -- 'sale' | 'cash_movement'
  payload jsonb not null,             -- payload original enviado pelo cliente
  error_message text not null,
  status sync_conflict_status not null default 'pending',
  resolved_by uuid references users(id) on delete set null,
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index sync_conflicts_tenant_id_idx on sync_conflicts(tenant_id);
create index sync_conflicts_status_idx on sync_conflicts(tenant_id, status);

alter table sync_conflicts enable row level security;

create policy sync_conflicts_select_own_tenant on sync_conflicts
  for select to authenticated using (tenant_id = auth_tenant_id());

create policy sync_conflicts_update_own_tenant on sync_conflicts
  for update to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

-- ---------------------------------------------------------------------------
-- create_sale e register_cash_movement passam a aceitar um
-- client_operation_id opcional. Se já existir um registro com o mesmo
-- client_operation_id para o tenant, retorna o registro existente em vez
-- de criar de novo (idempotência) — nunca duplica uma venda por retry.
-- ---------------------------------------------------------------------------

create or replace function create_sale(
  p_cash_register_id uuid,
  p_items jsonb,
  p_payments jsonb,
  p_discount_cents integer default 0,
  p_customer_id uuid default null,
  p_seller_id uuid default null,
  p_client_operation_id uuid default null
)
returns sales
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_store_id uuid;
  v_cr_status cash_register_status;
  v_item jsonb;
  v_payment jsonb;
  v_subtotal integer := 0;
  v_total integer;
  v_payments_sum integer := 0;
  v_sale sales;
  v_existing sales;
  v_item_total integer;
begin
  select tenant_id, store_id, status into v_tenant_id, v_store_id, v_cr_status
    from cash_registers where id = p_cash_register_id;

  if v_tenant_id is null or v_tenant_id != auth_tenant_id() then
    raise exception 'Caixa não encontrado.';
  end if;

  if p_client_operation_id is not null then
    select * into v_existing from sales
      where tenant_id = v_tenant_id and client_operation_id = p_client_operation_id;
    if found then
      return v_existing;
    end if;
  end if;

  if v_cr_status != 'open' then
    raise exception 'Não é possível registrar venda em caixa fechado.';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'A venda precisa de ao menos um item.';
  end if;

  if p_discount_cents < 0 then
    raise exception 'Desconto não pode ser negativo.';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_item_total := (v_item->>'quantity')::integer * (v_item->>'unit_price_cents')::integer;
    v_subtotal := v_subtotal + v_item_total;
  end loop;

  v_total := v_subtotal - p_discount_cents;

  if v_total < 0 then
    raise exception 'Desconto maior que o subtotal da venda.';
  end if;

  for v_payment in select * from jsonb_array_elements(p_payments) loop
    v_payments_sum := v_payments_sum + (v_payment->>'amount_cents')::integer;
  end loop;

  if v_payments_sum != v_total then
    raise exception 'Soma dos pagamentos (%) não corresponde ao total da venda (%).', v_payments_sum, v_total;
  end if;

  insert into sales (tenant_id, store_id, cash_register_id, customer_id, seller_id, user_id, subtotal_cents, discount_cents, total_cents, client_operation_id)
  values (v_tenant_id, v_store_id, p_cash_register_id, p_customer_id, p_seller_id, auth.uid(), v_subtotal, p_discount_cents, v_total, p_client_operation_id)
  returning * into v_sale;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into sale_items (tenant_id, sale_id, variant_id, quantity, unit_price_cents, total_cents)
    values (
      v_tenant_id,
      v_sale.id,
      (v_item->>'variant_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price_cents')::integer,
      (v_item->>'quantity')::integer * (v_item->>'unit_price_cents')::integer
    );

    perform register_inventory_movement(
      (v_item->>'variant_id')::uuid,
      'sale',
      -((v_item->>'quantity')::integer),
      'Venda ' || v_sale.id
    );
  end loop;

  for v_payment in select * from jsonb_array_elements(p_payments) loop
    insert into payments (tenant_id, sale_id, method, amount_cents)
    values (v_tenant_id, v_sale.id, (v_payment->>'method')::payment_method, (v_payment->>'amount_cents')::integer);
  end loop;

  return v_sale;
end;
$$;

grant execute on function create_sale(uuid, jsonb, jsonb, integer, uuid, uuid, uuid) to authenticated;

create or replace function register_cash_movement(
  p_cash_register_id uuid,
  p_type cash_movement_type,
  p_amount_cents integer,
  p_reason text default null,
  p_client_operation_id uuid default null
)
returns cash_movements
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_status cash_register_status;
  v_result cash_movements;
  v_existing cash_movements;
begin
  select tenant_id, status into v_tenant_id, v_status
    from cash_registers where id = p_cash_register_id;

  if v_tenant_id is null or v_tenant_id != auth_tenant_id() then
    raise exception 'Caixa não encontrado.';
  end if;

  if p_client_operation_id is not null then
    select * into v_existing from cash_movements
      where tenant_id = v_tenant_id and client_operation_id = p_client_operation_id;
    if found then
      return v_existing;
    end if;
  end if;

  if v_status != 'open' then
    raise exception 'Não é possível registrar movimentação em caixa fechado.';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Valor deve ser maior que zero.';
  end if;

  insert into cash_movements (tenant_id, cash_register_id, type, amount_cents, reason, user_id, client_operation_id)
  values (v_tenant_id, p_cash_register_id, p_type, p_amount_cents, p_reason, auth.uid(), p_client_operation_id)
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function register_cash_movement(uuid, cash_movement_type, integer, text, uuid) to authenticated;

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('011', '011_offline_sync', array['-- applied via management API'])
on conflict (version) do nothing;
