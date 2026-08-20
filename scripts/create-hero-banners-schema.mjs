import { readFileSync } from 'fs';

let token = readFileSync('C:\\Users\\phabr\\.supabase\\access-token', 'utf-8').trim();
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
  if (!resp.ok) throw new Error(text);
  return JSON.parse(text);
}

async function createHeroSchema() {
  console.log('🚀 Criando tabela de Hero Banners no Supabase...');

  const sql = `
    -- 1. Tabela de Hero Banners Configuráveis da Loja
    create table if not exists storefront_hero_banners (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      title text not null,
      subtitle text,
      tag text default '🔥 DESTAQUE EM ESTOQUE',
      badge_type text default 'drop', -- 'promo' | 'shipping' | 'drop' | 'exclusive'
      discount_badge_text text,
      product_id uuid references products(id) on delete set null,
      custom_image_url text,
      bg_theme text default 'gold_amber', -- 'gold_amber' | 'crimson_red' | 'cyber_cyan' | 'emerald_green' | 'dark_purple'
      cta_text text default 'Comprar Agora • Ver Tamanhos',
      cta_link text,
      is_active boolean default true,
      position int default 0,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create index if not exists idx_hero_banners_tenant on storefront_hero_banners(tenant_id, is_active, position);

    -- 2. Inserir banner inicial baseado no estoque real se a tabela estiver vazia
    DO $$
    DECLARE
      v_tenant_id uuid;
      v_product_id uuid;
      v_product_name text;
      v_img text;
    BEGIN
      SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'tenisstore' LIMIT 1;
      
      IF v_tenant_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM storefront_hero_banners WHERE tenant_id = v_tenant_id) THEN
        -- Buscar o primeiro tênis com foto e estoque
        SELECT p.id, p.name, pi.url INTO v_product_id, v_product_name, v_img
        FROM products p
        JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
        WHERE p.tenant_id = v_tenant_id AND p.is_active = true
        LIMIT 1;

        IF v_product_id IS NOT NULL THEN
          INSERT INTO storefront_hero_banners (
            tenant_id,
            title,
            subtitle,
            tag,
            badge_type,
            discount_badge_text,
            product_id,
            custom_image_url,
            bg_theme,
            cta_text,
            cta_link,
            is_active,
            position
          ) VALUES (
            v_tenant_id,
            v_product_name,
            'Disponível a pronta entrega em Manaus com frete expresso por apenas R$ 1,00 ou envio para todo o Amazonas.',
            '🔥 DESTAQUE EM ESTOQUE',
            'shipping',
            'FRETE R$ 1,00 MANAUS',
            v_product_id,
            v_img,
            'gold_amber',
            'Comprar Agora • Ver Tamanhos',
            '/loja/tenisstore/produto/' || v_product_id,
            true,
            0
          );
        END IF;
      END IF;
    END $$;
  `;

  await runSQL(sql);
  console.log('✅ Tabela storefront_hero_banners criada e populada com sucesso!');
}

createHeroSchema().catch(console.error);
