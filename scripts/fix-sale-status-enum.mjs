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

async function fixEnum() {
  console.log('🚀 Atualizando enum sale_status com pending_approval...');

  const sql = `
    -- Adicionar valores ao enum sale_status
    ALTER TYPE sale_status ADD VALUE IF NOT EXISTS 'pending_approval';
    ALTER TYPE sale_status ADD VALUE IF NOT EXISTS 'rejected';

    -- Recarregar cache de schema do PostgREST
    NOTIFY pgrst, 'reload schema';
  `;

  await runSQL(sql);
  console.log('✅ Enum sale_status atualizado com sucesso com pending_approval e rejected!');
}

fixEnum().catch((err) => {
  console.error('❌ Erro:', err);
});
