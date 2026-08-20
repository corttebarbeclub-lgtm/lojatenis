import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://jmlxhsqfvxjggvqusleu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhoc3FmdnhqZ2d2cXVzbGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg1MTc0NiwiZXhwIjoyMTAyNDI3NzQ2fQ.Gltxl_0sgDT7SGH6H5xM8xFQ1t5y8I-uiF48NUt-txE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixImages() {
  console.log('🔍 Verificando integridade das imagens do catálogo...');

  const realDir = path.resolve('public/products/real');
  const realFiles = fs.readdirSync(realDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
  console.log(`📁 Total de arquivos reais em public/products/real: ${realFiles.length}`);

  const availableUrls = realFiles.map(f => `/products/real/${f}`);

  const { data: products } = await supabase.from('products').select('id, name, tenant_id');
  const { data: currentImages } = await supabase.from('product_images').select('*');

  console.log(`📦 Produtos encontrados: ${products?.length || 0}`);
  console.log(`🖼️ Imagens cadastradas: ${currentImages?.length || 0}`);

  const imgMap = new Map();
  currentImages?.forEach(img => {
    imgMap.set(img.product_id, img);
  });

  let fixed = 0;

  for (let i = 0; i < (products?.length || 0); i++) {
    const prod = products[i];
    const existing = imgMap.get(prod.id);
    let valid = false;

    if (existing && existing.url) {
      const fullPath = path.resolve(`public${existing.url}`);
      if (fs.existsSync(fullPath)) {
        valid = true;
      }
    }

    if (!valid) {
      const assignedUrl = availableUrls[i % availableUrls.length];
      if (existing) {
        await supabase
          .from('product_images')
          .update({ url: assignedUrl })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('product_images')
          .insert({
            tenant_id: prod.tenant_id,
            product_id: prod.id,
            url: assignedUrl,
            position: 0,
            is_primary: true
          });
      }
      fixed++;
      console.log(`✅ Foto atribuída para [${prod.name}]: ${assignedUrl}`);
    }
  }

  console.log(`🎉 Sucesso! Total de produtos com foto 100% garantida: ${fixed}`);
}

fixImages();
