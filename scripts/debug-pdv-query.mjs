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

async function debug() {
  const sql = `
    select
      pv.id,
      pv.color,
      pv.size,
      pv.sku,
      pv.barcode,
      pv.price_cents,
      p.name as product_name,
      b.name as brand_name,
      coalesce(inv.quantity, 0) as available_quantity,
      (
        select url from product_images pi
        where pi.product_id = p.id
        order by pi.position asc
        limit 1
      ) as image_url
    from product_variants pv
    join products p on p.id = pv.product_id
    left join brands b on b.id = p.brand_id
    left join inventory inv on inv.variant_id = pv.id
    where pv.tenant_id = (select id from tenants where slug = 'tenisstore')
      and pv.is_active = true
      and p.is_active = true
    order by p.name asc, pv.size asc
    limit 10;
  `;
  const result = await runSQL(sql);
  console.log('Resultado da query SQL direta:', result);
}

debug().catch(console.error);
