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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const saleId = searchParams.get('id');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    const supabase = getAdminClient();

    if (saleId) {
      const { data: order, error } = await supabase
        .from('sales')
        .select(`
          id,
          status,
          fulfillment_status,
          subtotal_cents,
          total_cents,
          delivery_fee_cents,
          delivery_address,
          customer_name,
          customer_phone,
          customer_email,
          notes,
          created_at,
          updated_at,
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
          )
        `)
        .eq('id', saleId)
        .single();

      if (error || !order) {
        return NextResponse.json({ success: false, error: 'Pedido não encontrado.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, order });
    }

    if (email || phone) {
      let query = supabase.from('sales').select(`
        id,
        status,
        fulfillment_status,
        subtotal_cents,
        total_cents,
        delivery_fee_cents,
        delivery_address,
        customer_name,
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
        )
      `);

      if (email) query = query.ilike('customer_email', email.trim());
      if (phone) query = query.ilike('customer_phone', `%${phone.replace(/\D/g, '').slice(-8)}%`);

      const { data: orders, error } = await query.order('created_at', { ascending: false }).limit(20);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, orders: orders ?? [] });
    }

    return NextResponse.json({ success: false, error: 'Parâmetros insuficientes.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao consultar pedido.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
