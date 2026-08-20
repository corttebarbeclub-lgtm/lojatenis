import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { CollaboratorsClient } from '@/components/collaborators/collaborators-client';

export interface Collaborator {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string | null;
  role_profile: 'restricted_sales' | 'manager' | 'full_access';
  permissions: string[];
  password_hash: string;
  is_active: boolean;
  created_at: string;
}

export default async function ColaboradoresPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('*')
    .eq('tenant_id', user.tenant_id)
    .order('created_at', { ascending: true })
    .returns<Collaborator[]>();

  return (
    <CollaboratorsClient
      initialCollaborators={collaborators ?? []}
      tenantId={user.tenant_id}
    />
  );
}
