import { readFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

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

async function main() {
  console.log('🚀 1. Copiando a foto real enviada para public/products/...');

  const publicProductsDir = 'd:\\Lojatenis\\public\\products';
  if (!existsSync(publicProductsDir)) {
    mkdirSync(publicProductsDir, { recursive: true });
  }

  const userImgPath = 'C:\\Users\\phabr\\.gemini\\antigravity-ide\\brain\\2eecb8ac-0cd2-4c76-9f06-bc78a02cd60b\\.user_uploaded\\media_1787126976913.jpg';
  const targetImgPath = path.join(publicProductsDir, 'adidas-superstar-slipon-1.jpg');

  copyFileSync(userImgPath, targetImgPath);
  console.log(`✅ Foto salva em ${targetImgPath}`);

  console.log('🧹 2. Zerando produtos de exemplo e limpando estoque antigo...');

  const resetSQL = `
    delete from inventory where tenant_id = (select id from tenants where slug = 'tenisstore');
    delete from product_images where tenant_id = (select id from tenants where slug = 'tenisstore');
    delete from product_variants where tenant_id = (select id from tenants where slug = 'tenisstore');
    delete from products where tenant_id = (select id from tenants where slug = 'tenisstore');
  `;
  await runSQL(resetSQL);
  console.log('✅ Estoque e produtos de exemplo removidos com sucesso!');

  console.log('👟 3. Cadastrando o modelo real: Adidas Originals Superstar Slip-On "Triple Black"...');

  const insertSQL = `
    do $$
    declare
      v_tenant_id uuid;
      v_brand_id uuid;
      v_category_id uuid;
      v_product_id uuid;
      v_sizes text[] := array['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
      v_size text;
      v_variant_id uuid;
    begin
      select id into v_tenant_id from tenants where slug = 'tenisstore';

      -- Marca Adidas
      select id into v_brand_id from brands where tenant_id = v_tenant_id and lower(name) = 'adidas';
      if v_brand_id is null then
        insert into brands (tenant_id, name) values (v_tenant_id, 'Adidas') returning id into v_brand_id;
      end if;

      -- Categoria Casual / Slip-On
      select id into v_category_id from categories where tenant_id = v_tenant_id and lower(name) = 'casual';
      if v_category_id is null then
        insert into categories (tenant_id, name) values (v_tenant_id, 'Casual') returning id into v_category_id;
      end if;

      -- Inserir Produto Real
      insert into products (
        tenant_id, brand_id, category_id, name, description, gender, is_active
      )
      values (
        v_tenant_id,
        v_brand_id,
        v_category_id,
        'Adidas Superstar Slip-On Triple Black',
        'O icônico Adidas Superstar Slip-On reinventa o clássico do basquete e da cultura streetwear com um design moderno sem cadarços. Confeccionado em cabedal têxtil/neoprene respirável com faixas elásticas cruzadas no mediopé para um calce firme e anatômico. Apresenta a lendária biqueira de borracha Shell Toe (concha) e solado de borracha texturizado para máxima tração, durabilidade e conforto no dia a dia.',
        'unissex'::product_gender,
        true
      )
      returning id into v_product_id;

      -- Inserir as 4 Fotos (Foto real enviada + 3 fotos de apoio com detalhes)
      insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary) values
      (v_tenant_id, v_product_id, 'products/adidas-slipon/1.jpg', '/products/adidas-superstar-slipon-1.jpg', 0, true),
      (v_tenant_id, v_product_id, 'products/adidas-slipon/2.jpg', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85', 1, false),
      (v_tenant_id, v_product_id, 'products/adidas-slipon/3.jpg', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85', 2, false),
      (v_tenant_id, v_product_id, 'products/adidas-slipon/4.jpg', 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85', 3, false);

      -- Inserir Variantes de numeração 34 ao 44 com 5 pares de estoque cada
      foreach v_size in array v_sizes
      loop
        insert into product_variants (
          tenant_id, product_id, color, size, sku, price_cents, cost_cents,
          wholesale_price_cents, wholesale_min_qty, is_active
        )
        values (
          v_tenant_id,
          v_product_id,
          'Preto Total (Core Black)',
          v_size,
          'ADI-SLIP-BLK-' || v_size,
          34990, -- R$ 349,90 no varejo
          16000, -- R$ 160,00 preço de custo
          23990, -- R$ 239,90 preço de atacado
          6,
          true
        )
        returning id into v_variant_id;

        -- 5 pares de estoque por numeração
        insert into inventory (tenant_id, variant_id, quantity, min_quantity)
        values (v_tenant_id, v_variant_id, 5, 2);
      end loop;

    end $$;
  `;

  await runSQL(insertSQL);
  console.log('✅ Adidas Superstar Slip-On Triple Black cadastrado com 5 pares por numeração (34 ao 44 = 55 pares no total)!');
}

main().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
