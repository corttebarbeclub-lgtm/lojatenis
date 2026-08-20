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
  return JSON.parse(await resp.text());
}

async function fixTriggers() {
  console.log('🚀 Atualizando triggers de consistência para permitir pedidos online...');

  const sql = `
    CREATE OR REPLACE FUNCTION public.check_cash_register_tenant_consistency()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    declare
      v_cr_tenant_id uuid;
    begin
      -- Permitir nulo para pedidos da loja virtual/e-commerce
      if new.cash_register_id is null then
        return new;
      end if;

      select tenant_id into v_cr_tenant_id from cash_registers where id = new.cash_register_id;
      if v_cr_tenant_id is null or v_cr_tenant_id != new.tenant_id then
        raise exception 'Caixa referenciado não existe ou não pertence a este tenant.';
      end if;
      return new;
    end;
    $function$;

    CREATE OR REPLACE FUNCTION public.check_store_tenant_consistency()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    declare
      v_store_tenant_id uuid;
    begin
      if new.store_id is null then
        return new;
      end if;

      select tenant_id into v_store_tenant_id from stores where id = new.store_id;
      if v_store_tenant_id is null or v_store_tenant_id != new.tenant_id then
        raise exception 'Loja referenciada não existe ou não pertence a este tenant.';
      end if;
      return new;
    end;
    $function$;
  `;

  await runSQL(sql);
  console.log('✅ Triggers atualizados com sucesso!');
}

fixTriggers().catch(console.error);
