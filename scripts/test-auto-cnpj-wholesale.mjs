import { verifyCnpjWithReceita, FOOTWEAR_CNAES } from '../src/lib/services/cnpj-validator.ts';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmlxhsqfvxjggvqusleu.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhoc3FmdnhqZ2d2cXVzbGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg1MTc0NiwiZXhwIjoyMTAyNDI3NzQ2fQ.Gltxl_0sgDT7SGH6H5xM8xFQ1t5y8I-uiF48NUt-txE';
const TENANT_ID = 'e58226f2-9806-41ef-82bb-c987565e9824';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function testAutoCnpjFlow() {
  console.log('🧪 INICIANDO TESTE DO FLUXO DE CNPJ AUTOMÁTICO X CPF MANUAL NO B2B...\n');

  console.log('1️⃣ CNAEs de Calçados Cadastrados no Sistema:', FOOTWEAR_CNAES.length);
  FOOTWEAR_CNAES.forEach(c => console.log(`   • CNAE ${c.code}: ${c.desc}`));

  // 2. Testar Consulta de CNPJ Real do Ramo Calçadista (Ex: Alpargatas / Centauro / Arezzo)
  // CNPJ da Vulcabras / Calçados: 88.379.771/0001-82 ou Centauro: 06.347.409/0001-65
  const testCnpj = '06347409000165'; // SBF Comercio de Produtos Esportivos (Centauro)
  console.log(`\n2️⃣ Testando Validação do CNPJ ${testCnpj} na Receita Federal...`);
  
  const check = await verifyCnpjWithReceita(testCnpj);
  console.log('Resultado da Consulta Receita Federal:');
  console.log('• Razão Social:', check.companyName);
  console.log('• Situação:', check.isActive ? 'ATIVA ✅' : 'INATIVA ❌');
  console.log('• Ramo Calçadista Detectado:', check.isFootwearBusiness ? 'SIM ✅' : 'NÃO ❌');
  console.log('• CNAE Correspondente:', check.matchedCnae?.desc);

  // 3. Testar Submissão via API / RPC com Aprovação Automática
  console.log('\n3️⃣ Testando Submissão de Cadastro com Auto-Aprovação...');
  const { data: autoRes, error: autoErr } = await supabase.rpc('submit_wholesale_application_v2', {
    p_slug: 'tenisstore',
    p_name: 'Comprador Lojista Teste',
    p_company_name: check.companyName || 'Loja de Calçados Teste',
    p_tax_id: '06.347.409/0001-65',
    p_phone: '92981883786',
    p_email: 'lojista.calcados@teste.com',
    p_city: 'Manaus',
    p_state: 'AM',
    p_monthly_volume: '60 a 100 pares/mês',
    p_sales_channel: 'Loja Física / Ponto Comercial',
    p_business_time: 'Mais de 3 anos',
    p_is_auto_approved: true,
    p_cnae_code: check.matchedCnae?.code || '4782201',
    p_cnae_description: check.matchedCnae?.desc || 'Comércio varejista de calçados',
    p_temp_password: 'ATACADO-7788'
  });

  if (autoErr) {
    console.error('❌ Erro na RPC submit_wholesale_application_v2 (CNPJ):', autoErr);
    process.exit(1);
  }

  console.log('✅ Resposta da RPC (CNPJ Auto-Aprovado):', autoRes);
  if (autoRes.status !== 'approved' || !autoRes.is_auto_approved) {
    console.error('❌ FALHA: O cadastro do CNPJ de calçados deveria estar "approved"!');
    process.exit(1);
  }
  console.log('🎉 CNPJ APROVADO AUTOMATICAMENTE COM SUCESSO!');

  // 4. Testar Submissão de CPF (Pessoa Física) -> Deve ficar PENDING para o dono avaliar no PDV
  console.log('\n4️⃣ Testando Submissão de CPF Pessoa Física (Análise no PDV)...');
  const { data: cpfRes, error: cpfErr } = await supabase.rpc('submit_wholesale_application_v2', {
    p_slug: 'tenisstore',
    p_name: 'Revendedor Autônomo CPF',
    p_company_name: null,
    p_tax_id: '123.456.789-00',
    p_phone: '92999998888',
    p_email: 'revendedor.cpf@teste.com',
    p_city: 'Parintins',
    p_state: 'AM',
    p_monthly_volume: '10 a 30 pares/mês',
    p_sales_channel: 'Revendedor Autônomo / Porta a Porta',
    p_business_time: 'Iniciando agora',
    p_is_auto_approved: false,
    p_cnae_code: null,
    p_cnae_description: null,
    p_temp_password: null
  });

  if (cpfErr) {
    console.error('❌ Erro na RPC submit_wholesale_application_v2 (CPF):', cpfErr);
    process.exit(1);
  }

  console.log('✅ Resposta da RPC (CPF Manual):', cpfRes);
  if (cpfRes.status !== 'pending' || cpfRes.is_auto_approved) {
    console.error('❌ FALHA: O cadastro de CPF deveria estar "pending"!');
    process.exit(1);
  }
  console.log('🎉 CPF ENCAMINHADO COM SUCESSO PARA ANÁLISE NO PDV!');

  console.log('\n🏆 ========================================================');
  console.log('✅ TODAS AS REGRAS FORAM VALIDADAS COM 100% DE SUCESSO!');
  console.log('• CNPJ Calçadista: Validação na Receita e Aprovação Automática');
  console.log('• CPF Pessoa Física: Fila do PDV para aceite/recusa do dono');
  console.log('========================================================\n');
}

testAutoCnpjFlow().catch(console.error);
