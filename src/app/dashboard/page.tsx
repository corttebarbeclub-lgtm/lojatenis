import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Plan, Subscription, Tenant } from '@/types/database';

const PLAN_LABELS: Record<string, string> = {
  basic: 'Básico',
  pro: 'Profissional',
  premium: 'Premium',
};

export default async function DashboardPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const [{ data: tenant }, { data: subscription }] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', user.tenant_id).single<Tenant>(),
    supabase
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .eq('tenant_id', user.tenant_id)
      .single<Subscription & { plan: Plan }>(),
  ]);

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <CardDescription>Seu papel</CardDescription>
            <CardTitle className="capitalize">{user.role}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Loja</CardDescription>
            <CardTitle>{tenant?.name ?? '—'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
          <CardDescription>
            Produtos, estoque, PDV e relatórios chegam nas próximas fases do projeto.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Esta é a Fase 1: fundação, autenticação e estrutura multi-tenant. As demais áreas do menu
          serão habilitadas conforme o roadmap avança.
        </CardContent>
      </Card>
    </div>
  );
}
