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

async function updateRPCAndColumns() {
  const sql = `
    -- Permitir que cash_register_id e user_id sejam nulos em pedidos originados do site
    ALTER TABLE sales ALTER COLUMN cash_register_id DROP NOT NULL;
    ALTER TABLE sales ALTER COLUMN user_id DROP NOT NULL;

    -- Atualizar RPC create_storefront_order para associar a store_id padrão da loja
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
      v_unit_price bigint;
      v_curr_stock int;
    begin
      -- Buscar loja padrão do tenant
      select id into v_store_id from stores where tenant_id = p_tenant_id limit 1;

      -- 1. Validar e Sequestrar Estoque de cada item
      for v_item in select * from jsonb_array_elements(p_items)
      loop
        v_variant_id := (v_item->>'variant_id')::uuid;
        v_qty := (v_item->>'quantity')::int;
        v_unit_price := (v_item->>'unit_price_cents')::bigint;

        -- Verificar saldo atual no inventário
        select quantity into v_curr_stock from inventory where variant_id = v_variant_id for update;

        if v_curr_stock is null or v_curr_stock < v_qty then
          return jsonb_build_object(
            'success', false,
            'error', 'Um dos itens solicitados acabou de esgotar no estoque.'
          );
        end if;

        -- Sequestrar (decrementar) o estoque imediatamente para travar para este cliente
        update inventory
        set quantity = quantity - v_qty, updated_at = now()
        where variant_id = v_variant_id;

        v_subtotal_cents := v_subtotal_cents + (v_qty * v_unit_price);
      end loop;

      v_total_cents := v_subtotal_cents + coalesce(p_delivery_fee_cents, 0);

      -- 2. Criar a Venda com status 'pending_approval' (entra na fila do PDV)
      insert into sales (
        tenant_id,
        store_id,
        status,
        order_source,
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
        v_subtotal_cents,
        v_total_cents,
        p_delivery_fee_cents,
        p_delivery_address,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        p_notes,
        now()
      )
      returning id into v_sale_id;

      -- 3. Inserir itens da venda
      for v_item in select * from jsonb_array_elements(p_items)
      loop
        v_variant_id := (v_item->>'variant_id')::uuid;
        v_qty := (v_item->>'quantity')::int;
        v_unit_price := (v_item->>'unit_price_cents')::bigint;

        insert into sale_items (
          tenant_id,
          sale_id,
          variant_id,
          quantity,
          unit_price_cents,
          total_cents,
          created_at
        )
        values (
          p_tenant_id,
          v_sale_id,
          v_variant_id,
          v_qty,
          v_unit_price,
          v_qty * v_unit_price,
          now()
        );
      end loop;

      -- 4. Inserir método de pagamento previsto
      insert into payments (
        tenant_id,
        sale_id,
        method,
        amount_cents,
        created_at
      )
      values (
        p_tenant_id,
        v_sale_id,
        coalesce(p_payment_method, 'pix')::payment_method,
        v_total_cents,
        now()
      );

      return jsonb_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'message', 'Pedido criado com sucesso e estoque sequestrado/reservado na fila do PDV!'
      );
    end;
    $$;
  `;

  await runSQL(sql);
  console.log('✅ RPC create_storefront_order e colunas de sales atualizadas!');
}

updateRPCAndColumns().catch(console.error);
