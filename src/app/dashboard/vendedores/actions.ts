'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { sellerSchema } from '@/lib/validations/pdv';
import type { SellerInput } from '@/lib/validations/pdv';

export async function createSeller(input: SellerInput) {
  const parsed = sellerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from('sellers')
    .insert({
      tenant_id: user.tenant_id,
      full_name: parsed.data.fullName,
      commission_percent: parsed.data.commissionPercent,
    })
    .select('id, full_name')
    .single();

  if (error) return { error: 'Não foi possível cadastrar o vendedor.' };

  revalidatePath('/dashboard/vendedores');
  revalidatePath('/dashboard/pdv');
  return { success: true, seller: data };
}
