-- Achado em teste manual de RLS: a policy de product_variants/product_images
-- só valida que tenant_id = auth_tenant_id(), mas não valida que product_id
-- de fato pertence a esse mesmo tenant. Um usuário do tenant B conseguia
-- inserir uma variante com tenant_id = B mas product_id apontando para um
-- produto do tenant A — RLS sozinho não barra isso porque a comparação
-- é sempre dentro da própria linha inserida, nunca contra a tabela pai.
--
-- Trigger fecha essa brecha: valida em insert/update que tenant_id da
-- variante/imagem bate com o tenant_id do produto referenciado.

create or replace function check_product_tenant_consistency()
returns trigger
language plpgsql
as $$
declare
  v_product_tenant_id uuid;
begin
  select tenant_id into v_product_tenant_id from products where id = new.product_id;

  if v_product_tenant_id is null then
    raise exception 'Produto referenciado não existe.';
  end if;

  if v_product_tenant_id != new.tenant_id then
    raise exception 'tenant_id não corresponde ao tenant do produto referenciado.';
  end if;

  return new;
end;
$$;

create trigger product_variants_tenant_consistency
  before insert or update on product_variants
  for each row
  execute function check_product_tenant_consistency();

create trigger product_images_tenant_consistency
  before insert or update on product_images
  for each row
  execute function check_product_tenant_consistency();

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('006', '006_tenant_consistency_guard', array['-- applied via management API'])
on conflict (version) do nothing;
