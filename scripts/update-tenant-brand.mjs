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

async function updateTenant() {
  console.log('🔄 Atualizando dados do Tenant para "HB Tênis Manaus"...');
  await runSQL(`
    update tenants
    set name = 'HB Tênis Manaus',
        logo_url = '/hb-logo.png',
        description = 'HB Tênis Manaus — A sua loja de sneakers, streetwear e calçados exclusivos em Manaus e todo o Amazonas.'
    where slug = 'tenisstore';
  `);
  console.log('✅ Tenant atualizado com sucesso!');
}

updateTenant().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
