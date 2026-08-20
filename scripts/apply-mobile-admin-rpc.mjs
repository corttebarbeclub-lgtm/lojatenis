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

const SQL = `
-- 1. RPC: Relatório Financeiro com Lucro Bruto e Margem Real
create or replace function report_financial_profit(
  p_start timestamptz,
  p_end timestamptz
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
  v_total_revenue_cents bigint := 0;
  v_total_cost_cents bigint := 0;
  v_gross_profit_cents bigint := 0;
  v_profit_margin_pct numeric := 0;
  v_total_sales_count int := 0;
  v_total_pairs_sold int := 0;
begin
  select tenant_id into v_tenant_id from users where id = auth.uid();
  if v_tenant_id is null then
    select id into v_tenant_id from tenants where slug = 'tenisstore';
  end if;

  select
    coalesce(sum(s.total_cents), 0),
    count(s.id)
  into v_total_revenue_cents, v_total_sales_count
  from sales s
  where s.tenant_id = v_tenant_id
    and s.status = 'completed'
    and s.created_at between p_start and p_end;

  select
    coalesce(sum(si.quantity * coalesce(pv.cost_cents, pv.price_cents * 0.55)), 0),
    coalesce(sum(si.quantity), 0)
  into v_total_cost_cents, v_total_pairs_sold
  from sale_items si
  join sales s on s.id = si.sale_id
  join product_variants pv on pv.id = si.variant_id
  where s.tenant_id = v_tenant_id
    and s.status = 'completed'
    and s.created_at between p_start and p_end;

  v_gross_profit_cents := v_total_revenue_cents - v_total_cost_cents;

  if v_total_revenue_cents > 0 then
    v_profit_margin_pct := round((v_gross_profit_cents::numeric / v_total_revenue_cents::numeric) * 100, 1);
  else
    v_profit_margin_pct := 0;
  end if;

  return jsonb_build_object(
    'total_revenue_cents', v_total_revenue_cents,
    'total_cost_cents', v_total_cost_cents,
    'gross_profit_cents', v_gross_profit_cents,
    'profit_margin_pct', v_profit_margin_pct,
    'total_sales_count', v_total_sales_count,
    'total_pairs_sold', v_total_pairs_sold
  );
end;
$$;

-- 2. RPC: Cadastro Rápido de Novo Tênis com Grade e Saldo de Estoque Central
create or replace function quick_register_sneaker(
  p_tenant_id uuid,
  p_brand_name text,
  p_name text,
  p_category_name text,
  p_gender text,
  p_description text,
  p_color text,
  p_retail_price_cents int,
  p_cost_price_cents int,
  p_wholesale_price_cents int,
  p_wholesale_min_qty int,
  p_image_url text,
  p_sizes_grid jsonb -- Array de objetos: [{"size": "38", "quantity": 4}, {"size": "39", "quantity": 6}]
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_brand_id uuid;
  v_category_id uuid;
  v_product_id uuid;
  v_size_item jsonb;
  v_size text;
  v_qty int;
  v_variant_id uuid;
  v_sku text;
  v_total_stock int := 0;
  v_count int := 0;
begin
  -- 1. Resolver ou Criar Marca
  select id into v_brand_id from brands where tenant_id = p_tenant_id and lower(name) = lower(p_brand_name);
  if v_brand_id is null then
    insert into brands (tenant_id, name) values (p_tenant_id, p_brand_name) returning id into v_brand_id;
  end if;

  -- 2. Resolver ou Criar Categoria
  select id into v_category_id from categories where tenant_id = p_tenant_id and lower(name) = lower(p_category_name);
  if v_category_id is null then
    insert into categories (tenant_id, name) values (p_tenant_id, p_category_name) returning id into v_category_id;
  end if;

  -- 3. Inserir Produto
  insert into products (
    tenant_id, brand_id, category_id, name, description, gender, is_active
  )
  values (
    p_tenant_id, v_brand_id, v_category_id, p_name, p_description, coalesce(p_gender, 'unissex')::product_gender, true
  )
  returning id into v_product_id;

  -- 4. Inserir Foto Principal se informada
  if p_image_url is not null and length(trim(p_image_url)) > 0 then
    insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
    values (p_tenant_id, v_product_id, 'products/' || v_product_id || '/main.jpg', p_image_url, 0, true);
  end if;

  -- 5. Iterar sobre a grade de tamanhos e criar variantes + estoque
  for v_size_item in select * from jsonb_array_elements(p_sizes_grid)
  loop
    v_size := v_size_item->>'size';
    v_qty := coalesce((v_size_item->>'quantity')::int, 0);
    v_sku := upper(substring(regexp_replace(p_brand_name, '[^A-Za-z0-9]', '', 'g') from 1 for 3)) || '-' ||
             upper(substring(regexp_replace(p_name, '[^A-Za-z0-9]', '', 'g') from 1 for 3)) || '-' ||
             v_size || '-' || to_char(now(), 'MIssMS');

    insert into product_variants (
      tenant_id, product_id, color, size, sku, price_cents, cost_cents,
      wholesale_price_cents, wholesale_min_qty, is_active
    )
    values (
      p_tenant_id, v_product_id, p_color, v_size, v_sku, p_retail_price_cents, p_cost_price_cents,
      coalesce(p_wholesale_price_cents, p_retail_price_cents), coalesce(p_wholesale_min_qty, 6), true
    )
    returning id into v_variant_id;

    -- Inserir Saldo no Estoque Único
    insert into inventory (tenant_id, variant_id, quantity, min_quantity)
    values (p_tenant_id, v_variant_id, v_qty, 2);

    v_total_stock := v_total_stock + v_qty;
    v_count := v_count + 1;
  end loop;

  return jsonb_build_object(
    'success', true,
    'product_id', v_product_id,
    'product_name', p_name,
    'variants_created', v_count,
    'total_stock_added', v_total_stock,
    'message', 'Tênis "' || p_name || '" cadastrado com sucesso com ' || v_total_stock || ' pares no estoque!'
  );
end;
$$;
`;

async function applyRPC() {
  console.log('🚀 Aplicando RPCs de Lucro Financeiro e Cadastro Rápido Mobile de Tênis...');
  await runSQL(SQL);
  console.log('✅ RPCs instaladas com sucesso no Supabase!');
}

applyRPC().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
