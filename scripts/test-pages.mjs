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
  return JSON.parse(await resp.text());
}

async function testAll() {
  const prods = await runSQL("select id, name from products where tenant_id = (select id from tenants where slug = 'tenisstore')");
  console.log('📦 Produtos reais cadastrados no banco:', prods);

  const urls = [
    'http://localhost:3000/loja/tenisstore',
    'http://localhost:3000/loja/tenisstore/atacado',
    'http://localhost:3000/loja/tenisstore/checkout',
  ];

  if (prods.length > 0) {
    urls.push(`http://localhost:3000/loja/tenisstore/produto/${prods[0].id}`);
  }

  console.log('Testing full storefront routes...');
  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log(`[${res.status}] ${u}`);
    } catch (e) {
      console.error(`[ERR] ${u}:`, e.message);
    }
  }
}

testAll();
