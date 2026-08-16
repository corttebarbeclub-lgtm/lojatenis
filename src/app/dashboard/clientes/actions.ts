'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { customerSchema } from '@/lib/validations/pdv';
import type { CustomerInput } from '@/lib/validations/pdv';

export async function createCustomer(input: CustomerInput) {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from('customers')
    .insert({
      tenant_id: user.tenant_id,
      full_name: parsed.data.fullName,
      cpf: parsed.data.cpf || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
    })
    .select('id, full_name')
    .single();

  if (error) return { error: 'Não foi possível cadastrar o cliente.' };

  revalidatePath('/dashboard/clientes');
  revalidatePath('/dashboard/pdv');
  return { success: true, customer: data };
}
