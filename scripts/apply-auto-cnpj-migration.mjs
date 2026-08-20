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

const SQL = `
-- 1. Adicionar colunas para suporte a CNAE, Aprovação Automática e Verificação de E-mail
alter table wholesale_customers
  add column if not exists cnae_code text,
  add column if not exists cnae_description text,
  add column if not exists is_auto_approved boolean default false,
  add column if not exists email_verified boolean default false,
  add column if not exists email_verification_code text,
  add column if not exists email_code_expires_at timestamptz;

-- 2. RPC Aprimorada: Submeter Cadastro de Atacado com Suporte a Aprovação Automática para CNPJs de Calçados
create or replace function submit_wholesale_application_v2(
  p_slug text,
  p_name text,
  p_company_name text,
  p_tax_id text,
  p_phone text,
  p_email text,
  p_city text,
  p_state text,
  p_monthly_volume text,
  p_sales_channel text,
  p_business_time text,
  p_is_auto_approved boolean default false,
  p_cnae_code text default null,
  p_cnae_description text default null,
  p_temp_password text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
  v_clean_tax_id text;
  v_customer_id uuid;
  v_existing_status text;
  v_final_status text;
begin
  select id into v_tenant_id from tenants where slug = p_slug;
  if v_tenant_id is null then
    return jsonb_build_object('success', false, 'error', 'Loja não encontrada');
  end if;

  v_clean_tax_id := regexp_replace(p_tax_id, '[^0-9]', '', 'g');
  if length(v_clean_tax_id) < 11 then
    return jsonb_build_object('success', false, 'error', 'CPF ou CNPJ inválido');
  end if;

  -- Verificar se já existe cadastro
  select id, status into v_customer_id, v_existing_status
  from wholesale_customers
  where tenant_id = v_tenant_id and clean_tax_id = v_clean_tax_id;

  if v_customer_id is not null then
    if v_existing_status = 'approved' then
      return jsonb_build_object(
        'success', true,
        'already_approved', true,
        'message', 'Este CPF/CNPJ já possui cadastro aprovado! Você já pode fazer login no Portal de Atacado.'
      );
    end if;
  end if;

  -- Determinar status final
  if p_is_auto_approved = true and p_temp_password is not null then
    v_final_status := 'approved';
  else
    v_final_status := 'pending';
  end if;

  -- Inserir ou atualizar cliente atacadista
  insert into wholesale_customers (
    tenant_id, name, company_name, tax_id, clean_tax_id, phone, email,
    city, state, monthly_volume, sales_channel, business_time, status,
    is_auto_approved, cnae_code, cnae_description, temp_password, must_change_password,
    approved_at
  )
  values (
    v_tenant_id, p_name, p_company_name, p_tax_id, v_clean_tax_id, p_phone, p_email,
    p_city, coalesce(p_state, 'AM'), p_monthly_volume, p_sales_channel, p_business_time,
    v_final_status, p_is_auto_approved, p_cnae_code, p_cnae_description,
    p_temp_password, true,
    case when v_final_status = 'approved' then now() else null end
  )
  on conflict (tenant_id, clean_tax_id) do update
  set name = excluded.name,
      company_name = excluded.company_name,
      tax_id = excluded.tax_id,
      phone = excluded.phone,
      email = excluded.email,
      city = excluded.city,
      state = excluded.state,
      monthly_volume = excluded.monthly_volume,
      sales_channel = excluded.sales_channel,
      business_time = excluded.business_time,
      status = excluded.status,
      is_auto_approved = excluded.is_auto_approved,
      cnae_code = excluded.cnae_code,
      cnae_description = excluded.cnae_description,
      temp_password = coalesce(excluded.temp_password, wholesale_customers.temp_password),
      approved_at = case when excluded.status = 'approved' then now() else wholesale_customers.approved_at end,
      updated_at = now()
  returning id into v_customer_id;

  -- Inserir Notificação para o PDV
  if v_final_status = 'approved' then
    insert into wholesale_notifications (tenant_id, customer_id, type, title, message)
    values (
      v_tenant_id,
      v_customer_id,
      'new_application',
      '⚡ CNPJ APROVADO AUTOMATICAMENTE (CNAE Calçados)',
      coalesce(p_company_name, p_name) || ' (CNPJ: ' || p_tax_id || ') - CNAE: ' || coalesce(p_cnae_description, 'Comércio de Calçados')
    );
  else
    insert into wholesale_notifications (tenant_id, customer_id, type, title, message)
    values (
      v_tenant_id,
      v_customer_id,
      'new_application',
      'Novo Cadastro Pendente de Aprovação',
      coalesce(p_company_name, p_name) || ' (' || p_city || ') - Tipo: ' || case when length(v_clean_tax_id) = 14 then 'CNPJ (Análise Manual)' else 'CPF (Pessoa Física)' end
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'status', v_final_status,
    'is_auto_approved', p_is_auto_approved,
    'temp_password', p_temp_password,
    'customer_id', v_customer_id,
    'message', case
      when v_final_status = 'approved' then '🎉 CNPJ Verificado com Sucesso na Receita Federal! Seu acesso de atacado foi LIBERADO AUTOMATICAMENTE.'
      else 'Solicitação enviada com sucesso! Seu cadastro será avaliado pela nossa equipe e sua senha enviada no WhatsApp ' || p_phone
    end
  );
end;
$$;
`;

async function main() {
  console.log('Executando migration de CNPJ automático...');
  await runSQL(SQL);
  console.log('✅ Migration aplicada com sucesso!');
}

main().catch(console.error);
