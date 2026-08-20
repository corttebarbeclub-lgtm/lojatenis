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

interface CartItemSubmit {
  variantId: string;
  quantity: number;
  priceCents: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      address,
      paymentMethod,
      shippingCents,
      items,
      notes,
    } = body;
    let { tenantId } = body;

    const supabase = getAdminClient();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Carrinho vazio.' }, { status: 400 });
    }

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'tenisstore')
        .single();
      tenantId = tenant?.id;
    }

    const formattedItems = (items as CartItemSubmit[]).map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price_cents: item.priceCents,
    }));

    const { data: result, error } = await supabase.rpc('create_storefront_order', {
      p_tenant_id: tenantId,
      p_customer_name: customer?.name || 'Cliente Loja Online',
      p_customer_phone: customer?.phone || '',
      p_customer_email: customer?.email || '',
      p_payment_method: paymentMethod || 'pix',
      p_delivery_fee_cents: shippingCents || 0,
      p_delivery_address: address || {},
      p_items: formattedItems,
      p_notes: notes || '',
    });

    if (error || !result?.success) {
      return NextResponse.json(
        { success: false, error: result?.error || error?.message || 'Erro ao processar pedido.' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar pedido no servidor.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
