import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import type { PlanFeature, Plan } from '@/types/database';

export class FeatureNotAllowedError extends Error {
  constructor(feature: PlanFeature) {
    super(`Este recurso ("${feature}") não está disponível no plano atual.`);
    this.name = 'FeatureNotAllowedError';
  }
}

export class UserLimitReachedError extends Error {
  constructor() {
    super('O limite de usuários do plano atual foi atingido.');
    this.name = 'UserLimitReachedError';
  }
}

async function getActivePlan(tenantId: string): Promise<Plan> {
  const supabase = createClient(cookies());

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('tenant_id', tenantId)
    .single();

  if (subError || !subscription) {
    throw new Error('Assinatura não encontrada para este tenant.');
  }

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('*')
    .eq('id', subscription.plan_id)
    .single();

  if (planError || !plan) {
    throw new Error('Plano não encontrado.');
  }

  return plan as Plan;
}

/**
 * Guard central de feature flags. Toda Server Action ou Route Handler que
 * toca um recurso pago deve chamar isso antes de executar — nunca confiar
 * só em esconder o botão na UI.
 */
export async function requireFeature(tenantId: string, feature: PlanFeature): Promise<void> {
  const plan = await getActivePlan(tenantId);
  if (!plan.features.includes(feature)) {
    throw new FeatureNotAllowedError(feature);
  }
}

export async function requireUserSlot(tenantId: string): Promise<void> {
  const plan = await getActivePlan(tenantId);
  if (plan.max_users === null) return;

  const supabase = createClient(cookies());
  const { count, error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  if (error) throw error;
  if ((count ?? 0) >= plan.max_users) {
    throw new UserLimitReachedError();
  }
}
