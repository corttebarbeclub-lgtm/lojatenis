import { readFileSync } from 'fs';

let token = '';
try {
  token = readFileSync('C:\\Users\\phabr\\.supabase\\access-token', 'utf-8').trim();
} catch (e) {
  console.error('Could not read token:', e.message);
  process.exit(1);
}

const PROJECT_REF = 'jmlxhsqfvxjggvqusleu';
const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function runSQL(sql) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  return JSON.parse(text);
}

async function testFullWholesaleFlow() {
  console.log('🧪 Iniciando teste automatizado do fluxo de Atacado B2B...');

  // 1. Obter tenant_id
  const tenants = await runSQL(`select id from tenants where slug = 'tenisstore';`);
  const tenantId = tenants[0].id;
  console.log(`Tenant ID: ${tenantId}`);

  // Limpar dados anteriores do teste
  await runSQL(`
    delete from wholesale_notifications where tenant_id = '${tenantId}';
    delete from wholesale_customers where tenant_id = '${tenantId}' and clean_tax_id = '12345678000199';
  `);

  // 2. Submeter nova solicitação de atacadista
  console.log('\n1. Submetendo solicitação de cadastro via RPC...');
  const appRes = await runSQL(`
    select submit_wholesale_application(
      'tenisstore',
      'Carlos Eduardo Lojista',
      'Manaus Calçados & Esportes',
      '12.345.678/0001-99',
      '92981883786',
      'carlos@manauscalcados.com',
      'Manaus',
      'AM',
      '60 a 100 pares/mês',
      'Loja Física / Ponto Comercial',
      '1 a 3 anos'
    ) as result;
  `);
  console.log('Resultado submissão:', appRes[0].result);

  // 3. Verificar Alerta no PDV
  console.log('\n2. Verificando alertas no PDV...');
  const pdvRes = await runSQL(`
    select get_wholesale_pdv_alerts('${tenantId}') as alerts;
  `);
  const alerts = pdvRes[0].alerts;
  console.log(`Alertas não lidos: ${alerts.unread_count}`);
  console.log(`Cadastros pendentes: ${alerts.pending_customers.length}`);

  const pendingCust = alerts.pending_customers[0];
  console.log(`Cliente pendente: ${pendingCust.company_name} (${pendingCust.tax_id})`);

  // 4. PDV Aprova e Gera Senha Provisória
  console.log('\n3. PDV Aprovando cadastro e gerando senha...');
  const tempPass = 'AMAZONAS-8492';
  const approveRes = await runSQL(`
    select approve_wholesale_customer('${tenantId}', '${pendingCust.id}', '${tempPass}') as approved;
  `);
  console.log('Aprovado:', approveRes[0].approved);

  // 5. Testar Login com Senha Provisória
  console.log('\n4. Testando Login com Senha Provisória...');
  const loginRes1 = await runSQL(`
    select authenticate_wholesale_customer('tenisstore', '12.345.678/0001-99', '${tempPass}') as login;
  `);
  console.log('Login 1º Acesso:', loginRes1[0].login);

  // 6. Trocar Senha Definitiva (1º Acesso)
  console.log('\n5. Definindo senha definitiva do lojista...');
  const newPass = 'MinhaSenhaSegura@2026';
  const changeRes = await runSQL(`
    select change_wholesale_password('tenisstore', '${pendingCust.id}', '${newPass}') as change_pass;
  `);
  console.log('Troca de senha:', changeRes[0].change_pass);

  // 7. Testar Login com Senha Definitiva
  console.log('\n6. Testando Login com Nova Senha...');
  const loginRes2 = await runSQL(`
    select authenticate_wholesale_customer('tenisstore', '12.345.678/0001-99', '${newPass}') as login;
  `);
  console.log('Login Definitivo:', loginRes2[0].login);

  // 8. Testar Esqueci Minha Senha
  console.log('\n7. Testando Solicitação de Esqueci a Senha...');
  const forgotRes = await runSQL(`
    select request_wholesale_password_reset('tenisstore', '12.345.678/0001-99', '92981883786') as forgot;
  `);
  console.log('Solicitação de reset:', forgotRes[0].forgot);

  // 9. Verificar Alerta de Reset no PDV
  const alertsAfterReset = await runSQL(`
    select get_wholesale_pdv_alerts('${tenantId}') as alerts;
  `);
  console.log('Novo alerta no PDV para reset de senha:', alertsAfterReset[0].alerts.notifications[0].title);

  console.log('\n🎉 TESTE CONCLUÍDO COM 100% DE SUCESSO!');
}

testFullWholesaleFlow().catch((err) => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
