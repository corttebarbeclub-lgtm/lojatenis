import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jmlxhsqfvxjggvqusleu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhoc3FmdnhqZ2d2cXVzbGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NTE3NDYsImV4cCI6MjEwMjQyNzc0Nn0.dAtippakVgVqweGjHD767ePPX9g7urzjDLLeT9WFsDQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('--- TESTANDO RPC get_storefront_tenant ---');
  const tenantRes = await supabase.rpc('get_storefront_tenant', { p_slug: 'tenisstore' });
  console.log('Tenant:', tenantRes);

  console.log('--- TESTANDO RPC get_storefront_products ---');
  const prodRes = await supabase.rpc('get_storefront_products', { p_slug: 'tenisstore' });
  console.log('Products status:', prodRes.error ? 'ERROR' : `OK (${prodRes.data?.length} itens)`);
  if (prodRes.error) console.error(prodRes.error);

  console.log('--- TESTANDO TABELA storefront_hero_banners ---');
  const bannerRes = await supabase.from('storefront_hero_banners').select('*').eq('is_active', true);
  console.log('Banners:', bannerRes);
}

test();
