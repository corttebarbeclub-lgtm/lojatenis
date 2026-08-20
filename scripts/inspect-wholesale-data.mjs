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

async function inspectWholesale() {
  const custs = await runSQL(`select * from wholesale_customers;`);
  console.log('Wholesale customers:', custs);

  const notifs = await runSQL(`select * from wholesale_notifications;`);
  console.log('Wholesale notifications:', notifs);

  const rpcAlerts = await runSQL(`
    select get_wholesale_pdv_alerts('e58226f2-9806-41ef-82bb-c987565e9824'::uuid);
  `);
  console.log('RPC get_wholesale_pdv_alerts result for HB Tenis Manaus:', JSON.stringify(rpcAlerts, null, 2));
}

inspectWholesale();
