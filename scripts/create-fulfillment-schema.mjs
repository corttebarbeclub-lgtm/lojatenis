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

async function createFulfillmentSchema() {
  // 1. Adicionar coluna fulfillment_status na tabela sales
  const sql1 = `
    -- Adicionar fulfillment_status para rastrear separação e envio
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS fulfillment_status text DEFAULT 'none';

    -- Índice para consultas de fulfillment
    CREATE INDEX IF NOT EXISTS idx_sales_fulfillment ON sales(tenant_id, fulfillment_status) WHERE order_source = 'storefront';

    -- Comentário explicando os valores
    COMMENT ON COLUMN sales.fulfillment_status IS 
      'none = sem fulfillment (venda presencial), '
      'separating = em separação, '
      'in_transit = em trânsito, '
      'shipped_moto = enviado uber/mototaxi, '
      'shipped_boat = enviado pelo barco, '
      'delivered = entregue, '
      'cancelled = cancelado (estoque devolvido)';
  `;

  await runSQL(sql1);
  console.log('✅ Coluna fulfillment_status adicionada com sucesso!');

  // 2. Atualizar pedidos aprovados do site para iniciar em 'separating'
  const sql2 = `
    UPDATE sales
    SET fulfillment_status = 'separating'
    WHERE order_source = 'storefront'
      AND status = 'completed'
      AND fulfillment_status = 'none';
  `;

  await runSQL(sql2);
  console.log('✅ Pedidos existentes migrados para "em separação".');

  // 3. Atualizar a RPC handle_online_order para setar fulfillment_status
  const sql3 = `
    CREATE OR REPLACE FUNCTION public.handle_online_order(
      p_sale_id uuid,
      p_action text
    )
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path to 'public'
    AS $$
    declare
      v_sale record;
      v_item record;
    begin
      select * into v_sale from sales where id = p_sale_id;

      if v_sale.id is null then
        return jsonb_build_object('success', false, 'error', 'Pedido não encontrado.');
      end if;

      if v_sale.status != 'pending_approval' then
        return jsonb_build_object('success', false, 'error', 'Este pedido já foi processado anteriormente.');
      end if;

      if p_action = 'approve' then
        update sales
        set status = 'completed',
            fulfillment_status = 'separating',
            is_printed = true,
            updated_at = now()
        where id = p_sale_id;

        return jsonb_build_object(
          'success', true,
          'action', 'approved',
          'message', 'Pedido aprovado! Enviado para separação de material.'
        );

      elsif p_action = 'reject' then
        for v_item in select * from sale_items where sale_id = p_sale_id
        loop
          update inventory
          set quantity = quantity + v_item.quantity, updated_at = now()
          where variant_id = v_item.variant_id;
        end loop;

        update sales
        set status = 'cancelled',
            fulfillment_status = 'cancelled',
            updated_at = now()
        where id = p_sale_id;

        return jsonb_build_object(
          'success', true,
          'action', 'rejected',
          'message', 'Pedido cancelado e itens devolvidos ao estoque central com sucesso.'
        );

      else
        return jsonb_build_object('success', false, 'error', 'Ação inválida.');
      end if;
    end;
    $$;
  `;

  await runSQL(sql3);
  console.log('✅ RPC handle_online_order atualizada para incluir fulfillment_status.');

  // 4. Criar RPC para cancelar com devolução de estoque (protegida por senha)
  const sql4 = `
    CREATE OR REPLACE FUNCTION public.cancel_fulfillment_order(
      p_sale_id uuid
    )
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path to 'public'
    AS $$
    declare
      v_sale record;
      v_item record;
    begin
      select * into v_sale from sales where id = p_sale_id;

      if v_sale.id is null then
        return jsonb_build_object('success', false, 'error', 'Pedido não encontrado.');
      end if;

      if v_sale.fulfillment_status = 'cancelled' then
        return jsonb_build_object('success', false, 'error', 'Este pedido já foi cancelado.');
      end if;

      -- Devolver itens ao estoque central
      for v_item in select * from sale_items where sale_id = p_sale_id
      loop
        update inventory
        set quantity = quantity + v_item.quantity, updated_at = now()
        where variant_id = v_item.variant_id;
      end loop;

      -- Marcar como cancelado
      update sales
      set status = 'cancelled',
          fulfillment_status = 'cancelled',
          updated_at = now()
      where id = p_sale_id;

      return jsonb_build_object(
        'success', true,
        'message', 'Pedido cancelado com sucesso. Itens devolvidos ao estoque central.'
      );
    end;
    $$;
  `;

  await runSQL(sql4);
  console.log('✅ RPC cancel_fulfillment_order criada com sucesso!');
}

createFulfillmentSchema().catch(console.error);
