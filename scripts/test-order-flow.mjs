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
  console.log('--- Testando Tabelas e Estrutura de Vendas ---');
  const { data: cols } = await supabase.from('sales').select('*').limit(1);
  console.log('Colunas de sales:', Object.keys(cols?.[0] || {}));

  const { data: pData, error: pErr } = await supabase.from('payments').select('*').limit(1);
  console.log('Tabela payments:', { ok: !pErr, count: pData?.length, sample: pData?.[0] });

  // Testar chamada à API local de pedidos online
  const res = await fetch('http://localhost:3000/api/pdv/online-orders');
  const queueData = await res.json();
  console.log('API /api/pdv/online-orders:', queueData);
}

run();
