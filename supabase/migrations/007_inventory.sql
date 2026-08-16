-- Fase 3: estoque. Saldo nunca é alterado diretamente — toda mudança
-- nasce como uma linha em inventory_movements, e o saldo em inventory
-- é sempre reflexo do histórico (atualizado atomicamente pela mesma
-- função que grava a movimentação).

create type inventory_movement_type as enum (
  'entry',       -- entrada de mercadoria (compra, recebimento de fornecedor)
  'adjustment',  -- correção manual (perda, achado, erro de cadastro)
  'count'        -- resultado de contagem/inventário físico (define saldo absoluto)
);

create table inventory (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  quantity integer not null default 0,
  min_quantity integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (variant_id)
);

create index inventory_tenant_id_idx on inventory(tenant_id);

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  type inventory_movement_type not null,
  quantity_change integer not null,
  quantity_after integer not null,
  reason text,
  user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_movements_tenant_id_idx on inventory_movements(tenant_id);
create index inventory_movements_variant_id_idx on inventory_movements(variant_id);

-- ---------------------------------------------------------------------------
-- Helper de consistência (mesmo padrão de check_product_tenant_consistency,
-- mas contra product_variants em vez de products — usado por tabelas cuja
-- FK é direto pra variante, não pro produto).
-- ---------------------------------------------------------------------------

create or replace function check_variant_tenant_consistency()
returns trigger
language plpgsql
as $$
declare
  v_variant_tenant_id uuid;
begin
  select tenant_id into v_variant_tenant_id from product_variants where id = new.variant_id;

  if v_variant_tenant_id is null then
    raise exception 'Variação referenciada não existe.';
  end if;

  if v_variant_tenant_id != new.tenant_id then
    raise exception 'tenant_id não corresponde ao tenant da variação referenciada.';
  end if;

  return new;
end;
$$;

create trigger inventory_tenant_consistency
  before insert or update on inventory
  for each row
  execute function check_variant_tenant_consistency();

create trigger inventory_movements_tenant_consistency
  before insert or update on inventory_movements
  for each row
  execute function check_variant_tenant_consistency();

-- ---------------------------------------------------------------------------
-- Função central: única forma suportada de alterar estoque.
-- Cria (ou atualiza) a linha de inventory e grava a movimentação na
-- mesma transação, então nunca ficam dessincronizados.
-- ---------------------------------------------------------------------------

create or replace function register_inventory_movement(
  p_variant_id uuid,
  p_type inventory_movement_type,
  p_quantity integer,   -- para entry/adjustment: delta (+/-). Para count: quantidade absoluta final.
  p_reason text default null
)
returns inventory
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_current_quantity integer;
  v_new_quantity integer;
  v_quantity_change integer;
  v_result inventory;
begin
  select tenant_id into v_tenant_id from product_variants where id = p_variant_id;

  if v_tenant_id is null then
    raise exception 'Variação não encontrada.';
  end if;

  if v_tenant_id != auth_tenant_id() then
    raise exception 'Variação não pertence ao tenant autenticado.';
  end if;

  insert into inventory (tenant_id, variant_id, quantity)
  values (v_tenant_id, p_variant_id, 0)
  on conflict (variant_id) do nothing;

  select quantity into v_current_quantity from inventory where variant_id = p_variant_id for update;

  if p_type = 'count' then
    v_new_quantity := p_quantity;
    v_quantity_change := p_quantity - v_current_quantity;
  else
    v_quantity_change := p_quantity;
    v_new_quantity := v_current_quantity + p_quantity;
  end if;

  if v_new_quantity < 0 then
    raise exception 'Operação resultaria em estoque negativo (atual: %, alteração: %).', v_current_quantity, v_quantity_change;
  end if;

  update inventory
  set quantity = v_new_quantity, updated_at = now()
  where variant_id = p_variant_id
  returning * into v_result;

  insert into inventory_movements (tenant_id, variant_id, type, quantity_change, quantity_after, reason, user_id)
  values (v_tenant_id, p_variant_id, p_type, v_quantity_change, v_new_quantity, p_reason, auth.uid());

  return v_result;
end;
$$;

grant execute on function register_inventory_movement(uuid, inventory_movement_type, integer, text) to authenticated;

create or replace function set_min_quantity(p_variant_id uuid, p_min_quantity integer)
returns inventory
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_result inventory;
begin
  select tenant_id into v_tenant_id from product_variants where id = p_variant_id;

  if v_tenant_id is null or v_tenant_id != auth_tenant_id() then
    raise exception 'Variação não encontrada.';
  end if;

  if p_min_quantity < 0 then
    raise exception 'Estoque mínimo não pode ser negativo.';
  end if;

  insert into inventory (tenant_id, variant_id, quantity, min_quantity)
  values (v_tenant_id, p_variant_id, 0, p_min_quantity)
  on conflict (variant_id) do update set min_quantity = excluded.min_quantity
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function set_min_quantity(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table inventory enable row level security;
alter table inventory_movements enable row level security;

create policy inventory_select_own_tenant on inventory
  for select to authenticated using (tenant_id = auth_tenant_id());

create policy inventory_movements_select_own_tenant on inventory_movements
  for select to authenticated using (tenant_id = auth_tenant_id());

-- Nenhuma policy de insert/update direta: toda escrita passa pelas
-- funções security definer acima, que já validam o tenant internamente.

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('007', '007_inventory', array['-- applied via management API'])
on conflict (version) do nothing;
