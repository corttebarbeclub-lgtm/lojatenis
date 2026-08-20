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
    const { action, pin, newPin } = body;
    let { tenantId } = body;
    const supabase = getAdminClient();

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'tenisstore')
        .single();
      tenantId = tenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Loja não identificada' }, { status: 400 });
    }

    // 1. Validar Senha Mestra para Liberar Desconto
    if (action === 'verify_pin') {
      if (!pin) {
        return NextResponse.json({ success: false, error: 'Digite a senha mestra de admin.' }, { status: 400 });
      }

      const { data, error } = await supabase.rpc('verify_admin_master_pin', {
        p_tenant_id: tenantId,
        p_pin: pin,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // 2. Alterar Senha Mestra (Dono)
    if (action === 'update_pin') {
      if (!pin || !newPin) {
        return NextResponse.json({ success: false, error: 'Informe a senha atual e a nova senha mestra.' }, { status: 400 });
      }

      const { data: verifyData } = await supabase.rpc('verify_admin_master_pin', {
        p_tenant_id: tenantId,
        p_pin: pin,
      });

      if (!verifyData?.success) {
        return NextResponse.json({ success: false, error: 'Senha mestra atual incorreta.' }, { status: 400 });
      }

      const { error: updateError } = await supabase
        .from('tenants')
        .update({ admin_master_pin: newPin })
        .eq('id', tenantId);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Nova senha mestra de admin salva com sucesso!' });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar autorização.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
