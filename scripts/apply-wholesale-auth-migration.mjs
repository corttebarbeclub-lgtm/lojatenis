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

const MIGRATION_SQL = `
-- 1. Tabela de Clientes Atacadistas
create table if not exists wholesale_customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  company_name text,
  tax_id text not null, -- CPF ou CNPJ formatado ou apenas dígitos
  clean_tax_id text not null, -- apenas dígitos para busca exata
  phone text not null,
  email text,
  city text,
  state text default 'AM',
  monthly_volume text, -- Ex: '20 a 50 pares', '50 a 100 pares', '100+ pares'
  sales_channel text, -- Ex: 'Loja Física', 'E-commerce', 'Instagram/WhatsApp', 'Revenda'
  business_time text, -- Ex: 'Novo no ramo', '1 a 3 anos', 'Mais de 3 anos'
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  password_hash text,
  temp_password text, -- Senha temporária gerada no PDV antes da troca
  must_change_password boolean not null default true,
  notes text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_wholesale_customer_tax_tenant unique (tenant_id, clean_tax_id)
);

-- 2. Tabela de Alertas e Notificações do PDV
create table if not exists wholesale_notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid references wholesale_customers(id) on delete cascade,
  type text not null, -- 'new_application', 'forgot_password'
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_wholesale_customers_lookup on wholesale_customers(tenant_id, clean_tax_id, status);
create index if not exists idx_wholesale_notif_unread on wholesale_notifications(tenant_id, is_read, created_at desc);

-- 3. RPC: Submeter Solicitação de Acesso ao Atacado (Público)
create or replace function submit_wholesale_application(
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
  p_business_time text
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
      return jsonb_build_object('success', false, 'error', 'Este CPF/CNPJ já possui cadastro aprovado. Faça login ou solicite recuperação de senha.');
    elsif v_existing_status = 'pending' then
      return jsonb_build_object('success', true, 'message', 'Sua solicitação anterior já está em análise pela nossa equipe. Entraremos em contato via WhatsApp em breve.');
    end if;
  end if;

  -- Inserir ou atualizar solicitação
  insert into wholesale_customers (
    tenant_id, name, company_name, tax_id, clean_tax_id, phone, email,
    city, state, monthly_volume, sales_channel, business_time, status, must_change_password
  )
  values (
    v_tenant_id, p_name, p_company_name, p_tax_id, v_clean_tax_id, p_phone, p_email,
    p_city, coalesce(p_state, 'AM'), p_monthly_volume, p_sales_channel, p_business_time, 'pending', true
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
      status = 'pending',
      updated_at = now()
  returning id into v_customer_id;

  -- Inserir Notificação para o PDV
  insert into wholesale_notifications (tenant_id, customer_id, type, title, message)
  values (
    v_tenant_id,
    v_customer_id,
    'new_application',
    'Novo Atacadista Solicitando Acesso',
    coalesce(p_company_name, p_name) || ' (' || p_city || ') - Estimativa: ' || coalesce(p_monthly_volume, 'Não informado')
  );

  return jsonb_build_object(
    'success', true,
    'message', 'Solicitação enviada com sucesso! Seu cadastro será avaliado pela nossa equipe e sua senha enviada no WhatsApp ' || p_phone
  );
end;
$$;

-- 4. RPC: Autenticar Cliente Atacadista
create or replace function authenticate_wholesale_customer(
  p_slug text,
  p_tax_id text,
  p_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
  v_clean_tax_id text;
  v_customer record;
begin
  select id into v_tenant_id from tenants where slug = p_slug;
  if v_tenant_id is null then
    return jsonb_build_object('success', false, 'error', 'Loja não encontrada');
  end if;

  v_clean_tax_id := regexp_replace(p_tax_id, '[^0-9]', '', 'g');

  select * into v_customer
  from wholesale_customers
  where tenant_id = v_tenant_id and clean_tax_id = v_clean_tax_id;

  if v_customer.id is null then
    return jsonb_build_object('success', false, 'error', 'CPF ou CNPJ não encontrado no cadastro de atacado. Solicite seu acesso.');
  end if;

  if v_customer.status = 'pending' then
    return jsonb_build_object('success', false, 'error', 'Seu cadastro de atacadista ainda está em análise no PDV. Aguarde o envio da sua senha no WhatsApp.');
  end if;

  if v_customer.status = 'rejected' then
    return jsonb_build_object('success', false, 'error', 'Seu cadastro de atacado não foi aprovado. Entre em contato com a loja.');
  end if;

  -- Validar senha (senha temporária ou senha gravada)
  if (v_customer.temp_password is not null and v_customer.temp_password = p_password) or
     (v_customer.password_hash is not null and v_customer.password_hash = p_password) then
     
    return jsonb_build_object(
      'success', true,
      'customer', jsonb_build_object(
        'id', v_customer.id,
        'name', v_customer.name,
        'company_name', v_customer.company_name,
        'tax_id', v_customer.tax_id,
        'phone', v_customer.phone,
        'city', v_customer.city,
        'must_change_password', v_customer.must_change_password
      )
    );
  else
    return jsonb_build_object('success', false, 'error', 'Senha incorreta. Caso tenha esquecido, clique em "Esqueci minha senha".');
  end if;
end;
$$;

-- 5. RPC: Trocar Senha (Primeiro Acesso ou Alteração)
create or replace function change_wholesale_password(
  p_slug text,
  p_customer_id uuid,
  p_new_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
begin
  select id into v_tenant_id from tenants where slug = p_slug;

  if length(p_new_password) < 4 then
    return jsonb_build_object('success', false, 'error', 'A nova senha deve ter no mínimo 4 caracteres');
  end if;

  update wholesale_customers
  set password_hash = p_new_password,
      temp_password = null,
      must_change_password = false,
      updated_at = now()
  where id = p_customer_id and tenant_id = v_tenant_id;

  return jsonb_build_object('success', true, 'message', 'Senha alterada com sucesso! Bem-vindo ao Portal de Atacado.');
end;
$$;

-- 6. RPC: Solicitar Recuperação de Senha
create or replace function request_wholesale_password_reset(
  p_slug text,
  p_tax_id text,
  p_phone text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_tenant_id uuid;
  v_clean_tax_id text;
  v_customer record;
begin
  select id into v_tenant_id from tenants where slug = p_slug;
  v_clean_tax_id := regexp_replace(p_tax_id, '[^0-9]', '', 'g');

  select * into v_customer
  from wholesale_customers
  where tenant_id = v_tenant_id and clean_tax_id = v_clean_tax_id;

  if v_customer.id is null then
    return jsonb_build_object('success', false, 'error', 'CPF/CNPJ não localizado em nosso cadastro.');
  end if;

  -- Inserir Notificação Urgente para o PDV
  insert into wholesale_notifications (tenant_id, customer_id, type, title, message)
  values (
    v_tenant_id,
    v_customer.id,
    'forgot_password',
    'Recuperação de Senha de Atacadista',
    'O cliente ' || coalesce(v_customer.company_name, v_customer.name) || ' (' || v_customer.tax_id || ') esqueceu a senha e requer uma nova para WhatsApp: ' || p_phone
  );

  return jsonb_build_object(
    'success', true,
    'message', 'Solicitação de nova senha enviada para o PDV da loja! Nossa equipe irá gerar sua nova senha e enviar no seu WhatsApp.'
  );
end;
$$;

-- 7. RPC para o PDV: Obter Alertas e Notificações Pendentes
create or replace function get_wholesale_pdv_alerts(p_tenant_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_notifications jsonb;
  v_pending_customers jsonb;
begin
  -- Notificações não lidas
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', n.id,
      'type', n.type,
      'title', n.title,
      'message', n.message,
      'is_read', n.is_read,
      'created_at', n.created_at,
      'customer_id', n.customer_id,
      'customer_name', c.name,
      'company_name', c.company_name,
      'tax_id', c.tax_id,
      'phone', c.phone,
      'city', c.city,
      'monthly_volume', c.monthly_volume,
      'sales_channel', c.sales_channel,
      'business_time', c.business_time,
      'status', c.status
    ) order by n.created_at desc
  ), '[]'::jsonb)
  into v_notifications
  from wholesale_notifications n
  left join wholesale_customers c on c.id = n.customer_id
  where n.tenant_id = p_tenant_id and n.is_read = false;

  -- Clientes pendentes de aprovação
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'company_name', c.company_name,
      'tax_id', c.tax_id,
      'phone', c.phone,
      'email', c.email,
      'city', c.city,
      'monthly_volume', c.monthly_volume,
      'sales_channel', c.sales_channel,
      'business_time', c.business_time,
      'status', c.status,
      'created_at', c.created_at
    ) order by c.created_at desc
  ), '[]'::jsonb)
  into v_pending_customers
  from wholesale_customers c
  where c.tenant_id = p_tenant_id and c.status = 'pending';

  return jsonb_build_object(
    'notifications', v_notifications,
    'pending_customers', v_pending_customers,
    'unread_count', jsonb_array_length(v_notifications)
  );
end;
$$;

-- 8. RPC para o PDV: Aprovar Cadastro e Gerar Senha
create or replace function approve_wholesale_customer(
  p_tenant_id uuid,
  p_customer_id uuid,
  p_temp_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_cust record;
begin
  update wholesale_customers
  set status = 'approved',
      temp_password = p_temp_password,
      password_hash = p_temp_password,
      must_change_password = true,
      approved_at = now(),
      updated_at = now()
  where id = p_customer_id and tenant_id = p_tenant_id
  returning * into v_cust;

  -- Marcar notificações desse cliente como lidas
  update wholesale_notifications
  set is_read = true
  where tenant_id = p_tenant_id and customer_id = p_customer_id;

  return jsonb_build_object(
    'success', true,
    'customer', jsonb_build_object(
      'id', v_cust.id,
      'name', v_cust.name,
      'company_name', v_cust.company_name,
      'tax_id', v_cust.tax_id,
      'phone', v_cust.phone,
      'temp_password', p_temp_password
    )
  );
end;
$$;

-- 9. RPC para o PDV: Redefinir Senha de Atacadista
create or replace function reset_wholesale_customer_password(
  p_tenant_id uuid,
  p_customer_id uuid,
  p_temp_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_cust record;
begin
  update wholesale_customers
  set temp_password = p_temp_password,
      password_hash = p_temp_password,
      must_change_password = true,
      updated_at = now()
  where id = p_customer_id and tenant_id = p_tenant_id
  returning * into v_cust;

  update wholesale_notifications
  set is_read = true
  where tenant_id = p_tenant_id and customer_id = p_customer_id and type = 'forgot_password';

  return jsonb_build_object(
    'success', true,
    'customer', jsonb_build_object(
      'id', v_cust.id,
      'name', v_cust.name,
      'company_name', v_cust.company_name,
      'tax_id', v_cust.tax_id,
      'phone', v_cust.phone,
      'temp_password', p_temp_password
    )
  );
end;
$$;
`;

async function applyMigration() {
  console.log('🚀 Aplicando migration de Autenticação Atacado e Alertas no PDV...');
  await runSQL(MIGRATION_SQL);
  console.log('✅ Migrations e RPCs criadas com sucesso no Supabase!');
}

applyMigration().catch((err) => {
  console.error('❌ Erro na migration:', err);
  process.exit(1);
});
