-- Fase 7: dados de exemplo — 20 modelos de tênis com variações completas.
-- ATENÇÃO: este script cria um tenant de demonstração 'lojaexemplo'.
-- Para usar com seu tenant real, substitua o tenant_id abaixo pelo seu.
-- As imagens usam picsum.photos (URLs públicas, sem necessidade de Storage).

do $$
declare
  v_tenant_id uuid;
  v_store_id uuid;
  v_brand_nike uuid;
  v_brand_adidas uuid;
  v_brand_puma uuid;
  v_brand_nb uuid;
  v_brand_asics uuid;
  v_brand_vans uuid;
  v_brand_reebok uuid;
  v_brand_skechers uuid;
  v_cat_corrida uuid;
  v_cat_casual uuid;
  v_cat_esportivo uuid;
  v_cat_skateboard uuid;
  v_cat_training uuid;
  -- product ids
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  p6 uuid; p7 uuid; p8 uuid; p9 uuid; p10 uuid;
  p11 uuid; p12 uuid; p13 uuid; p14 uuid; p15 uuid;
  p16 uuid; p17 uuid; p18 uuid; p19 uuid; p20 uuid;
begin

  -- -------------------------------------------------------------------------
  -- Tenant de demonstração
  -- -------------------------------------------------------------------------
  insert into tenants (id, name, slug, whatsapp_number, description)
  values (
    gen_random_uuid(),
    'Tênis Store Demo',
    'tenisstore',
    '5511999999999',
    'Os melhores tênis das maiores marcas do mundo, direto para você.'
  )
  on conflict (slug) do update set
    whatsapp_number = excluded.whatsapp_number,
    description = excluded.description
  returning id into v_tenant_id;

  -- Loja principal
  insert into stores (id, tenant_id, name, is_main)
  values (gen_random_uuid(), v_tenant_id, 'Loja Principal', true)
  on conflict do nothing
  returning id into v_store_id;

  if v_store_id is null then
    select id into v_store_id from stores where tenant_id = v_tenant_id limit 1;
  end if;

  -- Plano básico
  insert into subscriptions (tenant_id, plan_id, status)
  values (v_tenant_id, 'basic', 'active')
  on conflict (tenant_id) do nothing;

  -- -------------------------------------------------------------------------
  -- Marcas
  -- -------------------------------------------------------------------------
  insert into brands (tenant_id, name) values (v_tenant_id, 'Nike') on conflict do nothing returning id into v_brand_nike;
  if v_brand_nike is null then select id into v_brand_nike from brands where tenant_id = v_tenant_id and name = 'Nike'; end if;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Adidas') on conflict do nothing returning id into v_brand_adidas;
  if v_brand_adidas is null then select id into v_brand_adidas from brands where tenant_id = v_tenant_id and name = 'Adidas'; end if;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Puma') on conflict do nothing returning id into v_brand_puma;
  if v_brand_puma is null then select id into v_brand_puma from brands where tenant_id = v_tenant_id and name = 'Puma'; end if;

  insert into brands (tenant_id, name) values (v_tenant_id, 'New Balance') on conflict do nothing returning id into v_brand_nb;
  if v_brand_nb is null then select id into v_brand_nb from brands where tenant_id = v_tenant_id and name = 'New Balance'; end if;

  insert into brands (tenant_id, name) values (v_tenant_id, 'ASICS') on conflict do nothing returning id into v_brand_asics;
  if v_brand_asics is null then select id into v_brand_asics from brands where tenant_id = v_tenant_id and name = 'ASICS'; end if;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Vans') on conflict do nothing returning id into v_brand_vans;
  if v_brand_vans is null then select id into v_brand_vans from brands where tenant_id = v_tenant_id and name = 'Vans'; end if;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Reebok') on conflict do nothing returning id into v_brand_reebok;
  if v_brand_reebok is null then select id into v_brand_reebok from brands where tenant_id = v_tenant_id and name = 'Reebok'; end if;

  insert into brands (tenant_id, name) values (v_tenant_id, 'Skechers') on conflict do nothing returning id into v_brand_skechers;
  if v_brand_skechers is null then select id into v_brand_skechers from brands where tenant_id = v_tenant_id and name = 'Skechers'; end if;

  -- -------------------------------------------------------------------------
  -- Categorias
  -- -------------------------------------------------------------------------
  insert into categories (tenant_id, name) values (v_tenant_id, 'Corrida') on conflict do nothing returning id into v_cat_corrida;
  if v_cat_corrida is null then select id into v_cat_corrida from categories where tenant_id = v_tenant_id and name = 'Corrida'; end if;

  insert into categories (tenant_id, name) values (v_tenant_id, 'Casual') on conflict do nothing returning id into v_cat_casual;
  if v_cat_casual is null then select id into v_cat_casual from categories where tenant_id = v_tenant_id and name = 'Casual'; end if;

  insert into categories (tenant_id, name) values (v_tenant_id, 'Esportivo') on conflict do nothing returning id into v_cat_esportivo;
  if v_cat_esportivo is null then select id into v_cat_esportivo from categories where tenant_id = v_tenant_id and name = 'Esportivo'; end if;

  insert into categories (tenant_id, name) values (v_tenant_id, 'Skateboard') on conflict do nothing returning id into v_cat_skateboard;
  if v_cat_skateboard is null then select id into v_cat_skateboard from categories where tenant_id = v_tenant_id and name = 'Skateboard'; end if;

  insert into categories (tenant_id, name) values (v_tenant_id, 'Training') on conflict do nothing returning id into v_cat_training;
  if v_cat_training is null then select id into v_cat_training from categories where tenant_id = v_tenant_id and name = 'Training'; end if;

  -- =========================================================================
  -- PRODUTOS (20 modelos)
  -- =========================================================================

  -- 1. Nike Air Max 90
  p1 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p1, v_tenant_id, 'Nike Air Max 90', v_brand_nike, v_cat_casual, 'masculino', 'NK-AM90-001',
    'Ícone do streetwear desde 1990. A unidade Air Max no calcanhar entrega amortecimento incomparável para o dia a dia. Cabedal em mesh respirável com sobreposições de couro sintético. Sola de borracha com padrão waffle para tração em qualquer superfície.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p1, 'Branco/Vermelho', '40', 'AM90-BR-40', 89900, 62900, 6),
    (v_tenant_id, p1, 'Branco/Vermelho', '41', 'AM90-BR-41', 89900, 62900, 6),
    (v_tenant_id, p1, 'Branco/Vermelho', '42', 'AM90-BR-42', 89900, 62900, 6),
    (v_tenant_id, p1, 'Preto/Cinza', '40', 'AM90-PC-40', 89900, 62900, 6),
    (v_tenant_id, p1, 'Preto/Cinza', '41', 'AM90-PC-41', 89900, 62900, 6),
    (v_tenant_id, p1, 'Preto/Cinza', '42', 'AM90-PC-42', 89900, 62900, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values
    (v_tenant_id, p1, 'demo/p1-1.jpg', 'https://picsum.photos/seed/airmax90a/600/600', 0, true),
    (v_tenant_id, p1, 'demo/p1-2.jpg', 'https://picsum.photos/seed/airmax90b/600/600', 1, false);

  -- 2. Nike Air Force 1
  p2 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p2, v_tenant_id, 'Nike Air Force 1 Low', v_brand_nike, v_cat_casual, 'unissex', 'NK-AF1-001',
    'O tênis mais vendido de todos os tempos. Cabedal em couro premium de corte baixo com unidade Air Max no calcanhar. Estilo clean e versátil que combina com qualquer look. Sola de borracha resistente e durável.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p2, 'Triple White', '37', 'AF1-TW-37', 79900, 55900, 6),
    (v_tenant_id, p2, 'Triple White', '38', 'AF1-TW-38', 79900, 55900, 6),
    (v_tenant_id, p2, 'Triple White', '39', 'AF1-TW-39', 79900, 55900, 6),
    (v_tenant_id, p2, 'Triple White', '40', 'AF1-TW-40', 79900, 55900, 6),
    (v_tenant_id, p2, 'Triple White', '41', 'AF1-TW-41', 79900, 55900, 6),
    (v_tenant_id, p2, 'Triple Black', '38', 'AF1-TB-38', 79900, 55900, 6),
    (v_tenant_id, p2, 'Triple Black', '39', 'AF1-TB-39', 79900, 55900, 6),
    (v_tenant_id, p2, 'Triple Black', '40', 'AF1-TB-40', 79900, 55900, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values
    (v_tenant_id, p2, 'demo/p2-1.jpg', 'https://picsum.photos/seed/af1white/600/600', 0, true),
    (v_tenant_id, p2, 'demo/p2-2.jpg', 'https://picsum.photos/seed/af1side/600/600', 1, false);

  -- 3. Nike React Infinity Run
  p3 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p3, v_tenant_id, 'Nike React Infinity Run FK 4', v_brand_nike, v_cat_corrida, 'feminino', 'NK-RIF4-001',
    'Desenvolvido para reduzir lesões e manter você nas ruas. Espuma React macia e responsiva, cabedal Flyknit ultra leve e respirável. Tecnologia Rocker que impulsiona cada passada. Ideal para treinos longos e maratonas.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p3, 'Azul Aqua/Branco', '35', 'RIF4-AB-35', 109900, 76900, 4),
    (v_tenant_id, p3, 'Azul Aqua/Branco', '36', 'RIF4-AB-36', 109900, 76900, 4),
    (v_tenant_id, p3, 'Azul Aqua/Branco', '37', 'RIF4-AB-37', 109900, 76900, 4),
    (v_tenant_id, p3, 'Rosa/Branco', '35', 'RIF4-RB-35', 109900, 76900, 4),
    (v_tenant_id, p3, 'Rosa/Branco', '36', 'RIF4-RB-36', 109900, 76900, 4),
    (v_tenant_id, p3, 'Rosa/Branco', '37', 'RIF4-RB-37', 109900, 76900, 4);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p3, 'demo/p3-1.jpg', 'https://picsum.photos/seed/nkreact/600/600', 0, true);

  -- 4. Adidas Ultraboost 23
  p4 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p4, v_tenant_id, 'Adidas Ultraboost 23', v_brand_adidas, v_cat_corrida, 'masculino', 'AD-UB23-001',
    'A máxima energia de retorno em cada passada. Cabedal Primeknit+ se adapta ao seu pé enquanto você corre, tecnologia Boost entrega amortecimento duradouro. Linear Energy Push no arco propulsiona a corrida. Certificado para corrida neutra.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p4, 'Preto/Branco', '40', 'UB23-PB-40', 129900, 90900, 4),
    (v_tenant_id, p4, 'Preto/Branco', '41', 'UB23-PB-41', 129900, 90900, 4),
    (v_tenant_id, p4, 'Preto/Branco', '42', 'UB23-PB-42', 129900, 90900, 4),
    (v_tenant_id, p4, 'Preto/Branco', '43', 'UB23-PB-43', 129900, 90900, 4),
    (v_tenant_id, p4, 'Branco/Azul', '40', 'UB23-BA-40', 129900, 90900, 4),
    (v_tenant_id, p4, 'Branco/Azul', '41', 'UB23-BA-41', 129900, 90900, 4);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p4, 'demo/p4-1.jpg', 'https://picsum.photos/seed/adidasub/600/600', 0, true);

  -- 5. Adidas Stan Smith
  p5 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p5, v_tenant_id, 'Adidas Stan Smith', v_brand_adidas, v_cat_casual, 'unissex', 'AD-SS-001',
    'O tênis de tênis mais icônico já criado. Design minimalista em couro premium com perfurações decorativas na lateral. O Stan Smith é referência de estilo desde 1965 e não sai de moda. Forro suave e palmilha removível.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p5, 'Branco/Verde', '37', 'SS-BV-37', 69900, 48900, 6),
    (v_tenant_id, p5, 'Branco/Verde', '38', 'SS-BV-38', 69900, 48900, 6),
    (v_tenant_id, p5, 'Branco/Verde', '39', 'SS-BV-39', 69900, 48900, 6),
    (v_tenant_id, p5, 'Branco/Verde', '40', 'SS-BV-40', 69900, 48900, 6),
    (v_tenant_id, p5, 'Branco/Verde', '41', 'SS-BV-41', 69900, 48900, 6),
    (v_tenant_id, p5, 'Branco/Marinho', '38', 'SS-BM-38', 69900, 48900, 6),
    (v_tenant_id, p5, 'Branco/Marinho', '39', 'SS-BM-39', 69900, 48900, 6),
    (v_tenant_id, p5, 'Branco/Marinho', '40', 'SS-BM-40', 69900, 48900, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p5, 'demo/p5-1.jpg', 'https://picsum.photos/seed/stansmith/600/600', 0, true);

  -- 6. Adidas Samba OG
  p6 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p6, v_tenant_id, 'Adidas Samba OG', v_brand_adidas, v_cat_casual, 'unissex', 'AD-SAMBA-001',
    'Nascido nas quadras de futebol indoor dos anos 50, o Samba se tornou o tênis mais desejado do streetwear atual. Cabedal em couro e camurça com a icônica tira em T. Sola de goma resistente com textura única.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p6, 'Preto/Branco/Goma', '37', 'SAMBA-PBG-37', 74900, 52900, 6),
    (v_tenant_id, p6, 'Preto/Branco/Goma', '38', 'SAMBA-PBG-38', 74900, 52900, 6),
    (v_tenant_id, p6, 'Preto/Branco/Goma', '39', 'SAMBA-PBG-39', 74900, 52900, 6),
    (v_tenant_id, p6, 'Preto/Branco/Goma', '40', 'SAMBA-PBG-40', 74900, 52900, 6),
    (v_tenant_id, p6, 'Branco/Verde/Goma', '37', 'SAMBA-BVG-37', 74900, 52900, 6),
    (v_tenant_id, p6, 'Branco/Verde/Goma', '38', 'SAMBA-BVG-38', 74900, 52900, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p6, 'demo/p6-1.jpg', 'https://picsum.photos/seed/sambaog/600/600', 0, true);

  -- 7. New Balance 574
  p7 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p7, v_tenant_id, 'New Balance 574 Core', v_brand_nb, v_cat_casual, 'masculino', 'NB-574-001',
    'Um clássico atemporal com construção premium. O 574 apresenta cabedal em camurça e mesh com painel lateral icônico N. Palmilha ENCAP para amortecimento e suporte duradouros. Design versátil para o cotidiano moderno.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p7, 'Cinza/Marinho', '39', 'NB574-CM-39', 59900, 41900, 6),
    (v_tenant_id, p7, 'Cinza/Marinho', '40', 'NB574-CM-40', 59900, 41900, 6),
    (v_tenant_id, p7, 'Cinza/Marinho', '41', 'NB574-CM-41', 59900, 41900, 6),
    (v_tenant_id, p7, 'Cinza/Marinho', '42', 'NB574-CM-42', 59900, 41900, 6),
    (v_tenant_id, p7, 'Verde/Bege', '39', 'NB574-VB-39', 59900, 41900, 6),
    (v_tenant_id, p7, 'Verde/Bege', '40', 'NB574-VB-40', 59900, 41900, 6),
    (v_tenant_id, p7, 'Verde/Bege', '41', 'NB574-VB-41', 59900, 41900, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p7, 'demo/p7-1.jpg', 'https://picsum.photos/seed/nb574/600/600', 0, true);

  -- 8. New Balance Fresh Foam X 1080v13
  p8 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p8, v_tenant_id, 'New Balance Fresh Foam X 1080v13', v_brand_nb, v_cat_corrida, 'feminino', 'NB-1080-001',
    'O tênis de corrida mais macio da New Balance. Fresh Foam X proporciona amortecimento plush e responsivo. Cabedal Hypoknit oferece compressão direcionada. Para corredores de neutro que buscam máximo conforto em longas distâncias.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p8, 'Lilás/Branco', '35', 'NB1080-LB-35', 139900, 97900, 4),
    (v_tenant_id, p8, 'Lilás/Branco', '36', 'NB1080-LB-36', 139900, 97900, 4),
    (v_tenant_id, p8, 'Lilás/Branco', '37', 'NB1080-LB-37', 139900, 97900, 4),
    (v_tenant_id, p8, 'Preto/Prata', '35', 'NB1080-PP-35', 139900, 97900, 4),
    (v_tenant_id, p8, 'Preto/Prata', '36', 'NB1080-PP-36', 139900, 97900, 4),
    (v_tenant_id, p8, 'Preto/Prata', '37', 'NB1080-PP-37', 139900, 97900, 4);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p8, 'demo/p8-1.jpg', 'https://picsum.photos/seed/nb1080/600/600', 0, true);

  -- 9. Puma Suede Classic
  p9 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p9, v_tenant_id, 'Puma Suede Classic XXI', v_brand_puma, v_cat_casual, 'unissex', 'PM-SUEDE-001',
    'O tênis que moldou a cultura urbana. Lançado em 1968, o Suede é símbolo da cultura hip-hop e do esporte. Cabedal em camurça macia, logotipo Puma bordado na lateral. Um clássico que nunca perde o apelo.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p9, 'Preto/Branco', '37', 'SUEDE-PB-37', 42900, 29900, 6),
    (v_tenant_id, p9, 'Preto/Branco', '38', 'SUEDE-PB-38', 42900, 29900, 6),
    (v_tenant_id, p9, 'Preto/Branco', '39', 'SUEDE-PB-39', 42900, 29900, 6),
    (v_tenant_id, p9, 'Preto/Branco', '40', 'SUEDE-PB-40', 42900, 29900, 6),
    (v_tenant_id, p9, 'Azul Marinho/Branco', '38', 'SUEDE-AMB-38', 42900, 29900, 6),
    (v_tenant_id, p9, 'Azul Marinho/Branco', '39', 'SUEDE-AMB-39', 42900, 29900, 6),
    (v_tenant_id, p9, 'Azul Marinho/Branco', '40', 'SUEDE-AMB-40', 42900, 29900, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p9, 'demo/p9-1.jpg', 'https://picsum.photos/seed/pumasuede/600/600', 0, true);

  -- 10. Puma RS-X
  p10 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p10, v_tenant_id, 'Puma RS-X Efekt', v_brand_puma, v_cat_casual, 'masculino', 'PM-RSX-001',
    'Design chunky inspirado nos anos 80. A tecnologia RS (Running System) de amortecimento foi reinventada com uma construção em camadas: mesh, couro sintético e suede. Sola de borracha espessa com visual futurista.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p10, 'Branco/Vermelho/Azul', '40', 'RSX-BVA-40', 54900, 38400, 6),
    (v_tenant_id, p10, 'Branco/Vermelho/Azul', '41', 'RSX-BVA-41', 54900, 38400, 6),
    (v_tenant_id, p10, 'Branco/Vermelho/Azul', '42', 'RSX-BVA-42', 54900, 38400, 6),
    (v_tenant_id, p10, 'Preto/Ouro', '40', 'RSX-PO-40', 54900, 38400, 6),
    (v_tenant_id, p10, 'Preto/Ouro', '41', 'RSX-PO-41', 54900, 38400, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p10, 'demo/p10-1.jpg', 'https://picsum.photos/seed/pumarsx/600/600', 0, true);

  -- 11. ASICS Gel-Nimbus 25
  p11 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p11, v_tenant_id, 'ASICS Gel-Nimbus 25', v_brand_asics, v_cat_corrida, 'masculino', 'AS-GN25-001',
    'O tênis de corrida premium da ASICS. Tecnologia FF BLAST+ para amortecimento ultra responsivo. Gel no calcanhar e antepé para atenuação de impacto. Cabedal em jacquard 3D estruturado. Para corredores neutros exigentes de longas distâncias.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p11, 'Azul/Amarelo', '40', 'GN25-AA-40', 149900, 104900, 4),
    (v_tenant_id, p11, 'Azul/Amarelo', '41', 'GN25-AA-41', 149900, 104900, 4),
    (v_tenant_id, p11, 'Azul/Amarelo', '42', 'GN25-AA-42', 149900, 104900, 4),
    (v_tenant_id, p11, 'Preto/Vermelho', '40', 'GN25-PV-40', 149900, 104900, 4),
    (v_tenant_id, p11, 'Preto/Vermelho', '41', 'GN25-PV-41', 149900, 104900, 4),
    (v_tenant_id, p11, 'Preto/Vermelho', '42', 'GN25-PV-42', 149900, 104900, 4);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p11, 'demo/p11-1.jpg', 'https://picsum.photos/seed/asicsgn25/600/600', 0, true);

  -- 12. ASICS Gel-Kayano 30
  p12 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p12, v_tenant_id, 'ASICS Gel-Kayano 30', v_brand_asics, v_cat_corrida, 'feminino', 'AS-GK30-001',
    '30 anos de excelência em corrida com controle de pronação. 4D Guidance System guia naturalmente a passada. Tecnologia FF BLAST+ espuma dupla. Para corredoras com pronação leve a moderada que não abrem mão do suporte.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p12, 'Rosa Neon/Branco', '35', 'GK30-RNB-35', 159900, 111900, 4),
    (v_tenant_id, p12, 'Rosa Neon/Branco', '36', 'GK30-RNB-36', 159900, 111900, 4),
    (v_tenant_id, p12, 'Rosa Neon/Branco', '37', 'GK30-RNB-37', 159900, 111900, 4),
    (v_tenant_id, p12, 'Cinza/Menta', '35', 'GK30-CM-35', 159900, 111900, 4),
    (v_tenant_id, p12, 'Cinza/Menta', '36', 'GK30-CM-36', 159900, 111900, 4),
    (v_tenant_id, p12, 'Cinza/Menta', '37', 'GK30-CM-37', 159900, 111900, 4);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p12, 'demo/p12-1.jpg', 'https://picsum.photos/seed/asicsgk30/600/600', 0, true);

  -- 13. Vans Old Skool
  p13 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p13, v_tenant_id, 'Vans Old Skool', v_brand_vans, v_cat_skateboard, 'unissex', 'VN-OS-001',
    'O primeiro tênis da Vans com a famosa Sidestripe, criado em 1977. Cabedal em suede e canvas durável. Entressola de borracha vulcanizada para máxima aderência no skate. Um clássico do skateboard que virou ícone cultural global.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p13, 'Preto/Branco', '37', 'OS-PB-37', 44900, 31400, 6),
    (v_tenant_id, p13, 'Preto/Branco', '38', 'OS-PB-38', 44900, 31400, 6),
    (v_tenant_id, p13, 'Preto/Branco', '39', 'OS-PB-39', 44900, 31400, 6),
    (v_tenant_id, p13, 'Preto/Branco', '40', 'OS-PB-40', 44900, 31400, 6),
    (v_tenant_id, p13, 'Navy/Branco', '37', 'OS-NB-37', 44900, 31400, 6),
    (v_tenant_id, p13, 'Navy/Branco', '38', 'OS-NB-38', 44900, 31400, 6),
    (v_tenant_id, p13, 'Navy/Branco', '39', 'OS-NB-39', 44900, 31400, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p13, 'demo/p13-1.jpg', 'https://picsum.photos/seed/vansoldskool/600/600', 0, true);

  -- 14. Vans SK8-Hi
  p14 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p14, v_tenant_id, 'Vans SK8-Hi', v_brand_vans, v_cat_skateboard, 'unissex', 'VN-SK8HI-001',
    'O cano alto icônico da Vans. Construção reforçada com forro de nylon resistente e reforço no calcanhar. Palmilha Vans Comfycush com forro acolchoado. Proteção e estilo para o skate e o dia a dia urbano.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p14, 'Preto/Branco', '38', 'SK8HI-PB-38', 54900, 38400, 6),
    (v_tenant_id, p14, 'Preto/Branco', '39', 'SK8HI-PB-39', 54900, 38400, 6),
    (v_tenant_id, p14, 'Preto/Branco', '40', 'SK8HI-PB-40', 54900, 38400, 6),
    (v_tenant_id, p14, 'Preto/Branco', '41', 'SK8HI-PB-41', 54900, 38400, 6),
    (v_tenant_id, p14, 'Vermelho/Branco', '38', 'SK8HI-VB-38', 54900, 38400, 6),
    (v_tenant_id, p14, 'Vermelho/Branco', '39', 'SK8HI-VB-39', 54900, 38400, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p14, 'demo/p14-1.jpg', 'https://picsum.photos/seed/vansk8hi/600/600', 0, true);

  -- 15. Reebok Classic Leather
  p15 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p15, v_tenant_id, 'Reebok Classic Leather', v_brand_reebok, v_cat_casual, 'unissex', 'RB-CL-001',
    'Desde 1983 definindo o estilo casual. Cabedal em couro macio e durável com forro de camurça. Entressola de EVA para amortecimento leve. O visual clean e atemporal que funciona do academia ao brunch de domingo.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p15, 'Chalk/Branco', '37', 'RCL-CW-37', 39900, 27900, 6),
    (v_tenant_id, p15, 'Chalk/Branco', '38', 'RCL-CW-38', 39900, 27900, 6),
    (v_tenant_id, p15, 'Chalk/Branco', '39', 'RCL-CW-39', 39900, 27900, 6),
    (v_tenant_id, p15, 'Chalk/Branco', '40', 'RCL-CW-40', 39900, 27900, 6),
    (v_tenant_id, p15, 'Preto/Carbon', '38', 'RCL-PC-38', 39900, 27900, 6),
    (v_tenant_id, p15, 'Preto/Carbon', '39', 'RCL-PC-39', 39900, 27900, 6),
    (v_tenant_id, p15, 'Preto/Carbon', '40', 'RCL-PC-40', 39900, 27900, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p15, 'demo/p15-1.jpg', 'https://picsum.photos/seed/reebokclassic/600/600', 0, true);

  -- 16. Reebok Nano X3
  p16 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p16, v_tenant_id, 'Reebok Nano X3', v_brand_reebok, v_cat_training, 'masculino', 'RB-NX3-001',
    'O melhor tênis de training da Reebok. Tecnologia Lift & Run Chassis para estabilidade no levantamento e responsividade na corrida. Mesh de alta resistência respirável. Multi-direcional, da corrida ao levantamento olímpico.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p16, 'Preto/Branco/Ciano', '40', 'NX3-PBC-40', 69900, 48900, 4),
    (v_tenant_id, p16, 'Preto/Branco/Ciano', '41', 'NX3-PBC-41', 69900, 48900, 4),
    (v_tenant_id, p16, 'Preto/Branco/Ciano', '42', 'NX3-PBC-42', 69900, 48900, 4),
    (v_tenant_id, p16, 'Branco/Cinza', '40', 'NX3-BC-40', 69900, 48900, 4),
    (v_tenant_id, p16, 'Branco/Cinza', '41', 'NX3-BC-41', 69900, 48900, 4);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p16, 'demo/p16-1.jpg', 'https://picsum.photos/seed/reeboxnanox3/600/600', 0, true);

  -- 17. Skechers D'Lites
  p17 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p17, v_tenant_id, 'Skechers D''Lites 3.0', v_brand_skechers, v_cat_casual, 'feminino', 'SK-DL3-001',
    'A combinação perfeita de estilo chunky e conforto extremo. Cabedal em mesh e couro sintético com detalhes em relevo. Memory Foam moldável ao pé. Sola Air-Cooled arejada. Ideal para usar o dia todo sem descanso.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p17, 'Branco/Prata', '35', 'DL3-BP-35', 42900, 29900, 6),
    (v_tenant_id, p17, 'Branco/Prata', '36', 'DL3-BP-36', 42900, 29900, 6),
    (v_tenant_id, p17, 'Branco/Prata', '37', 'DL3-BP-37', 42900, 29900, 6),
    (v_tenant_id, p17, 'Branco/Prata', '38', 'DL3-BP-38', 42900, 29900, 6),
    (v_tenant_id, p17, 'Preto/Ouro', '35', 'DL3-PO-35', 42900, 29900, 6),
    (v_tenant_id, p17, 'Preto/Ouro', '36', 'DL3-PO-36', 42900, 29900, 6),
    (v_tenant_id, p17, 'Preto/Ouro', '37', 'DL3-PO-37', 42900, 29900, 6);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p17, 'demo/p17-1.jpg', 'https://picsum.photos/seed/skechersdlites/600/600', 0, true);

  -- 18. Nike Air Jordan 1 Low
  p18 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p18, v_tenant_id, 'Nike Air Jordan 1 Low', v_brand_nike, v_cat_casual, 'masculino', 'NK-AJ1L-001',
    'A herança do Jordan em versão cotidiana. O Air Jordan 1 Low traz o DNA do basquete com a praticidade do cano baixo. Couro premium, câmara Air no calcanhar e o icônico Wings logo. Um tênis de colecionador para usar no dia a dia.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p18, 'Preto/Vermelho', '40', 'AJ1L-PV-40', 99900, 69900, 4),
    (v_tenant_id, p18, 'Preto/Vermelho', '41', 'AJ1L-PV-41', 99900, 69900, 4),
    (v_tenant_id, p18, 'Preto/Vermelho', '42', 'AJ1L-PV-42', 99900, 69900, 4),
    (v_tenant_id, p18, 'Branco/Cinza', '40', 'AJ1L-BC-40', 99900, 69900, 4),
    (v_tenant_id, p18, 'Branco/Cinza', '41', 'AJ1L-BC-41', 99900, 69900, 4),
    (v_tenant_id, p18, 'Branco/Cinza', '42', 'AJ1L-BC-42', 99900, 69900, 4);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p18, 'demo/p18-1.jpg', 'https://picsum.photos/seed/jordan1low/600/600', 0, true);

  -- 19. Nike Pegasus 41
  p19 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p19, v_tenant_id, 'Nike Air Zoom Pegasus 41', v_brand_nike, v_cat_corrida, 'masculino', 'NK-PEG41-001',
    'O tênis de corrida mais versátil da Nike. Air Zoom no antepé e calcanhar para responsividade a cada passada. Espuma React X em volume maior para mais amortecimento. Novo cabedal Flyknit otimizado para ventilação. Do treino à meia-maratona.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p19, 'Preto/Branco', '40', 'PEG41-PB-40', 99900, 69900, 4),
    (v_tenant_id, p19, 'Preto/Branco', '41', 'PEG41-PB-41', 99900, 69900, 4),
    (v_tenant_id, p19, 'Preto/Branco', '42', 'PEG41-PB-42', 99900, 69900, 4),
    (v_tenant_id, p19, 'Azul/Laranja', '40', 'PEG41-AL-40', 99900, 69900, 4),
    (v_tenant_id, p19, 'Azul/Laranja', '41', 'PEG41-AL-41', 99900, 69900, 4),
    (v_tenant_id, p19, 'Azul/Laranja', '42', 'PEG41-AL-42', 99900, 69900, 4);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p19, 'demo/p19-1.jpg', 'https://picsum.photos/seed/nikepeg41/600/600', 0, true);

  -- 20. Puma Velocity Nitro 3
  p20 := gen_random_uuid();
  insert into products (id, tenant_id, name, brand_id, category_id, gender, reference, description)
  values (p20, v_tenant_id, 'Puma Velocity Nitro 3', v_brand_puma, v_cat_corrida, 'masculino', 'PM-VN3-001',
    'Velocidade e conforto sem compromisso. Foam NITRO para máxima responsividade e leveza. Cabedal em mesh ultra leve e respirável. Placa Pebax no meio-pé para propulsão extra. Ideal para treinos de velocidade e corridas de até 21km.');
  insert into product_variants (tenant_id, product_id, color, size, sku, price_cents, wholesale_price_cents, wholesale_min_qty)
  values
    (v_tenant_id, p20, 'Laranja Neon/Preto', '40', 'VN3-LNP-40', 119900, 83900, 4),
    (v_tenant_id, p20, 'Laranja Neon/Preto', '41', 'VN3-LNP-41', 119900, 83900, 4),
    (v_tenant_id, p20, 'Laranja Neon/Preto', '42', 'VN3-LNP-42', 119900, 83900, 4),
    (v_tenant_id, p20, 'Azul Elétrico/Branco', '40', 'VN3-AEB-40', 119900, 83900, 4),
    (v_tenant_id, p20, 'Azul Elétrico/Branco', '41', 'VN3-AEB-41', 119900, 83900, 4);
  insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
  values (v_tenant_id, p20, 'demo/p20-1.jpg', 'https://picsum.photos/seed/pumavelocity/600/600', 0, true);

  -- -------------------------------------------------------------------------
  -- Estoque inicial (para o site não mostrar tudo como esgotado)
  -- -------------------------------------------------------------------------
  insert into inventory (tenant_id, variant_id, quantity, min_quantity)
  select
    pv.tenant_id,
    pv.id,
    case when random() < 0.15 then 0 else floor(random() * 20 + 5)::integer end,
    3
  from product_variants pv
  where pv.tenant_id = v_tenant_id
  on conflict (variant_id) do update set quantity = excluded.quantity;

end $$;

insert into supabase_migrations.schema_migrations (version, name, statements)
values ('017', '017_sample_products', array['-- applied via management API'])
on conflict (version) do nothing;
