-- Fase 2: catálogo de produtos — marcas, categorias, fornecedores,
-- produtos e variações (cor×tamanho). Sem estoque real ainda (Fase 3).

create table brands (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create index brands_tenant_id_idx on brands(tenant_id);

create table categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  parent_id uuid references categories(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create index categories_tenant_id_idx on categories(tenant_id);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create index suppliers_tenant_id_idx on suppliers(tenant_id);

create type product_gender as enum ('masculino', 'feminino', 'unissex', 'infantil');

create table products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  brand_id uuid references brands(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  gender product_gender,
  reference text,
  description text,
  ncm text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_tenant_id_idx on products(tenant_id);
create index products_brand_id_idx on products(brand_id);
create index products_category_id_idx on products(category_id);

-- Cada combinação vendável de cor+tamanho de um produto.
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  color text not null,
  size text not null,
  sku text,
  barcode text,
  cost_cents integer,
  price_cents integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, color, size)
);

create index product_variants_tenant_id_idx on product_variants(tenant_id);
create index product_variants_product_id_idx on product_variants(product_id);
create unique index product_variants_sku_idx on product_variants(tenant_id, sku) where sku is not null;
create unique index product_variants_barcode_idx on product_variants(tenant_id, barcode) where barcode is not null;

create table product_images (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  url text not null,
  position integer not null default 0,
  is_primary boolean not null default false,
  width integer,
  height integer,
  size_bytes integer,
  format text,
  created_at timestamptz not null default now()
);

create index product_images_tenant_id_idx on product_images(tenant_id);
create index product_images_product_id_idx on product_images(product_id);

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table brands enable row level security;
alter table categories enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;

create policy brands_all_own_tenant on brands
  for all to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy categories_all_own_tenant on categories
  for all to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy suppliers_all_own_tenant on suppliers
  for all to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy products_all_own_tenant on products
  for all to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy product_variants_all_own_tenant on product_variants
  for all to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

create policy product_images_all_own_tenant on product_images
  for all to authenticated
  using (tenant_id = auth_tenant_id())
  with check (tenant_id = auth_tenant_id());

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('004', '004_products', array['-- applied via management API'])
on conflict (version) do nothing;
