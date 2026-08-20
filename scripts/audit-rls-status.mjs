import { readFileSync } from 'fs';

let token = readFileSync('C:\\Users\\phabr\\.supabase\\access-token', 'utf-8').trim();
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
  return JSON.parse(await resp.text());
}

async function auditRLS() {
  const tables = await runSQL(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  console.log('📊 Status de RLS nas Tabelas do Banco:');
  for (const t of tables) {
    console.log(`- ${t.tablename.padEnd(30)}: RLS ${t.rowsecurity ? '✅ ATIVADO' : '⚠️ DESATIVADO'}`);
  }
}

auditRLS().catch(console.error);
