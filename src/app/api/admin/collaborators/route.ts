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

// 1. GET: Listar Colaboradores da Loja
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

    const { data: collaborators, error } = await supabase
      .from('collaborators')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, collaborators: collaborators ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar colaboradores.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST: Criar Novo Colaborador
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, roleProfile, permissions } = body;
    let { tenantId } = body;
    const supabase = getAdminClient();

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Nome e e-mail são obrigatórios.' }, { status: 400 });
    }

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'tenisstore')
        .single();
      tenantId = tenant?.id;
    }

    // Inserir na tabela collaborators
    const { data: collaborator, error } = await supabase
      .from('collaborators')
      .insert({
        tenant_id: tenantId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        role_profile: roleProfile || 'restricted_sales',
        permissions: permissions || [],
        password_hash: password?.trim() || '123456',
        is_active: true,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Criar ou ativar vendedor correspondente na tabela sellers para o PDV
    await supabase.from('sellers').upsert(
      {
        tenant_id: tenantId,
        full_name: name.trim(),
        is_active: true,
      },
      { onConflict: 'tenant_id,full_name' }
    );

    return NextResponse.json({
      success: true,
      message: 'Colaborador cadastrado com sucesso!',
      collaborator,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao cadastrar colaborador.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 3. PUT: Atualizar Colaborador
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, phone, password, roleProfile, permissions, isActive } = body;
    const supabase = getAdminClient();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do colaborador não informado.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (password) updates.password_hash = password.trim();
    if (roleProfile) updates.role_profile = roleProfile;
    if (permissions) updates.permissions = permissions;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data: updated, error } = await supabase
      .from('collaborators')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Colaborador atualizado com sucesso!',
      collaborator: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar colaborador.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 4. DELETE: Excluir Colaborador
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const supabase = getAdminClient();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });
    }

    const { error } = await supabase.from('collaborators').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Colaborador removido com sucesso!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir colaborador.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
