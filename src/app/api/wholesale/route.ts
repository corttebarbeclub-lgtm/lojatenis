import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { verifyCnpjWithReceita } from '@/lib/services/cnpj-validator';

// Gerador de senha amigável temporária
function generateFriendlyPassword() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const prefixes = ['ATACADO', 'TENIS', 'MODA', 'CALCADOS', 'B2B'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}-${randomNum}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, slug } = body;
    const supabase = createClient(cookies());

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug da loja não informado' }, { status: 400 });
    }

    // 1. VERIFICAÇÃO EM TEMPO REAL DE CNPJ NA RECEITA FEDERAL (CNAE DE CALÇADOS)
    if (action === 'verify_cnpj') {
      const { cnpj } = body;
      if (!cnpj) {
        return NextResponse.json({ success: false, error: 'CNPJ não informado' }, { status: 400 });
      }

      const cnpjResult = await verifyCnpjWithReceita(cnpj);
      return NextResponse.json({
        success: true,
        ...cnpjResult,
      });
    }

    // 2. LOGIN DE ATACADISTA
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

    // 3. SOLICITAR CADASTRO DE NOVO ATACADISTA (AUTO-APROVAÇÃO SE CNPJ DE CALÇADOS)
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

      const cleanTaxId = String(taxId).replace(/\D/g, '');
      const isCnpj = cleanTaxId.length === 14;

      let isAutoApproved = false;
      let matchedCnaeCode: string | null = null;
      let matchedCnaeDesc: string | null = null;
      let tempPassword: string | null = null;
      let verifiedCompanyName = companyName;
      let verifiedCity = city;

      // Se for CNPJ, checar na Receita Federal
      if (isCnpj) {
        const cnpjCheck = await verifyCnpjWithReceita(cleanTaxId);
        if (cnpjCheck.isReal && cnpjCheck.isActive && cnpjCheck.isFootwearBusiness) {
          isAutoApproved = true;
          matchedCnaeCode = cnpjCheck.matchedCnae?.code || null;
          matchedCnaeDesc = cnpjCheck.matchedCnae?.desc || null;
          tempPassword = generateFriendlyPassword();
          verifiedCompanyName = cnpjCheck.companyName || companyName;
          verifiedCity = cnpjCheck.city || city;
        }
      }

      // Submeter via RPC v2
      const { data, error } = await supabase.rpc('submit_wholesale_application_v2', {
        p_slug: slug,
        p_name: name,
        p_company_name: verifiedCompanyName || null,
        p_tax_id: taxId,
        p_phone: phone,
        p_email: email || null,
        p_city: verifiedCity || 'Manaus',
        p_state: state || 'AM',
        p_monthly_volume: monthlyVolume || null,
        p_sales_channel: salesChannel || null,
        p_business_time: businessTime || null,
        p_is_auto_approved: isAutoApproved,
        p_cnae_code: matchedCnaeCode,
        p_cnae_description: matchedCnaeDesc,
        p_temp_password: tempPassword,
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ...data,
        isAutoApproved,
        tempPassword,
        matchedCnae: matchedCnaeDesc,
      });
    }

    // 4. TROCA DE SENHA (PRIMEIRO ACESSO OU MANUAL)
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

    // 5. ESQUECI MINHA SENHA
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
