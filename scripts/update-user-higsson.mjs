import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jmlxhsqfvxjggvqusleu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhoc3FmdnhqZ2d2cXVzbGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg1MTc0NiwiZXhwIjoyMTAyNDI3NzQ2fQ.Gltxl_0sgDT7SGH6H5xM8xFQ1t5y8I-uiF48NUt-txE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateUserName() {
  console.log('🔄 Atualizando nome do usuário para Higsson...');

  const { data: users, error } = await supabase
    .from('app_users')
    .update({ full_name: 'Higsson' })
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select();

  console.log('✅ Usuários atualizados:', users?.length);
}

updateUserName();
