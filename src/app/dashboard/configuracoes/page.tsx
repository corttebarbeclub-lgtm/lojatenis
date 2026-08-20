import { requireAppUser } from '@/lib/tenant';
import { SettingsManagerClient } from '@/components/admin/settings-manager-client';

export default async function SettingsPage() {
  await requireAppUser();

  return <SettingsManagerClient />;
}
