import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmlxhsqfvxjggvqusleu.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  }

  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

// 1. GET: Listar pedidos pendentes de aprovação no PDV
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let tenantId = searchParams.get('tenant_id');
    const supabase = getAdminClient();

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'tenisstore')
        .single();
      tenantId = tenant?.id;
    }

    const { data: orders, error } = await supabase
      .from('sales')
      .select(`
        id,
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
        created_at,
        sale_items (
          id,
          quantity,
          unit_price_cents,
          total_cents,
          variant:product_variants (
            id,
            size,
            color,
            product:products ( id, name )
          )
        ),
        payments (
          id,
          method,
          amount_cents
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar pedidos online.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST: Aprovar ou Recusar Pedido no PDV
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saleId, action } = body; // action: 'approve' | 'reject'
    const supabase = getAdminClient();

    if (!saleId || !action) {
      return NextResponse.json({ success: false, error: 'ID do pedido e ação são obrigatórios.' }, { status: 400 });
    }

    const { data: result, error } = await supabase.rpc('handle_online_order', {
      p_sale_id: saleId,
      p_action: action,
    });

    if (error || !result?.success) {
      return NextResponse.json({ success: false, error: result?.error || error?.message }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar pedido.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
