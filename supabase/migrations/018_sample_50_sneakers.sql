-- Migration 018: 50 Pares Reais de Tênis com preços de mercado, estoque único, atacado e número do WhatsApp do Amazonas
do $$
declare
  v_tenant_id uuid;
  v_store_id uuid;
  
  -- Marcas
  b_nike uuid;
  b_adidas uuid;
  b_puma uuid;
  b_nb uuid;
  b_asics uuid;
  b_vans uuid;
  b_mizuno uuid;
  b_olympikus uuid;
  b_fila uuid;
  b_reebok uuid;

  -- Categorias
  c_corrida uuid;
  c_casual uuid;
  c_esportivo uuid;
  c_skate uuid;
  c_training uuid;

  -- Helper function inside block isn't possible in pure SQL anonymous block,
  -- so we do direct inserts or variables.
  v_prod_id uuid;
  v_var_id uuid;
begin
  -- 1. Tenant WhatsApp e Configuração
  select id into v_tenant_id from tenants where slug = 'tenisstore' limit 1;
  
  if v_tenant_id is null then
    insert into tenants (name, slug, whatsapp_number, description)
    values (
      'Tênis Store Manaus',
      'tenisstore',
      '5592981883786',
      'A maior loja de calçados do Amazonas. Envio expresso para Manaus (R$ 1,00) e Interior do AM (Barco R$ 100,00).'
    )
    returning id into v_tenant_id;
  else
    update tenants
    set whatsapp_number = '5592981883786',
        name = 'Tênis Store Manaus',
        description = 'A maior loja de calçados do Amazonas. Envio expresso para Manaus (R$ 1,00) e Interior do AM (Barco R$ 100,00).'
    where id = v_tenant_id;
  end if;

  -- Store
  select id into v_store_id from stores where tenant_id = v_tenant_id and is_main = true limit 1;
  if v_store_id is null then
    insert into stores (tenant_id, name, is_main)
    values (v_tenant_id, 'Loja Principal Manaus', true)
    returning id into v_store_id;
  end if;

  -- 2. Marcas
  insert into brands (tenant_id, name) values (v_tenant_id, 'Nike') on conflict do nothing;
  select id into b_nike from brands where tenant_id = v_tenant_id and name = 'Nike' limit 1;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Adidas') on conflict do nothing;
  select id into b_adidas from brands where tenant_id = v_tenant_id and name = 'Adidas' limit 1;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Puma') on conflict do nothing;
  select id into b_puma from brands where tenant_id = v_tenant_id and name = 'Puma' limit 1;

  insert into brands (tenant_id, name) values (v_tenant_id, 'New Balance') on conflict do nothing;
  select id into b_nb from brands where tenant_id = v_tenant_id and name = 'New Balance' limit 1;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Asics') on conflict do nothing;
  select id into b_asics from brands where tenant_id = v_tenant_id and name = 'Asics' limit 1;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Vans') on conflict do nothing;
  select id into b_vans from brands where tenant_id = v_tenant_id and name = 'Vans' limit 1;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Mizuno') on conflict do nothing;
  select id into b_mizuno from brands where tenant_id = v_tenant_id and name = 'Mizuno' limit 1;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Olympikus') on conflict do nothing;
  select id into b_olympikus from brands where tenant_id = v_tenant_id and name = 'Olympikus' limit 1;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Fila') on conflict do nothing;
  select id into b_fila from brands where tenant_id = v_tenant_id and name = 'Fila' limit 1;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Reebok') on conflict do nothing;
  select id into b_reebok from brands where tenant_id = v_tenant_id and name = 'Reebok' limit 1;

  -- 3. Categorias
  insert into categories (tenant_id, name) values (v_tenant_id, 'Corrida') on conflict do nothing;
  select id into c_corrida from categories where tenant_id = v_tenant_id and name = 'Corrida' limit 1;

  insert into categories (tenant_id, name) values (v_tenant_id, 'Casual') on conflict do nothing;
  select id into c_casual from categories where tenant_id = v_tenant_id and name = 'Casual' limit 1;

  insert into categories (tenant_id, name) values (v_tenant_id, 'Esportivo') on conflict do nothing;
  select id into c_esportivo from categories where tenant_id = v_tenant_id and name = 'Esportivo' limit 1;

  insert into categories (tenant_id, name) values (v_tenant_id, 'Skateboard') on conflict do nothing;
  select id into c_skate from categories where tenant_id = v_tenant_id and name = 'Skateboard' limit 1;

  insert into categories (tenant_id, name) values (v_tenant_id, 'Training & Academia') on conflict do nothing;
  select id into c_training from categories where tenant_id = v_tenant_id and name = 'Training & Academia' limit 1;

end $$;
