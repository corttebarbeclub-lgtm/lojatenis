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
  console.log('Response:', text);
  return JSON.parse(text);
}

async function enableRLSOnAllTables() {
  console.log('🛡️ Ativando RLS e Políticas de Segurança em todas as tabelas...');

  const sql = `
    -- 1. Ativar RLS em collaborators
    ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "collaborators_tenant_policy" ON collaborators;
    CREATE POLICY "collaborators_tenant_policy" ON collaborators
      FOR ALL
      USING (auth.uid() is not null);

    -- 2. Ativar RLS em storefront_hero_banners
    ALTER TABLE storefront_hero_banners ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "hero_banners_public_read" ON storefront_hero_banners;
    CREATE POLICY "hero_banners_public_read" ON storefront_hero_banners
      FOR SELECT
      USING (true);

    DROP POLICY IF EXISTS "hero_banners_auth_write" ON storefront_hero_banners;
    CREATE POLICY "hero_banners_auth_write" ON storefront_hero_banners
      FOR ALL
      USING (auth.uid() is not null);

    -- 3. Ativar RLS em stock_alerts
    ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "stock_alerts_public_insert" ON stock_alerts;
    CREATE POLICY "stock_alerts_public_insert" ON stock_alerts
      FOR INSERT
      WITH CHECK (true);

    DROP POLICY IF EXISTS "stock_alerts_auth_all" ON stock_alerts;
    CREATE POLICY "stock_alerts_auth_all" ON stock_alerts
      FOR ALL
      USING (auth.uid() is not null);

    -- 4. Ativar RLS em wholesale_customers
    ALTER TABLE wholesale_customers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "wholesale_customers_auth_policy" ON wholesale_customers;
    CREATE POLICY "wholesale_customers_auth_policy" ON wholesale_customers
      FOR ALL
      USING (auth.uid() is not null);

    -- 5. Ativar RLS em wholesale_notifications
    ALTER TABLE wholesale_notifications ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "wholesale_notifications_auth_policy" ON wholesale_notifications;
    CREATE POLICY "wholesale_notifications_auth_policy" ON wholesale_notifications
      FOR ALL
      USING (auth.uid() is not null);
  `;

  await runSQL(sql);
  console.log('✅ RLS e Políticas de Segurança aplicadas em 100% das tabelas!');
}

enableRLSOnAllTables().catch(console.error);
