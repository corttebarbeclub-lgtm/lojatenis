export type PlanTier = 'basic' | 'pro' | 'premium';

export type UserRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'cashier'
  | 'seller'
  | 'stock'
  | 'finance';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

export type PlanFeature =
  | 'pdv'
  | 'inventory'
  | 'customers'
  | 'basic_reports'
  | 'basic_store'
  | 'multi_users'
  | 'ecommerce'
  | 'whatsapp'
  | 'advanced_reports'
  | 'commissions'
  | 'loyalty'
  | 'multi_branch'
  | 'advanced_crm'
  | 'automation'
  | 'omnichannel'
  | 'ai_product_intake'
  | 'ai_assistant'
  | 'priority_support';

export interface Plan {
  id: PlanTier;
  name: string;
  monthly_price_cents: number;
  max_users: number | null;
  max_stores: number | null;
  features: PlanFeature[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: PlanTier;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
}

export interface Store {
  id: string;
  tenant_id: string;
  name: string;
  is_main: boolean;
  created_at: string;
}

export interface AppUser {
  id: string;
  tenant_id: string;
  store_id: string | null;
  role: UserRole;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
