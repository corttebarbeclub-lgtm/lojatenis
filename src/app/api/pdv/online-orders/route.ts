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

// 1. GET: Listar pedidos online no PDV (pendentes, em separação, enviados)
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
        fulfillment_status,
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
      .in('status', ['pending_approval', 'completed', 'waiting_payment'])
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar pedidos online.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST: Atualizar status do pedido no PDV (Aprovar, Em Separação, Despachar com Link Uber)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saleId, action, uberUrl } = body; 
    // action: 'approve' | 'set_paid' | 'dispatch_uber' | 'delivered' | 'reject'
    const supabase = getAdminClient();

    if (!saleId || !action) {
      return NextResponse.json({ success: false, error: 'ID do pedido e ação são obrigatórios.' }, { status: 400 });
    }

    // Buscar dados atuais do pedido
    const { data: existingSale, error: fetchErr } = await supabase
      .from('sales')
      .select('id, delivery_address, notes, status, fulfillment_status')
      .eq('id', saleId)
      .single();

    if (fetchErr || !existingSale) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado.' }, { status: 404 });
    }

    let updatedStatus = existingSale.status;
    let updatedFulfillment = existingSale.fulfillment_status || 'pending_approval';
    const deliveryAddress = existingSale.delivery_address || {};

    if (action === 'approve') {
      updatedStatus = 'waiting_payment';
      updatedFulfillment = 'waiting_payment';
    } else if (action === 'set_paid') {
      updatedStatus = 'completed';
      updatedFulfillment = 'in_preparation';
    } else if (action === 'dispatch_uber') {
      updatedStatus = 'completed';
      updatedFulfillment = 'shipped';
      if (uberUrl) {
        deliveryAddress.uber_tracking_url = uberUrl;
      }
    } else if (action === 'delivered') {
      updatedStatus = 'completed';
      updatedFulfillment = 'delivered';
    } else if (action === 'reject') {
      // Se recusar, estorna estoque via RPC
      await supabase.rpc('handle_online_order', {
        p_sale_id: saleId,
        p_action: 'reject',
      });
      return NextResponse.json({ success: true, message: 'Pedido recusado e estoque liberado.' });
    }

    const { error: updateErr } = await supabase
      .from('sales')
      .update({
        status: updatedStatus,
        fulfillment_status: updatedFulfillment,
        delivery_address: deliveryAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', saleId);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sale_id: saleId,
      status: updatedStatus,
      fulfillment_status: updatedFulfillment,
      uber_tracking_url: deliveryAddress.uber_tracking_url,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar ação no pedido.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
