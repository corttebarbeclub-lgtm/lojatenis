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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, email } = body;
    let { tenantId } = body;
    const supabase = getAdminClient();

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Nome do cliente é obrigatório.' }, { status: 400 });
    }

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'tenisstore')
        .single();
      tenantId = tenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Loja não identificada.' }, { status: 400 });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        tenant_id: tenantId,
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
      })
      .select('id, full_name, phone, email')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente cadastrado com sucesso!',
      customer,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao cadastrar cliente.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
