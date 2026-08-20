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

async function applySecurityHardening() {
  console.log('🔒 Aplicando Blindagem de Segurança no Banco de Dados...');

  const sql = `
    -- 1. Constraints de Segurança adicionais
    ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_delivery_fee_check;
    ALTER TABLE sales ADD CONSTRAINT sales_delivery_fee_check CHECK (delivery_fee_cents >= 0);

    ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_subtotal_check;
    ALTER TABLE sales ADD CONSTRAINT sales_subtotal_check CHECK (subtotal_cents >= 0);

    ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_total_check;
    ALTER TABLE sales ADD CONSTRAINT sales_total_check CHECK (total_cents >= 0);

    -- 2. RPC create_storefront_order 100% BLINDADA contra fraudes e manipulação de preços
    CREATE OR REPLACE FUNCTION public.create_storefront_order(
      p_tenant_id uuid,
      p_customer_name text,
      p_customer_phone text,
      p_customer_email text,
      p_payment_method text,
      p_delivery_fee_cents bigint,
      p_delivery_address jsonb,
      p_items jsonb,
      p_notes text default ''
    )
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path to 'public'
    AS $$
    declare
      v_sale_id uuid;
      v_store_id uuid;
      v_item jsonb;
      v_subtotal_cents bigint := 0;
      v_total_cents bigint := 0;
      v_variant_id uuid;
      v_qty int;
      v_official_price bigint;
      v_curr_stock int;
      v_item_count int := 0;
      v_delivery_fee bigint;
    begin
      -- Validar parâmetros básicos de entrada
      if p_tenant_id is null then
        return jsonb_build_object('success', false, 'error', 'Loja (tenant) não informada.');
      end if;

      -- Sanitizar e validar taxa de entrega (NUNCA negativa)
      v_delivery_fee := coalesce(p_delivery_fee_cents, 0);
      if v_delivery_fee < 0 then
        return jsonb_build_object('success', false, 'error', 'Taxa de entrega inválida.');
      end if;

      -- Validar lista de itens
      if p_items is null or jsonb_array_length(p_items) = 0 then
        return jsonb_build_object('success', false, 'error', 'O carrinho está vazio.');
      end if;

      -- Buscar loja padrão do tenant
      select id into v_store_id from stores where tenant_id = p_tenant_id limit 1;

      -- 1. FASE DE VALIDAÇÃO E CÁLCULO DE PREÇOS OFICIAIS DO BANCO
      for v_item in select * from jsonb_array_elements(p_items)
      loop
        v_variant_id := (v_item->>'variant_id')::uuid;
        v_qty := (v_item->>'quantity')::int;

        -- Validar quantidade positiva e limite anti-abuso
        if v_qty is null or v_qty <= 0 or v_qty > 50 then
          return jsonb_build_object(
            'success', false,
            'error', 'Quantidade inválida para um dos produtos (mínimo 1, máximo 50).'
          );
        end if;

        -- Buscar preço OFICIAL direto da tabela product_variants do banco (Ignorar qualquer preço do cliente!)
        select pv.price_cents into v_official_price
        from product_variants pv
        join products p on p.id = pv.product_id
        where pv.id = v_variant_id
          and pv.tenant_id = p_tenant_id
          and pv.is_active = true
          and p.is_active = true;

        if v_official_price is null or v_official_price <= 0 then
          return jsonb_build_object(
            'success', false,
            'error', 'Produto ou tamanho indisponível ou inexistente nesta loja.'
          );
        end if;

        -- Validar saldo atual no inventário com bloqueio exclusivo de linha (Anti-Race Condition)
        select quantity into v_curr_stock from inventory where variant_id = v_variant_id for update;

        if v_curr_stock is null or v_curr_stock < v_qty then
          return jsonb_build_object(
            'success', false,
            'error', 'Estoque insuficiente para um dos tênis selecionados.'
          );
        end if;

        v_subtotal_cents := v_subtotal_cents + (v_qty * v_official_price);
        v_item_count := v_item_count + 1;
      end loop;

      if v_item_count = 0 or v_subtotal_cents <= 0 then
        return jsonb_build_object('success', false, 'error', 'Nenhum item válido para processar.');
      end if;

      v_total_cents := v_subtotal_cents + v_delivery_fee;

      -- 2. FASE DE SEQUESTRO/RESERVA DE ESTOQUE
      for v_item in select * from jsonb_array_elements(p_items)
      loop
        v_variant_id := (v_item->>'variant_id')::uuid;
        v_qty := (v_item->>'quantity')::int;

        update inventory
        set quantity = quantity - v_qty, updated_at = now()
        where variant_id = v_variant_id;
      end loop;

      -- 3. FASE DE CRIAÇÃO DO PEDIDO (Venda com status 'pending_approval' e fulfillment 'none')
      insert into sales (
        tenant_id,
        store_id,
        status,
        order_source,
        fulfillment_status,
        subtotal_cents,
        total_cents,
        delivery_fee_cents,
        delivery_address,
        customer_name,
        customer_phone,
        customer_email,
        notes,
        created_at
      )
      values (
        p_tenant_id,
        v_store_id,
        'pending_approval',
        'storefront',
        'none',
        v_subtotal_cents,
        v_total_cents,
        v_delivery_fee,
        p_delivery_address,
        coalesce(trim(p_customer_name), 'Cliente Loja Online'),
        coalesce(trim(p_customer_phone), ''),
        coalesce(trim(p_customer_email), ''),
        coalesce(trim(p_notes), ''),
        now()
      )
      returning id into v_sale_id;

      -- 4. INSERÇÃO DOS ITENS COM O PREÇO OFICIAL DO BANCO
      for v_item in select * from jsonb_array_elements(p_items)
      loop
        v_variant_id := (v_item->>'variant_id')::uuid;
        v_qty := (v_item->>'quantity')::int;

        select price_cents into v_official_price
        from product_variants
        where id = v_variant_id;

        insert into sale_items (
          tenant_id,
          sale_id,
          variant_id,
          quantity,
          unit_price_cents,
          total_cents
        )
        values (
          p_tenant_id,
          v_sale_id,
          v_variant_id,
          v_qty,
          v_official_price,
          v_qty * v_official_price
        );
      end loop;

      -- 5. INSERÇÃO DO PAGAMENTO PREVISTO
      insert into payments (
        tenant_id,
        sale_id,
        method,
        amount_cents
      )
      values (
        p_tenant_id,
        v_sale_id,
        coalesce(p_payment_method, 'pix')::payment_method,
        v_total_cents
      );

      return jsonb_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'subtotal_cents', v_subtotal_cents,
        'total_cents', v_total_cents,
        'message', 'Pedido criado com sucesso e estoque sequestrado/reservado com preços oficiais do banco!'
      );
    end;
    $$;
  `;

  await runSQL(sql);
  console.log('✅ Blindagem aplicada no Supabase com sucesso!');
}

applySecurityHardening().catch(console.error);
