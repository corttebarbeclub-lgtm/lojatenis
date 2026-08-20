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

async function fixHandleOrder() {
  const sql = `
    -- Adicionar updated_at a sales se não existir
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

    -- Atualizar RPC handle_online_order
    CREATE OR REPLACE FUNCTION public.handle_online_order(
      p_sale_id uuid,
      p_action text -- 'approve' | 'reject'
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
        -- Venda Aprovada e Faturada no PDV
        update sales
        set status = 'completed', is_printed = true, updated_at = now()
        where id = p_sale_id;

        return jsonb_build_object(
          'success', true,
          'action', 'approved',
          'message', 'Pedido aprovado com sucesso! Emitindo cupom não fiscal...'
        );

      elsif p_action = 'reject' then
        -- Pedido Recusado: DEVOLVER itens sequestrados ao estoque central
        for v_item in select * from sale_items where sale_id = p_sale_id
        loop
          update inventory
          set quantity = quantity + v_item.quantity, updated_at = now()
          where variant_id = v_item.variant_id;
        end loop;

        update sales
        set status = 'cancelled', updated_at = now()
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

  await runSQL(sql);
  console.log('✅ RPC handle_online_order e updated_at atualizados com sucesso!');
}

fixHandleOrder().catch(console.error);
