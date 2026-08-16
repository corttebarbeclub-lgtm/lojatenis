import { redirect } from 'next/navigation';
import { getCurrentAppUser } from '@/lib/tenant';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAppUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
