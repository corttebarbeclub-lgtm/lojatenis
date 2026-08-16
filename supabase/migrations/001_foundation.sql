-- Fase 1: fundação — tenants, lojas, usuários, papéis, planos, auditoria.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Planos (catálogo estático, sem billing real ainda)
-- ---------------------------------------------------------------------------

create type plan_tier as enum ('basic', 'pro', 'premium');

create table plans (
  id plan_tier primary key,
  name text not null,
  monthly_price_cents integer not null,
  max_users integer,
  max_stores integer,
  features text[] not null default '{}'
);

insert into plans (id, name, monthly_price_cents, max_users, max_stores, features) values
  ('basic', 'Básico', 14900, 1, 1, array['pdv', 'inventory', 'customers', 'basic_reports', 'basic_store']),
  ('pro', 'Profissional', 24900, 10, 1, array['pdv', 'inventory', 'customers', 'basic_reports', 'basic_store', 'multi_users', 'ecommerce', 'whatsapp', 'advanced_reports', 'commissions', 'loyalty']),
  ('premium', 'Premium', 39900, null, null, array['pdv', 'inventory', 'customers', 'basic_reports', 'basic_store', 'multi_users', 'ecommerce', 'whatsapp', 'advanced_reports', 'commissions', 'loyalty', 'multi_branch', 'advanced_crm', 'automation', 'omnichannel', 'ai_product_intake', 'ai_assistant', 'priority_support']);

-- ---------------------------------------------------------------------------
-- Tenants e assinatura
-- ---------------------------------------------------------------------------

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  plan_id plan_tier not null references plans(id),
  status subscription_status not null default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id)
);

-- ---------------------------------------------------------------------------
-- Lojas (filial única na Fase 1 — multi-filial chega na Fase 10)
-- ---------------------------------------------------------------------------

create table stores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  is_main boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Usuários e papéis
-- ---------------------------------------------------------------------------

create type user_role as enum ('owner', 'admin', 'manager', 'cashier', 'seller', 'stock', 'finance');

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  store_id uuid references stores(id) on delete set null,
  role user_role not null,
  full_name text not null,
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index users_tenant_id_idx on users(tenant_id);

-- ---------------------------------------------------------------------------
-- Auditoria
-- ---------------------------------------------------------------------------

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_logs_tenant_id_idx on audit_logs(tenant_id);

-- ---------------------------------------------------------------------------
-- Helper: tenant do usuário autenticado (evita repetir subquery em toda policy)
-- ---------------------------------------------------------------------------

create function auth_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from users where id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table tenants enable row level security;
alter table subscriptions enable row level security;
alter table stores enable row level security;
alter table users enable row level security;
alter table audit_logs enable row level security;
alter table plans enable row level security;

-- plans: catálogo público de leitura para qualquer usuário autenticado
create policy plans_select_authenticated on plans
  for select to authenticated using (true);

-- tenants: um usuário só enxerga o próprio tenant
create policy tenants_select_own on tenants
  for select to authenticated using (id = auth_tenant_id());

-- subscriptions: leitura restrita ao próprio tenant
create policy subscriptions_select_own on subscriptions
  for select to authenticated using (tenant_id = auth_tenant_id());

-- stores: CRUD restrito ao próprio tenant
create policy stores_select_own on stores
  for select to authenticated using (tenant_id = auth_tenant_id());
create policy stores_insert_own on stores
  for insert to authenticated with check (tenant_id = auth_tenant_id());
create policy stores_update_own on stores
  for update to authenticated using (tenant_id = auth_tenant_id()) with check (tenant_id = auth_tenant_id());

-- users: um usuário vê os colegas do mesmo tenant, nunca de outro
create policy users_select_own_tenant on users
  for select to authenticated using (tenant_id = auth_tenant_id());
create policy users_update_own_tenant on users
  for update to authenticated using (tenant_id = auth_tenant_id()) with check (tenant_id = auth_tenant_id());

-- audit_logs: leitura restrita ao próprio tenant, escrita via service role (backend)
create policy audit_logs_select_own on audit_logs
  for select to authenticated using (tenant_id = auth_tenant_id());

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('001', '001_foundation', array['-- applied via management API'])
on conflict (version) do nothing;
