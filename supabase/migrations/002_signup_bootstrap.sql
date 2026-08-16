-- Bootstrap atômico do primeiro acesso: cria tenant, assinatura trial,
-- loja principal e o registro users (role owner) para quem acabou de
-- se cadastrar via Supabase Auth. Chamada via RPC logo após signUp().

create or replace function create_tenant_for_new_user(
  p_tenant_name text,
  p_store_name text,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_store_id uuid;
  v_slug text;
  v_user_email text;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if exists (select 1 from users where id = auth.uid()) then
    raise exception 'Usuário já possui um tenant.';
  end if;

  select email into v_user_email from auth.users where id = auth.uid();

  v_slug := lower(regexp_replace(p_tenant_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 6);

  insert into tenants (name, slug) values (p_tenant_name, v_slug)
  returning id into v_tenant_id;

  insert into subscriptions (tenant_id, plan_id, status)
  values (v_tenant_id, 'basic', 'trialing');

  insert into stores (tenant_id, name, is_main)
  values (v_tenant_id, p_store_name, true)
  returning id into v_store_id;

  insert into users (id, tenant_id, store_id, role, full_name, email)
  values (auth.uid(), v_tenant_id, v_store_id, 'owner', p_full_name, v_user_email);

  insert into audit_logs (tenant_id, user_id, action, entity_type, entity_id, metadata)
  values (v_tenant_id, auth.uid(), 'tenant_created', 'tenant', v_tenant_id, jsonb_build_object('store_name', p_store_name));

  return v_tenant_id;
end;
$$;

grant execute on function create_tenant_for_new_user(text, text, text) to authenticated;

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('002', '002_signup_bootstrap', array['-- applied via management API'])
on conflict (version) do nothing;
