import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

let token = '';
try {
  token = readFileSync('C:\\Users\\phabr\\.supabase\\access-token', 'utf-8').trim();
} catch (e) {
  console.error('Could not read token:', e.message);
  process.exit(1);
}

const PROJECT_REF = 'jmlxhsqfvxjggvqusleu';
const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const migrations = [
  '016_wholesale.sql',
  '017_sample_products.sql',
];

async function runSQL(sql, filename) {
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
  return text;
}

async function main() {
  for (const filename of migrations) {
    const filepath = join(migrationsDir, filename);
    const sql = readFileSync(filepath, 'utf-8');

    process.stdout.write(`Applying ${filename}... `);
    try {
      await runSQL(sql, filename);
      console.log('✅ OK');
    } catch (err) {
      console.log(`❌ FALHOU: ${err.message}`);
      process.exit(1);
    }
  }
  console.log('\n🚀 Todas as migrations aplicadas com sucesso no banco Supabase!');
}

main();
