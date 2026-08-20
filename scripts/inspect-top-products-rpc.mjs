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

async function inspectTopProductsRPC() {
  console.log('🔍 Inspecionando report_top_products...');
  const funcDef = await runSQL(`
    select pg_get_functiondef(p.oid)
    from pg_proc p
    join pg_namespace n on p.pronamespace = n.oid
    where p.proname = 'report_top_products';
  `);
  console.log('Definição da função:', funcDef);
}

inspectTopProductsRPC();
