-- Fase 6: relatórios básicos. PostgREST não agrega bem group-by
-- complexo, então usamos funções SQL simples para os relatórios que
-- precisam somar por produto/vendedor/forma de pagamento.

create or replace function report_top_products(
  p_start timestamptz,
  p_end timestamptz,
  p_limit integer default 10
)
returns table (
  product_name text,
  color text,
  size text,
  quantity_sold bigint,
  revenue_cents bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.name,
    pv.color,
    pv.size,
    sum(si.quantity)::bigint as quantity_sold,
    sum(si.total_cents)::bigint as revenue_cents
  from sale_items si
  join sales s on s.id = si.sale_id
  join product_variants pv on pv.id = si.variant_id
  join products p on p.id = pv.product_id
  where s.tenant_id = auth_tenant_id()
    and s.status = 'completed'
    and s.created_at >= p_start
    and s.created_at < p_end
  group by p.name, pv.color, pv.size
  order by quantity_sold desc
  limit p_limit
$$;

grant execute on function report_top_products(timestamptz, timestamptz, integer) to authenticated;

create or replace function report_payment_methods(
  p_start timestamptz,
  p_end timestamptz
)
returns table (
  method payment_method,
  total_cents bigint,
  count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.method,
    sum(p.amount_cents)::bigint as total_cents,
    count(*)::bigint as count
  from payments p
  join sales s on s.id = p.sale_id
  where s.tenant_id = auth_tenant_id()
    and s.status = 'completed'
    and s.created_at >= p_start
    and s.created_at < p_end
  group by p.method
  order by total_cents desc
$$;

grant execute on function report_payment_methods(timestamptz, timestamptz) to authenticated;

create or replace function report_sales_by_seller(
  p_start timestamptz,
  p_end timestamptz
)
returns table (
  seller_name text,
  total_cents bigint,
  sale_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sl.full_name, 'Sem vendedor'),
    sum(s.total_cents)::bigint as total_cents,
    count(*)::bigint as sale_count
  from sales s
  left join sellers sl on sl.id = s.seller_id
  where s.tenant_id = auth_tenant_id()
    and s.status = 'completed'
    and s.created_at >= p_start
    and s.created_at < p_end
  group by sl.full_name
  order by total_cents desc
$$;

grant execute on function report_sales_by_seller(timestamptz, timestamptz) to authenticated;

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('014', '014_reports', array['-- applied via management API'])
on conflict (version) do nothing;
