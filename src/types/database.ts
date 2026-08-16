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

export type ProductGender = 'masculino' | 'feminino' | 'unissex' | 'infantil';

export interface Brand {
  id: string;
  tenant_id: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  tenant_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  brand_id: string | null;
  category_id: string | null;
  supplier_id: string | null;
  gender: ProductGender | null;
  reference: string | null;
  description: string | null;
  ncm: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  tenant_id: string;
  product_id: string;
  color: string;
  size: string;
  sku: string | null;
  barcode: string | null;
  cost_cents: number | null;
  price_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  tenant_id: string;
  product_id: string;
  storage_path: string;
  url: string;
  position: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  format: string | null;
  created_at: string;
}

export interface ProductWithRelations extends Product {
  brand: Brand | null;
  category: Category | null;
  supplier: Supplier | null;
  variants: ProductVariant[];
  images: ProductImage[];
}

export type InventoryMovementType = 'entry' | 'adjustment' | 'count' | 'sale';

export interface Inventory {
  id: string;
  tenant_id: string;
  variant_id: string;
  quantity: number;
  min_quantity: number;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  tenant_id: string;
  variant_id: string;
  type: InventoryMovementType;
  quantity_change: number;
  quantity_after: number;
  reason: string | null;
  user_id: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Seller {
  id: string;
  tenant_id: string;
  user_id: string | null;
  full_name: string;
  commission_percent: number;
  is_active: boolean;
  created_at: string;
}

export type CashRegisterStatus = 'open' | 'closed';

export interface CashRegister {
  id: string;
  tenant_id: string;
  store_id: string;
  opened_by: string | null;
  closed_by: string | null;
  status: CashRegisterStatus;
  opening_balance_cents: number;
  closing_balance_cents: number | null;
  expected_balance_cents: number | null;
  opened_at: string;
  closed_at: string | null;
}

export type CashMovementType = 'withdrawal' | 'reinforcement';

export interface CashMovement {
  id: string;
  tenant_id: string;
  cash_register_id: string;
  type: CashMovementType;
  amount_cents: number;
  reason: string | null;
  user_id: string | null;
  created_at: string;
}

export type SaleStatus = 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'pix' | 'card';

export interface Sale {
  id: string;
  tenant_id: string;
  store_id: string;
  cash_register_id: string;
  customer_id: string | null;
  seller_id: string | null;
  user_id: string | null;
  status: SaleStatus;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  created_at: string;
}

export interface SaleItem {
  id: string;
  tenant_id: string;
  sale_id: string;
  variant_id: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

export interface Payment {
  id: string;
  tenant_id: string;
  sale_id: string;
  method: PaymentMethod;
  amount_cents: number;
  created_at: string;
}

export type SyncConflictStatus = 'pending' | 'resolved';

export interface SyncConflict {
  id: string;
  tenant_id: string;
  client_operation_id: string;
  operation_type: string;
  payload: Record<string, unknown>;
  error_message: string;
  status: SyncConflictStatus;
  resolved_by: string | null;
  resolution_note: string | null;
  created_at: string;
  resolved_at: string | null;
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
