import { cookies } from 'next/headers';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PLAN_LABELS: Record<string, string> = {
  basic: 'Básico',
  pro: 'Profissional',
  premium: 'Premium',
};

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function startOfDayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function DashboardPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const [
    { data: tenant },
    { data: subscription },
    { data: salesToday },
    { data: salesMonth },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from('tenants').select('name').eq('id', user.tenant_id).single(),
    supabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('tenant_id', user.tenant_id)
      .single(),
    supabase
      .from('sales')
      .select('total_cents')
      .eq('tenant_id', user.tenant_id)
      .eq('status', 'completed')
      .gte('created_at', startOfDayISO()),
    supabase
      .from('sales')
      .select('total_cents')
      .eq('tenant_id', user.tenant_id)
      .eq('status', 'completed')
      .gte('created_at', startOfMonthISO()),
    supabase
      .from('inventory')
      .select('quantity, min_quantity')
      .eq('tenant_id', user.tenant_id),
  ]);

  const todayList = salesToday ?? [];
  const monthList = salesMonth ?? [];
  const todayTotalCents = todayList.reduce((sum, s) => sum + s.total_cents, 0);
  const monthTotalCents = monthList.reduce((sum, s) => sum + s.total_cents, 0);
  const monthTicketCents = monthList.length > 0 ? Math.round(monthTotalCents / monthList.length) : 0;
  const lowStockCount = (lowStock ?? []).filter((i) => i.quantity <= i.min_quantity).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {user.full_name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Visão geral de {tenant?.name ?? 'sua loja'}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Vendas hoje</CardDescription>
            <CardTitle>{formatPrice(todayTotalCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {todayList.length} venda(s)
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Vendas no mês</CardDescription>
            <CardTitle>{formatPrice(monthTotalCents)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {monthList.length} venda(s)
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Ticket médio (mês)</CardDescription>
            <CardTitle>{formatPrice(monthTicketCents)}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Estoque baixo</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {lowStockCount}
              {lowStockCount > 0 && <Badge variant="destructive">Atenção</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <Link href="/dashboard/estoque" className="underline underline-offset-4">
              ver estoque
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Plano atual</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {subscription ? PLAN_LABELS[subscription.plan_id] : '—'}
              {subscription && (
                <Badge variant={subscription.status === 'trialing' ? 'secondary' : 'default'}>
                  {subscription.status === 'trialing' ? 'Período de teste' : subscription.status}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Relatórios</CardDescription>
            <CardTitle className="text-base">
              <Link href="/dashboard/relatorios" className="underline underline-offset-4">
                Ver relatórios detalhados
              </Link>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
