import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { HeroManagerClient } from '@/components/admin/hero-manager-client';

export const metadata: Metadata = {
  title: 'Personalização da Hero — HB Tênis Admin',
};

export default async function HeroAdminPage() {
  const supabase = createClient(cookies());
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', 'tenisstore')
    .single();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <HeroManagerClient tenantId={tenant?.id} />
    </div>
  );
}
