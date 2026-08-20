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

// GET: Buscar Alertas e Cadastros Pendentes
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

    if (!tenantId) {
      return NextResponse.json({ error: 'tenant_id é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('get_wholesale_pdv_alerts', {
      p_tenant_id: tenantId,
    });

    if (error) {
      console.error('Erro RPC get_wholesale_pdv_alerts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Aprovar ou Redefinir Senha
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, customerId, tempPassword } = body;
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

    if (!tenantId || !customerId || !tempPassword) {
      return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 });
    }

    if (action === 'approve') {
      const { data, error } = await supabase.rpc('approve_wholesale_customer', {
        p_tenant_id: tenantId,
        p_customer_id: customerId,
        p_temp_password: tempPassword,
      });

      if (error) {
        console.error('Erro RPC approve_wholesale_customer:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    if (action === 'reset_password') {
      const { data, error } = await supabase.rpc('reset_wholesale_customer_password', {
        p_tenant_id: tenantId,
        p_customer_id: customerId,
        p_temp_password: tempPassword,
      });

      if (error) {
        console.error('Erro RPC reset_wholesale_customer_password:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
