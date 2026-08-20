import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jmlxhsqfvxjggvqusleu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhoc3FmdnhqZ2d2cXVzbGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg1MTc0NiwiZXhwIjoyMTAyNDI3NzQ2fQ.Gltxl_0sgDT7SGH6H5xM8xFQ1t5y8I-uiF48NUt-txE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateBanners() {
  console.log('🔄 Atualizando banners para imagens reais de alta definição e frete R$ 15,00...');
  
  await supabase
    .from('storefront_hero_banners')
    .update({
      custom_image_url: '/products/real/WhatsApp Image 2026-08-19 at 03.51.23 (5).jpeg',
      subtitle: 'O clássico mundial do streetwear com grade completa do 34 ao 44 disponível a pronta entrega em Manaus com Frete R$ 15,00!',
      cta_text: 'Comprar Agora • Frete R$ 15,00',
      discount_badge_text: 'FRETE R$ 15,00 MANAUS'
    })
    .eq('title', 'ADIDAS SAMBA OG CLOUD WHITE');

  await supabase
    .from('storefront_hero_banners')
    .update({
      custom_image_url: '/products/real/WhatsApp Image 2026-08-19 at 03.54.09 (1).jpeg',
      title: 'NEW BALANCE 9060 DARK BROWN',
      subtitle: 'Camurça aveludada premium com pingente metálico exclusivo NB. Disponível a pronta entrega em Manaus!',
      cta_text: 'Comprar Agora • Ver Tamanhos',
      discount_badge_text: 'FRETE R$ 15,00 MANAUS'
    })
    .eq('badge_type', 'shipping');

  console.log('✅ Banners atualizados com sucesso!');
}

updateBanners();
