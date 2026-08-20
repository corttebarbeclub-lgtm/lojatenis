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

async function migrateCollaborators() {
  console.log('🚀 Criando estrutura de Colaboradores e Permissões Granulares...');

  const sql = `
    -- 1. Tabela de Colaboradores da Loja
    create table if not exists collaborators (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      store_id uuid references stores(id) on delete set null,
      name text not null,
      email text not null,
      phone text,
      role_profile text not null default 'restricted_sales', -- 'restricted_sales' | 'manager' | 'full_access'
      permissions jsonb not null default '[]'::jsonb,
      password_hash text not null default '123456',
      is_active boolean not null default true,
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );

    -- Índice único por email e tenant
    create unique index if not exists idx_collaborators_tenant_email on collaborators(tenant_id, lower(email));

    -- 2. Garantir vendedor padrão para o Dono
    do $$
    declare
      v_tenant_id uuid;
      v_owner_name text;
    begin
      select id into v_tenant_id from tenants where slug = 'tenisstore';
      select name into v_owner_name from tenants where id = v_tenant_id;

      if not exists (select 1 from sellers where tenant_id = v_tenant_id and full_name ilike '%Pabricio%') then
        insert into sellers (tenant_id, full_name, is_active)
        values (v_tenant_id, 'Pabricio (Dono)', true);
      end if;

      if not exists (select 1 from collaborators where tenant_id = v_tenant_id and email = 'phabrycio@gmail.com') then
        insert into collaborators (
          tenant_id, name, email, phone, role_profile, permissions, is_active
        )
        values (
          v_tenant_id,
          'Pabricio Dono(a)',
          'phabrycio@gmail.com',
          '92981883786',
          'full_access',
          '["pdv_sales", "view_stock", "manage_stock", "manage_products", "manage_customers", "view_revenue", "view_profits", "manage_wholesale", "manage_collaborators", "grant_discounts"]'::jsonb,
          true
        );
      end if;
    end $$;
  `;

  await runSQL(sql);
  console.log('✅ Estrutura de Colaboradores criada com sucesso!');
}

migrateCollaborators().catch(console.error);
