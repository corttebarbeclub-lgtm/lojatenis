'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';

export async function resolveSyncConflict(conflictId: string, note: string) {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { error } = await supabase
    .from('sync_conflicts')
    .update({
      status: 'resolved',
      resolved_by: user.id,
      resolution_note: note || null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', conflictId)
    .eq('tenant_id', user.tenant_id);

  if (error) return { error: 'Não foi possível marcar o conflito como resolvido.' };

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'sync_conflict_resolved',
    entity_type: 'sync_conflict',
    entity_id: conflictId,
    metadata: { note: note || null },
  });

  revalidatePath('/dashboard/pdv/conflitos');
  return { success: true };
}
