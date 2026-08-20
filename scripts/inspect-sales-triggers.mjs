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

async function checkTriggers() {
  const sql = `
    SELECT tgname, pg_get_triggerdef(oid)
    FROM pg_trigger
    WHERE tgrelid = 'sales'::regclass;
  `;

  const triggers = await runSQL(sql);
  console.log('Triggers on sales:', triggers);

  // Também checar constraints
  const sqlCons = `
    SELECT conname, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'sales'::regclass;
  `;
  const constraints = await runSQL(sqlCons);
  console.log('Constraints on sales:', constraints);
}

checkTriggers().catch(console.error);
