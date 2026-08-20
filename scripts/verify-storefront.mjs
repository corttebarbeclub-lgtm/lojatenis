import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jmlxhsqfvxjggvqusleu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhoc3FmdnhqZ2d2cXVzbGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg1MTc0NiwiZXhwIjoyMTAyNDI3NzQ2fQ.Gltxl_0sgDT7SGH6H5xM8xFQ1t5y8I-uiF48NUt-txE';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function test() {
  const { data: retail } = await supabase.rpc('get_storefront_products', { p_slug: 'tenisstore' });
  console.log(`Varejo: ${retail?.length} produtos carregados`);
  
  const { data: wholesale } = await supabase.rpc('get_wholesale_products', { p_slug: 'tenisstore' });
  console.log(`Atacado: ${wholesale?.length} produtos carregados`);

  if (retail && retail.length > 0) {
    const first = retail[0];
    console.log(`Exemplo 1: ${first.product_name} (${first.brand_name}) - Varejo: R$ ${(first.min_price_cents/100).toFixed(2)} - ID: ${first.product_id}`);
    
    // Test product detail
    const { data: retailDetail } = await supabase.rpc('get_storefront_product_detail', { p_slug: 'tenisstore', p_product_id: first.product_id });
    console.log(`Varejo detalhe: ${retailDetail?.length} variantes carregadas`);
    
    const { data: wholesaleDetail } = await supabase.rpc('get_wholesale_product_detail', { p_slug: 'tenisstore', p_product_id: first.product_id });
    console.log(`Atacado detalhe: ${wholesaleDetail?.length} variantes com preço atacado carregadas`);
  }
}

test();
