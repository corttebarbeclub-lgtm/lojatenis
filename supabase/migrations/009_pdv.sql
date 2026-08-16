-- Fase 4: PDV — caixa, clientes, vendedores e vendas.
-- Sem trocas/devoluções (fase própria) e sem operação offline (Fase 5).

-- ---------------------------------------------------------------------------
-- Clientes e vendedores
-- ---------------------------------------------------------------------------

create table customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  full_name text not null,
  cpf text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create index customers_tenant_id_idx on customers(tenant_id);

create table sellers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  full_name text not null,
  commission_percent numeric(5,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index sellers_tenant_id_idx on sellers(tenant_id);

-- ---------------------------------------------------------------------------
-- Caixa: uma sessão por abertura/fechamento. Toda venda e sangria/suprimento
-- fica presa a uma sessão aberta — não existe operação de caixa sem sessão.
-- ---------------------------------------------------------------------------

create type cash_register_status as enum ('open', 'closed');
create type cash_movement_type as enum ('withdrawal', 'reinforcement'); -- sangria, suprimento

create table cash_registers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  opened_by uuid references users(id) on delete set null,
  closed_by uuid references users(id) on delete set null,
  status cash_register_status not null default 'open',
  opening_balance_cents integer not null default 0,
  closing_balance_cents integer,          -- saldo informado pelo operador ao fechar
  expected_balance_cents integer,         -- saldo calculado pelo sistema no fechamento
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create index cash_registers_tenant_id_idx on cash_registers(tenant_id);
create index cash_registers_store_status_idx on cash_registers(store_id, status);

-- Só uma sessão aberta por loja de cada vez.
create unique index cash_registers_one_open_per_store
  on cash_registers(store_id) where status = 'open';

create table cash_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  cash_register_id uuid not null references cash_registers(id) on delete cascade,
  type cash_movement_type not null,
  amount_cents integer not null check (amount_cents > 0),
  reason text,
  user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index cash_movements_tenant_id_idx on cash_movements(tenant_id);
create index cash_movements_cash_register_id_idx on cash_movements(cash_register_id);

-- ---------------------------------------------------------------------------
-- Vendas
-- ---------------------------------------------------------------------------

create type sale_status as enum ('completed', 'cancelled');
create type payment_method as enum ('cash', 'pix', 'card');

create table sales (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  cash_register_id uuid not null references cash_registers(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  seller_id uuid references sellers(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  status sale_status not null default 'completed',
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  total_cents integer not null,
  created_at timestamptz not null default now()
);

create index sales_tenant_id_idx on sales(tenant_id);
create index sales_cash_register_id_idx on sales(cash_register_id);
create index sales_created_at_idx on sales(created_at);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  sale_id uuid not null references sales(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null,
  total_cents integer not null
);

create index sale_items_tenant_id_idx on sale_items(tenant_id);
create index sale_items_sale_id_idx on sale_items(sale_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  sale_id uuid not null references sales(id) on delete cascade,
  method payment_method not null,
  amount_cents integer not null check (amount_cents > 0),
  created_at timestamptz not null default now()
);

create index payments_tenant_id_idx on payments(tenant_id);
create index payments_sale_id_idx on payments(sale_id);

-- ---------------------------------------------------------------------------
-- Triggers de consistência de tenant (mesmo padrão das Fases 2-3): RLS por
-- linha não impede uma linha com tenant_id correto referenciar uma FK de
-- outro tenant. Cada trigger valida contra a tabela pai específica.
-- ---------------------------------------------------------------------------

create or replace function check_store_tenant_consistency()
returns trigger
language plpgsql
as $$
declare
  v_store_tenant_id uuid;
begin
  select tenant_id into v_store_tenant_id from stores where id = new.store_id;
  if v_store_tenant_id is null or v_store_tenant_id != new.tenant_id then
    raise exception 'Loja referenciada não existe ou não pertence a este tenant.';
  end if;
  return new;
end;
$$;

create or replace function check_cash_register_tenant_consistency()
returns trigger
language plpgsql
as $$
declare
  v_cr_tenant_id uuid;
begin
  select tenant_id into v_cr_tenant_id from cash_registers where id = new.cash_register_id;
  if v_cr_tenant_id is null or v_cr_tenant_id != new.tenant_id then
    raise exception 'Caixa referenciado não existe ou não pertence a este tenant.';
  end if;
  return new;
end;
$$;

create or replace function check_sale_tenant_consistency()
returns trigger
language plpgsql
as $$
declare
  v_sale_tenant_id uuid;
begin
  select tenant_id into v_sale_tenant_id from sales where id = new.sale_id;
  if v_sale_tenant_id is null or v_sale_tenant_id != new.tenant_id then
    raise exception 'Venda referenciada não existe ou não pertence a este tenant.';
  end if;
  return new;
end;
$$;

create trigger cash_registers_store_consistency
  before insert or update on cash_registers
  for each row execute function check_store_tenant_consistency();

create trigger sales_store_consistency
  before insert or update on sales
  for each row execute function check_store_tenant_consistency();

create trigger sales_cash_register_consistency
  before insert or update on sales
  for each row execute function check_cash_register_tenant_consistency();

create trigger cash_movements_cash_register_consistency
  before insert or update on cash_movements
  for each row execute function check_cash_register_tenant_consistency();

create trigger sale_items_sale_consistency
  before insert or update on sale_items
  for each row execute function check_sale_tenant_consistency();

create trigger sale_items_variant_consistency
  before insert or update on sale_items
  for each row execute function check_variant_tenant_consistency();

create trigger payments_sale_consistency
  before insert or update on payments
  for each row execute function check_sale_tenant_consistency();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table customers enable row level security;
alter table sellers enable row level security;
alter table cash_registers enable row level security;
alter table cash_movements enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table payments enable row level security;

create policy customers_all_own_tenant on customers
  for all to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy sellers_all_own_tenant on sellers
  for all to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy cash_registers_all_own_tenant on cash_registers
  for all to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

-- cash_movements e sales/sale_items/payments são sempre criadas via função
-- security definer (ver 010_sale_functions.sql), então só precisam de
-- policy de leitura direta — escrita direta pelo cliente não é suportada.
create policy cash_movements_select_own_tenant on cash_movements
  for select to authenticated using (tenant_id = auth_tenant_id());

create policy sales_select_own_tenant on sales
  for select to authenticated using (tenant_id = auth_tenant_id());

create policy sale_items_select_own_tenant on sale_items
  for select to authenticated using (tenant_id = auth_tenant_id());

create policy payments_select_own_tenant on payments
  for select to authenticated using (tenant_id = auth_tenant_id());

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('009', '009_pdv', array['-- applied via management API'])
on conflict (version) do nothing;
