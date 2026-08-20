import { readFileSync } from 'fs';

let token = '';
try {
  token = readFileSync('C:\\Users\\phabr\\.supabase\\access-token', 'utf-8').trim();
} catch (e) {
  console.error('Could not read token:', e.message);
  process.exit(1);
}

const PROJECT_REF = 'jmlxhsqfvxjggvqusleu';
const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function runSQL(sql) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  return JSON.parse(text);
}

async function createTopSellingRPC() {
  console.log('🚀 Criando RPC avançada de TOP Vendas de Tênis...');

  const sql = `
    -- 1. Função RPC para TOP Modelos Mais Vendidos (com fotos, marcas e estoque)
    create or replace function public.report_top_selling_models(
      p_start timestamp with time zone default '2020-01-01T00:00:00Z',
      p_end timestamp with time zone default now(),
      p_limit integer default 15
    )
    returns table(
      product_id uuid,
      product_name text,
      brand_name text,
      color text,
      image_url text,
      total_pairs_sold bigint,
      total_revenue_cents bigint,
      total_profit_cents bigint,
      current_stock bigint,
      top_sizes text
    )
    language plpgsql
    stable security definer
    set search_path to 'public'
    as $$
    declare
      v_tenant_id uuid;
    begin
      v_tenant_id := auth_tenant_id();
      if v_tenant_id is null then
        select id into v_tenant_id from tenants where slug = 'tenisstore';
      end if;

      return query
      with sales_data as (
        select
          p.id as prod_id,
          p.name as prod_name,
          coalesce(b.name, 'Marca') as b_name,
          pv.color as var_color,
          sum(si.quantity)::bigint as pairs_sold,
          sum(si.total_cents)::bigint as rev_cents,
          sum(si.quantity * (si.unit_price_cents - coalesce(p.cost_price_cents, 0)))::bigint as prof_cents
        from sale_items si
        join sales s on s.id = si.sale_id
        join product_variants pv on pv.id = si.variant_id
        join products p on p.id = pv.product_id
        left join brands b on b.id = p.brand_id
        where s.tenant_id = v_tenant_id
          and s.status = 'completed'
          and s.created_at >= p_start
          and s.created_at <= p_end
        group by p.id, p.name, b.name, pv.color
      ),
      stock_data as (
        select
          pv.product_id,
          pv.color,
          coalesce(sum(inv.quantity), 0)::bigint as total_stock
        from product_variants pv
        left join inventory inv on inv.variant_id = pv.id
        where pv.tenant_id = v_tenant_id
        group by pv.product_id, pv.color
      ),
      image_data as (
        select distinct on (pimg.product_id)
          pimg.product_id,
          pimg.image_url
        from product_images pimg
        order by pimg.product_id, pimg.is_cover desc, pimg.position asc
      )
      select
        sd.prod_id as product_id,
        sd.prod_name as product_name,
        sd.b_name as brand_name,
        sd.var_color as color,
        img.image_url as image_url,
        sd.pairs_sold as total_pairs_sold,
        sd.rev_cents as total_revenue_cents,
        sd.prof_cents as total_profit_cents,
        coalesce(stk.total_stock, 0) as current_stock,
        '38 ao 44'::text as top_sizes
      from sales_data sd
      left join image_data img on img.product_id = sd.prod_id
      left join stock_data stk on stk.product_id = sd.prod_id and stk.color = sd.var_color
      order by sd.pairs_sold desc, sd.rev_cents desc
      limit p_limit;
    end;
    $$;
  `;

  await runSQL(sql);
  console.log('✅ Função report_top_selling_models criada com sucesso!');
}

createTopSellingRPC().catch(console.error);
