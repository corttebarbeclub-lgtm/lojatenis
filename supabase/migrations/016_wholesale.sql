-- Fase 7: suporte a atacado (wholesale) e WhatsApp do lojista.
-- Adiciona preço de atacado e quantidade mínima nas variantes,
-- número de WhatsApp no tenant (para CTA nas vitrines), e
-- funções security definer para o catálogo de atacado (acesso anon).

-- ---------------------------------------------------------------------------
-- 1. WhatsApp no tenant
-- ---------------------------------------------------------------------------

alter table tenants
  add column if not exists whatsapp_number text,
  add column if not exists logo_url text,
  add column if not exists description text;

-- ---------------------------------------------------------------------------
-- 2. Campos de atacado nas variantes
-- ---------------------------------------------------------------------------

alter table product_variants
  add column if not exists wholesale_price_cents integer,
  add column if not exists wholesale_min_qty integer not null default 6;

-- wholesale_price_cents null = produto não disponível no atacado
-- wholesale_min_qty: quantidade mínima do kit (padrão 6 pares)

comment on column product_variants.wholesale_price_cents
  is 'Preço de revenda em centavos. NULL = não vendido no atacado.';

comment on column product_variants.wholesale_min_qty
  is 'Quantidade mínima do pedido de atacado para esta variante.';

-- ---------------------------------------------------------------------------
-- 3. Função: listagem de produtos no catálogo de atacado
-- ---------------------------------------------------------------------------

create or replace function get_wholesale_products(p_slug text)
returns table (
  product_id uuid,
  product_name text,
  brand_name text,
  category_name text,
  description text,
  gender product_gender,
  image_url text,
  min_retail_price_cents integer,
  max_retail_price_cents integer,
  min_wholesale_price_cents integer,
  max_wholesale_price_cents integer,
  wholesale_min_qty integer,
  has_stock boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    b.name,
    c.name,
    p.description,
    p.gender,
    (
      select pi.url from product_images pi
      where pi.product_id = p.id
      order by pi.is_primary desc, pi.position asc
      limit 1
    ),
    min(pv.price_cents)::integer,
    max(pv.price_cents)::integer,
    min(pv.wholesale_price_cents)::integer,
    max(pv.wholesale_price_cents)::integer,
    min(pv.wholesale_min_qty)::integer,
    bool_or(coalesce(i.quantity, 0) > 0)
  from products p
  join tenants t on t.id = p.tenant_id
  left join brands b on b.id = p.brand_id
  left join categories c on c.id = p.category_id
  join product_variants pv on pv.product_id = p.id and pv.is_active
    and pv.wholesale_price_cents is not null
  left join inventory i on i.variant_id = pv.id
  where t.slug = p_slug
    and p.is_active
  group by p.id, p.name, b.name, c.name, p.description, p.gender
  order by p.name
$$;

grant execute on function get_wholesale_products(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Função: detalhe de produto no catálogo de atacado
-- ---------------------------------------------------------------------------

create or replace function get_wholesale_product_detail(p_slug text, p_product_id uuid)
returns table (
  product_id uuid,
  product_name text,
  brand_name text,
  category_name text,
  description text,
  gender product_gender,
  variant_id uuid,
  color text,
  size text,
  retail_price_cents integer,
  wholesale_price_cents integer,
  wholesale_min_qty integer,
  quantity integer,
  image_urls text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    b.name,
    c.name,
    p.description,
    p.gender,
    pv.id,
    pv.color,
    pv.size,
    pv.price_cents,
    pv.wholesale_price_cents,
    pv.wholesale_min_qty,
    coalesce(i.quantity, 0)::integer,
    (
      select array_agg(pi.url order by pi.is_primary desc, pi.position asc)
      from product_images pi
      where pi.product_id = p.id
    )
  from products p
  join tenants t on t.id = p.tenant_id
  left join brands b on b.id = p.brand_id
  left join categories c on c.id = p.category_id
  join product_variants pv on pv.product_id = p.id and pv.is_active
    and pv.wholesale_price_cents is not null
  left join inventory i on i.variant_id = pv.id
  where t.slug = p_slug
    and p.id = p_product_id
    and p.is_active
  order by pv.color, pv.size
$$;

grant execute on function get_wholesale_product_detail(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Expõe whatsapp_number do tenant para a vitrine (sem dados sensíveis)
-- ---------------------------------------------------------------------------

drop function if exists get_storefront_tenant(text);

create or replace function get_storefront_tenant(p_slug text)
returns table (id uuid, name text, whatsapp_number text, logo_url text, description text)
language sql
stable
security definer
set search_path = public
as $$
  select id, name, whatsapp_number, logo_url, description from tenants where slug = p_slug
$$;

grant execute on function get_storefront_tenant(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Registro da migration
-- ---------------------------------------------------------------------------

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('016', '016_wholesale', array['-- applied via management API'])
on conflict (version) do nothing;
