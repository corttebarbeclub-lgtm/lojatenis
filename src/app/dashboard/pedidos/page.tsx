import { requireAppUser } from '@/lib/tenant';
import { FulfillmentManagerClient } from '@/components/admin/fulfillment-manager-client';

export default async function FulfillmentPage() {
  const user = await requireAppUser();

  return <FulfillmentManagerClient tenantId={user.tenant_id} />;
}
