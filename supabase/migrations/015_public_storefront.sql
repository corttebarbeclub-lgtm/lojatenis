-- Fase 6: site público (vitrine, sem carrinho — carrinho é Fase 7).
-- Acesso anônimo é arriscado se feito via policy direta nas tabelas de
-- domínio (products/product_variants já têm RLS "to authenticated" —
-- adicionar uma policy "to anon" ali abriria a superfície inteira da
-- tabela pra qualquer campo que alguém adicionar no futuro, inclusive
-- sensível como custo). Em vez disso, uma função security definer
-- expõe só os campos necessários pra vitrine, com o tenant resolvido
-- pelo slug — nunca por tenant_id direto.

create or replace function get_storefront_tenant(p_slug text)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select id, name from tenants where slug = p_slug
$$;

grant execute on function get_storefront_tenant(text) to anon, authenticated;

create or replace function get_storefront_products(p_slug text)
returns table (
  product_id uuid,
  product_name text,
  brand_name text,
  category_name text,
  description text,
  gender product_gender,
  image_url text,
  min_price_cents integer,
  max_price_cents integer,
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
    bool_or(coalesce(i.quantity, 0) > 0)
  from products p
  join tenants t on t.id = p.tenant_id
  left join brands b on b.id = p.brand_id
  left join categories c on c.id = p.category_id
  join product_variants pv on pv.product_id = p.id and pv.is_active
  left join inventory i on i.variant_id = pv.id
  where t.slug = p_slug
    and p.is_active
  group by p.id, p.name, b.name, c.name, p.description, p.gender
  order by p.name
$$;

grant execute on function get_storefront_products(text) to anon, authenticated;

create or replace function get_storefront_product_detail(p_slug text, p_product_id uuid)
returns table (
  product_id uuid,
  product_name text,
  brand_name text,
  description text,
  gender product_gender,
  variant_id uuid,
  color text,
  size text,
  price_cents integer,
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
    p.description,
    p.gender,
    pv.id,
    pv.color,
    pv.size,
    pv.price_cents,
    coalesce(i.quantity, 0)::integer,
    (
      select array_agg(pi.url order by pi.is_primary desc, pi.position asc)
      from product_images pi
      where pi.product_id = p.id
    )
  from products p
  join tenants t on t.id = p.tenant_id
  left join brands b on b.id = p.brand_id
  join product_variants pv on pv.product_id = p.id and pv.is_active
  left join inventory i on i.variant_id = pv.id
  where t.slug = p_slug
    and p.id = p_product_id
    and p.is_active
  order by pv.color, pv.size
$$;

grant execute on function get_storefront_product_detail(text, uuid) to anon, authenticated;

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('015', '015_public_storefront', array['-- applied via management API'])
on conflict (version) do nothing;
