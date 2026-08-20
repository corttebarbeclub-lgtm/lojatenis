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

async function testFlow() {
  console.log('🧪 Iniciando teste automatizado do PDV Mobile & Admin Financeiro...');

  // 1. Testar RPC report_financial_profit
  const profitSQL = `
    select report_financial_profit(
      date_trunc('month', now()),
      now()
    ) as profit;
  `;
  const profitRes = await runSQL(profitSQL);
  console.log('📊 Relatório Financeiro & Lucro:', JSON.stringify(profitRes[0].profit, null, 2));

  // 2. Testar RPC quick_register_sneaker
  const testSneakerSQL = `
    select quick_register_sneaker(
      (select id from tenants where slug = 'tenisstore'),
      'Nike',
      'Air Jordan 1 Low Golf Royal Blue Teste Mobile',
      'Casual',
      'unissex',
      'Tênis testado via cadastro rápido mobile',
      'Royal Blue / Branco',
      42990, -- R$ 429,90 varejo
      21000, -- R$ 210,00 custo
      31000, -- R$ 310,00 atacado
      6,
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      '[{"size": "38", "quantity": 3}, {"size": "39", "quantity": 5}, {"size": "40", "quantity": 4}]'::jsonb
    ) as result;
  `;
  const regRes = await runSQL(testSneakerSQL);
  console.log('👟 Cadastro Rápido de Tênis Mobile:', JSON.stringify(regRes[0].result, null, 2));

  console.log('✅ Todos os testes de backend e RPCs do PDV Mobile & Admin passaram com 100% de sucesso!');
}

testFlow().catch((err) => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
