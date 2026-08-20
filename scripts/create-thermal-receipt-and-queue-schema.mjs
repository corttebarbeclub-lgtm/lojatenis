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

async function migrateThermalReceiptAndStockLocking() {
  console.log('🚀 Criando estrutura para Fila de Pedidos, Cupom Não Fiscal e Avise-me Quando Chegar...');

  const sql = `
    -- 1. Extensão de colunas na tabela sales para suportar entregas, pedidos da loja e fila
    alter table sales add column if not exists order_source text default 'pdv'; -- 'pdv' | 'storefront' | 'wholesale'
    alter table sales add column if not exists delivery_fee_cents bigint default 0;
    alter table sales add column if not exists delivery_address jsonb default '{}'::jsonb;
    alter table sales add column if not exists customer_name text;
    alter table sales add column if not exists customer_phone text;
    alter table sales add column if not exists customer_email text;
    alter table sales add column if not exists notes text;
    alter table sales add column if not exists is_printed boolean default false;

    -- 2. Tabela de Alertas de Estoque ("Avise-me Quando Chegar")
    create table if not exists stock_alerts (
      id uuid primary key default gen_random_uuid(),
      tenant_id uuid not null references tenants(id) on delete cascade,
      product_id uuid not null references products(id) on delete cascade,
      variant_id uuid references product_variants(id) on delete cascade,
      customer_name text,
      email text not null,
      phone text,
      size text,
      status text not null default 'pending', -- 'pending' | 'notified'
      created_at timestamp with time zone default now(),
      notified_at timestamp with time zone
    );

    create index if not exists idx_stock_alerts_variant on stock_alerts(variant_id, status);
    create index if not exists idx_stock_alerts_product on stock_alerts(product_id, status);

    -- 3. Função RPC para sequestrar estoque e criar pedido pendente do site
    create or replace function public.create_storefront_order(
      p_tenant_id uuid,
      p_customer_name text,
      p_customer_phone text,
      p_customer_email text,
      p_payment_method text,
      p_delivery_fee_cents bigint,
      p_delivery_address jsonb,
      p_items jsonb, -- array de { variant_id, quantity, unit_price_cents }
      p_notes text default ''
    )
    returns jsonb
    language plpgsql
    security definer
    set search_path to 'public'
    as $$
    declare
      v_sale_id uuid;
      v_item jsonb;
      v_subtotal_cents bigint := 0;
      v_total_cents bigint := 0;
      v_variant_id uuid;
      v_qty int;
      v_unit_price bigint;
      v_curr_stock int;
    begin
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
          sale_id,
          variant_id,
          quantity,
          unit_price_cents,
          total_cents
        )
        values (
          v_sale_id,
          v_variant_id,
          v_qty,
          v_unit_price,
          v_qty * v_unit_price
        );
      end loop;

      -- 4. Registrar forma de pagamento preliminar
      insert into sale_payments (
        sale_id,
        method,
        amount_cents
      )
      values (
        v_sale_id,
        coalesce(p_payment_method, 'pix'),
        v_total_cents
      );

      return jsonb_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'total_cents', v_total_cents,
        'message', 'Pedido enviado com sucesso para o PDV com estoque sequestrado!'
      );
    end;
    $$;

    -- 4. Função RPC para o dono aprovar ou recusar o pedido no PDV
    create or replace function public.handle_online_order(
      p_sale_id uuid,
      p_action text -- 'approve' | 'reject'
    )
    returns jsonb
    language plpgsql
    security definer
    set search_path to 'public'
    as $$
    declare
      v_item record;
    begin
      if p_action = 'approve' then
        update sales
        set status = 'completed', is_printed = true, updated_at = now()
        where id = p_sale_id;

        return jsonb_build_object('success', true, 'message', 'Pedido aprovado com sucesso e liberado para impressão do cupom térmico!');
      elsif p_action = 'reject' then
        -- Devolver o estoque sequestrado
        for v_item in select variant_id, quantity from sale_items where sale_id = p_sale_id
        loop
          update inventory
          set quantity = quantity + v_item.quantity, updated_at = now()
          where variant_id = v_item.variant_id;
        end loop;

        update sales
        set status = 'cancelled', updated_at = now()
        where id = p_sale_id;

        return jsonb_build_object('success', true, 'message', 'Pedido cancelado e estoque devolvido.');
      else
        return jsonb_build_object('success', false, 'error', 'Ação inválida.');
      end if;
    end;
    $$;
  `;

  await runSQL(sql);
  console.log('✅ Estrutura de Cupom Não Fiscal, Sequestro de Estoque e Fila do PDV criada com sucesso!');
}

migrateThermalReceiptAndStockLocking().catch(console.error);
