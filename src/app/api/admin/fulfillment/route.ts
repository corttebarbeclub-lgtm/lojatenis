import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmlxhsqfvxjggvqusleu.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

// GET: Listar todos os pedidos online (aprovados e em andamento) para gestão de fulfillment
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let tenantId = searchParams.get('tenant_id');
    const statusFilter = searchParams.get('status'); // optional filter
    const supabase = getAdminClient();

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'tenisstore')
        .single();
      tenantId = tenant?.id ?? null;
    }

    let query = supabase
      .from('sales')
      .select(`
        id,
        status,
        order_source,
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
        ),
        payments (
          id,
          method,
          amount_cents
        )
      `)
      .eq('tenant_id', tenantId!)
      .eq('order_source', 'storefront')
      .order('created_at', { ascending: true });

    // Filtrar por status de fulfillment se solicitado
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('fulfillment_status', statusFilter);
    } else {
      // Por padrão, exibir todos menos 'none' (vendas presenciais)
      query = query.in('fulfillment_status', [
        'separating',
        'in_transit',
        'shipped_moto',
        'shipped_boat',
        'delivered',
        'cancelled',
      ]);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar pedidos.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Atualizar status de fulfillment ou cancelar pedido
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saleId, action, adminPassword } = body;
    const supabase = getAdminClient();

    if (!saleId || !action) {
      return NextResponse.json(
        { success: false, error: 'ID do pedido e ação são obrigatórios.' },
        { status: 400 }
      );
    }

    // Ação de cancelamento exige senha mestre do admin/dono
    if (action === 'cancel') {
      if (!adminPassword) {
        return NextResponse.json(
          { success: false, error: 'Senha mestre obrigatória para cancelamento.' },
          { status: 403 }
        );
      }

      // Verificar senha mestre do dono usando signInWithPassword
      const { data: ownerUser } = await supabase
        .from('app_users')
        .select('id, email, role')
        .eq('role', 'owner')
        .limit(1)
        .single();

      if (!ownerUser?.email) {
        return NextResponse.json(
          { success: false, error: 'Proprietário não encontrado.' },
          { status: 500 }
        );
      }

      // Criar um cliente separado para testar a autenticação sem afetar a sessão
      const { createClient } = await import('@supabase/supabase-js');
      const authTestClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmlxhsqfvxjggvqusleu.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { error: authError } = await authTestClient.auth.signInWithPassword({
        email: ownerUser.email,
        password: adminPassword,
      });

      if (authError) {
        return NextResponse.json(
          { success: false, error: 'Senha mestre do Dono incorreta. Cancelamento negado.' },
          { status: 403 }
        );
      }

      // Cancelar e devolver ao estoque via RPC
      const { data: cancelResult, error: cancelError } = await supabase.rpc(
        'cancel_fulfillment_order',
        { p_sale_id: saleId }
      );

      if (cancelError || !cancelResult?.success) {
        return NextResponse.json(
          { success: false, error: cancelResult?.error || cancelError?.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: cancelResult.message,
      });
    }

    // Ações de mudança de status (separating → in_transit → shipped_moto/shipped_boat → delivered)
    const VALID_TRANSITIONS: Record<string, string[]> = {
      separating: ['in_transit', 'shipped_moto', 'shipped_boat'],
      in_transit: ['shipped_moto', 'shipped_boat', 'delivered'],
      shipped_moto: ['delivered'],
      shipped_boat: ['delivered'],
    };

    // Buscar pedido atual
    const { data: sale } = await supabase
      .from('sales')
      .select('id, fulfillment_status')
      .eq('id', saleId)
      .single();

    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado.' },
        { status: 404 }
      );
    }

    const currentStatus = sale.fulfillment_status || 'separating';
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: `Transição de "${currentStatus}" para "${action}" não permitida.`,
        },
        { status: 400 }
      );
    }

    // Atualizar fulfillment_status
    const { error: updateError } = await supabase
      .from('sales')
      .update({ fulfillment_status: action, updated_at: new Date().toISOString() })
      .eq('id', saleId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    const STATUS_LABELS: Record<string, string> = {
      in_transit: 'Em Trânsito',
      shipped_moto: 'Enviado via Uber/Mototáxi',
      shipped_boat: 'Enviado via Barco',
      delivered: 'Entregue ao Cliente',
    };

    return NextResponse.json({
      success: true,
      message: `Status atualizado para: ${STATUS_LABELS[action] || action}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar pedido.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
