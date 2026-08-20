import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLines = fs.readFileSync('.env.local', 'utf8').split('\n');
const env = {};
envLines.forEach((l) => {
  const parts = l.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient('https://jmlxhsqfvxjggvqusleu.supabase.co', env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase.rpc('get_storefront_products', { p_slug: 'tenisstore' });
  const inStock = (data || []).filter((p) => p.has_stock);
  console.log('Total produtos:', data?.length);
  console.log('Produtos em estoque (has_stock = true):', inStock.length);
  console.log(
    'Amostra com estoque:',
    inStock.slice(0, 5).map((p) => ({
      id: p.product_id,
      name: p.product_name,
      brand: p.brand_name,
      price: (p.min_price_cents / 100).toFixed(2),
      image: p.image_url,
    }))
  );
}

check();
