import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, slug } = body;
    const supabase = createClient(cookies());

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug da loja não informado' }, { status: 400 });
    }

    // 1. LOGIN DE ATACADISTA
    if (action === 'login') {
      const { taxId, password } = body;
      if (!taxId || !password) {
        return NextResponse.json({ success: false, error: 'Informe o CPF/CNPJ e a senha' }, { status: 400 });
      }

      const { data, error } = await supabase.rpc('authenticate_wholesale_customer', {
        p_slug: slug,
        p_tax_id: taxId,
        p_password: password,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // 2. SOLICITAR CADASTRO DE NOVO ATACADISTA
    if (action === 'apply') {
      const {
        name,
        companyName,
        taxId,
        phone,
        email,
        city,
        state,
        monthlyVolume,
        salesChannel,
        businessTime,
      } = body;

      if (!name || !taxId || !phone) {
        return NextResponse.json({ success: false, error: 'Nome, CPF/CNPJ e WhatsApp são obrigatórios' }, { status: 400 });
      }

      const { data, error } = await supabase.rpc('submit_wholesale_application', {
        p_slug: slug,
        p_name: name,
        p_company_name: companyName || null,
        p_tax_id: taxId,
        p_phone: phone,
        p_email: email || null,
        p_city: city || 'Manaus',
        p_state: state || 'AM',
        p_monthly_volume: monthlyVolume || null,
        p_sales_channel: salesChannel || null,
        p_business_time: businessTime || null,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // 3. TROCA DE SENHA (PRIMEIRO ACESSO OU MANUAL)
    if (action === 'change_password') {
      const { customerId, newPassword } = body;
      if (!customerId || !newPassword) {
        return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 });
      }

      const { data, error } = await supabase.rpc('change_wholesale_password', {
        p_slug: slug,
        p_customer_id: customerId,
        p_new_password: newPassword,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // 4. ESQUECI MINHA SENHA
    if (action === 'forgot_password') {
      const { taxId, phone } = body;
      if (!taxId || !phone) {
        return NextResponse.json({ success: false, error: 'Informe seu CPF/CNPJ e seu WhatsApp' }, { status: 400 });
      }

      const { data, error } = await supabase.rpc('request_wholesale_password_reset', {
        p_slug: slug,
        p_tax_id: taxId,
        p_phone: phone,
      });

      if (error) {
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
