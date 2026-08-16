'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { registerMovementSchema, setMinQuantitySchema } from '@/lib/validations/inventory';
import type { RegisterMovementInput, SetMinQuantityInput } from '@/lib/validations/inventory';

export async function registerMovement(input: RegisterMovementInput) {
  const parsed = registerMovementSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await requireAppUser();
  const supabase = createClient(cookies());
  const { variantId, type, quantity, reason } = parsed.data;

  const { data, error } = await supabase.rpc('register_inventory_movement', {
    p_variant_id: variantId,
    p_type: type,
    p_quantity: quantity,
    p_reason: reason || null,
  });

  if (error) {
    if (error.message.includes('estoque negativo')) {
      return { error: 'Essa operação deixaria o estoque negativo.' };
    }
    return { error: 'Não foi possível registrar a movimentação.' };
  }

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'inventory_movement_registered',
    entity_type: 'inventory_movement',
    entity_id: null,
    metadata: { variant_id: variantId, type, quantity, reason: reason || null },
  });

  revalidatePath('/dashboard/estoque');
  return { success: true, inventory: data };
}

export async function setMinQuantity(input: SetMinQuantityInput) {
  const parsed = setMinQuantitySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient(cookies());
  const { variantId, minQuantity } = parsed.data;

  const { data, error } = await supabase.rpc('set_min_quantity', {
    p_variant_id: variantId,
    p_min_quantity: minQuantity,
  });

  if (error) {
    return { error: 'Não foi possível definir o estoque mínimo.' };
  }

  revalidatePath('/dashboard/estoque');
  return { success: true, inventory: data };
}
