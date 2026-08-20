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

// 1. POST: Cadastrar alerta de "Avise-me Quando Chegar"
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, variantId, size, customerName, email, phone } = body;
    let { tenantId } = body;
    const supabase = getAdminClient();

    if (!productId || !email) {
      return NextResponse.json({ success: false, error: 'E-mail e produto são obrigatórios.' }, { status: 400 });
    }

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'tenisstore')
        .single();
      tenantId = tenant?.id;
    }

    const { data: alertRow, error } = await supabase
      .from('stock_alerts')
      .insert({
        tenant_id: tenantId,
        product_id: productId,
        variant_id: variantId || null,
        size: size || null,
        customer_name: customerName?.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Perfeito! Você será avisado por e-mail assim que este tênis chegar no estoque!',
      alert: alertRow,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao cadastrar alerta.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
