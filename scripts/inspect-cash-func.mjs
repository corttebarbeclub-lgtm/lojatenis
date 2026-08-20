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

async function checkFunc() {
  const res = await runSQL(`
    SELECT pg_get_functiondef(oid)
    FROM pg_proc
    WHERE proname = 'check_cash_register_tenant_consistency';
  `);
  console.log(res?.[0]?.pg_get_functiondef);
}

checkFunc().catch(console.error);
