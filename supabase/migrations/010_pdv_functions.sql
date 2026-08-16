-- Fase 4: funções de negócio do PDV. Toda escrita em cash_registers,
-- cash_movements, sales, sale_items e payments passa por aqui — nunca
-- INSERT direto do client, porque a integridade entre essas tabelas
-- (saldo de caixa, baixa de estoque, soma de pagamentos) só pode ser
-- garantida dentro de uma transação.

create or replace function open_cash_register(
  p_store_id uuid,
  p_opening_balance_cents integer
)
returns cash_registers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_result cash_registers;
begin
  select tenant_id into v_tenant_id from stores where id = p_store_id;

  if v_tenant_id is null or v_tenant_id != auth_tenant_id() then
    raise exception 'Loja não encontrada.';
  end if;

  if p_opening_balance_cents < 0 then
    raise exception 'Saldo inicial não pode ser negativo.';
  end if;

  if exists (select 1 from cash_registers where store_id = p_store_id and status = 'open') then
    raise exception 'Já existe um caixa aberto para esta loja.';
  end if;

  insert into cash_registers (tenant_id, store_id, opened_by, opening_balance_cents)
  values (v_tenant_id, p_store_id, auth.uid(), p_opening_balance_cents)
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function open_cash_register(uuid, integer) to authenticated;

create or replace function close_cash_register(
  p_cash_register_id uuid,
  p_closing_balance_cents integer
)
returns cash_registers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_status cash_register_status;
  v_opening integer;
  v_cash_sales integer;
  v_withdrawals integer;
  v_reinforcements integer;
  v_expected integer;
  v_result cash_registers;
begin
  select tenant_id, status, opening_balance_cents
    into v_tenant_id, v_status, v_opening
    from cash_registers where id = p_cash_register_id;

  if v_tenant_id is null or v_tenant_id != auth_tenant_id() then
    raise exception 'Caixa não encontrado.';
  end if;

  if v_status != 'open' then
    raise exception 'Este caixa já está fechado.';
  end if;

  select coalesce(sum(p.amount_cents), 0) into v_cash_sales
    from payments p
    join sales s on s.id = p.sale_id
    where s.cash_register_id = p_cash_register_id
      and s.status = 'completed'
      and p.method = 'cash';

  select coalesce(sum(amount_cents), 0) into v_withdrawals
    from cash_movements where cash_register_id = p_cash_register_id and type = 'withdrawal';

  select coalesce(sum(amount_cents), 0) into v_reinforcements
    from cash_movements where cash_register_id = p_cash_register_id and type = 'reinforcement';

  v_expected := v_opening + v_cash_sales + v_reinforcements - v_withdrawals;

  update cash_registers
  set status = 'closed',
      closed_by = auth.uid(),
      closing_balance_cents = p_closing_balance_cents,
      expected_balance_cents = v_expected,
      closed_at = now()
  where id = p_cash_register_id
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function close_cash_register(uuid, integer) to authenticated;

create or replace function register_cash_movement(
  p_cash_register_id uuid,
  p_type cash_movement_type,
  p_amount_cents integer,
  p_reason text default null
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
begin
  select tenant_id, status into v_tenant_id, v_status
    from cash_registers where id = p_cash_register_id;

  if v_tenant_id is null or v_tenant_id != auth_tenant_id() then
    raise exception 'Caixa não encontrado.';
  end if;

  if v_status != 'open' then
    raise exception 'Não é possível registrar movimentação em caixa fechado.';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Valor deve ser maior que zero.';
  end if;

  insert into cash_movements (tenant_id, cash_register_id, type, amount_cents, reason, user_id)
  values (v_tenant_id, p_cash_register_id, p_type, p_amount_cents, p_reason, auth.uid())
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function register_cash_movement(uuid, cash_movement_type, integer, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Venda: recebe os itens e pagamentos como jsonb (arrays de objetos) para
-- criar tudo em uma única chamada RPC. Valida caixa aberto, calcula totais
-- no servidor (nunca confia em subtotal/total vindos do client), dá baixa
-- no estoque item a item via register_inventory_movement (que já impede
-- saldo negativo) e confere que a soma dos pagamentos bate com o total.
-- ---------------------------------------------------------------------------

create or replace function create_sale(
  p_cash_register_id uuid,
  p_items jsonb,       -- [{variant_id, quantity, unit_price_cents}]
  p_payments jsonb,    -- [{method, amount_cents}]
  p_discount_cents integer default 0,
  p_customer_id uuid default null,
  p_seller_id uuid default null
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
  v_item_total integer;
begin
  select tenant_id, store_id, status into v_tenant_id, v_store_id, v_cr_status
    from cash_registers where id = p_cash_register_id;

  if v_tenant_id is null or v_tenant_id != auth_tenant_id() then
    raise exception 'Caixa não encontrado.';
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

  insert into sales (tenant_id, store_id, cash_register_id, customer_id, seller_id, user_id, subtotal_cents, discount_cents, total_cents)
  values (v_tenant_id, v_store_id, p_cash_register_id, p_customer_id, p_seller_id, auth.uid(), v_subtotal, p_discount_cents, v_total)
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

grant execute on function create_sale(uuid, jsonb, jsonb, integer, uuid, uuid) to authenticated;

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('010', '010_pdv_functions', array['-- applied via management API'])
on conflict (version) do nothing;
