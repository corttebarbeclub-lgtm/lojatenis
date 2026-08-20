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

async function alignTenant() {
  console.log('🔄 Sincronizando usuário logado ao tenant HB Tênis Manaus...');

  const sql = `
    do $$
    declare
      v_tenant_id uuid;
      v_store_id uuid;
      v_user_id uuid;
    begin
      select id into v_tenant_id from tenants where slug = 'tenisstore';

      -- Garantir store
      select id into v_store_id from stores where tenant_id = v_tenant_id limit 1;
      if v_store_id is null then
        insert into stores (tenant_id, name, is_matrix)
        values (v_tenant_id, 'HB Tênis Manaus - Loja Principal', true)
        returning id into v_store_id;
      end if;

      -- Atualizar usuários para o tenant correto da HB Tênis Manaus
      update users
      set tenant_id = v_tenant_id,
          store_id = v_store_id
      where email = 'phabrycio@gmail.com' or role = 'owner';

      select id into v_user_id from users where tenant_id = v_tenant_id limit 1;

      -- Garantir registro de caixa aberto para o PDV
      if not exists (select 1 from cash_registers where tenant_id = v_tenant_id and status = 'open') then
        insert into cash_registers (tenant_id, store_id, opened_by, opening_balance_cents, status)
        values (v_tenant_id, v_store_id, v_user_id, 0, 'open');
      end if;

    end $$;
  `;

  await runSQL(sql);
  console.log('✅ Usuário, Loja e Caixa conectados com 100% de sucesso!');
}

alignTenant().catch(console.error);
