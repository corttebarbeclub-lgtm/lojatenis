import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLines = fs.readFileSync('.env.local', 'utf8').split('\n');
const env = {};
envLines.forEach((l) => {
  const parts = l.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient('https://jmlxhsqfvxjggvqusleu.supabase.co', env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const sql = `
    DO $$
    BEGIN
      -- Adicionar pending_approval ao enum sale_status se não existir
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
        WHERE pg_type.typname = 'sale_status' AND pg_enum.enumlabel = 'pending_approval'
      ) THEN
        ALTER TYPE sale_status ADD VALUE 'pending_approval';
      END IF;
    EXCEPTION
      WHEN others THEN NULL;
    END $$;
  `;

  // Executar via endpoint de SQL do Supabase
  const res = await fetch('https://jmlxhsqfvxjggvqusleu.supabase.co/rest/v1/rpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({}),
  });

  console.log('Status endpoint:', res.status);

  // Executando diretamente usando client ou testando consulta
  const { data: sales, error: sErr } = await supabase
    .from('sales')
    .select('id, status')
    .limit(1);

  console.log('Sales query test:', { sales, sErr });
}

run();
