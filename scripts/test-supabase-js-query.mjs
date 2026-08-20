import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

let token = '';
try {
  token = readFileSync('C:\\Users\\phabr\\.supabase\\access-token', 'utf-8').trim();
} catch (e) {
  console.error('Could not read token:', e.message);
  process.exit(1);
}

// Vamos simular a query exatamente como o Next.js faz no server com o supabase-js
const SUPABASE_URL = 'https://jmlxhsqfvxjggvqusleu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testando query de product_variants...');
