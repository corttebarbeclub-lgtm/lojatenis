import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { OpenRegisterForm } from '@/components/pdv/open-register-form';
import { PdvClient } from '@/components/pdv/pdv-client';
import type { CashRegister, Customer, Seller } from '@/types/database';

export default async function PdvPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: openRegister } = await supabase
    .from('cash_registers')
    .select('*')
    .eq('tenant_id', user.tenant_id)
    .eq('store_id', user.store_id ?? '')
    .eq('status', 'open')
    .maybeSingle<CashRegister>();

  if (!openRegister) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <OpenRegisterForm storeId={user.store_id ?? ''} />
      </div>
    );
  }

  const [{ data: customers }, { data: sellers }, { data: catalogVariants }] = await Promise.all([
    supabase
      .from('customers')
      .select('id, full_name')
      .eq('tenant_id', user.tenant_id)
      .order('full_name')
      .returns<Pick<Customer, 'id' | 'full_name'>[]>(),
    supabase
      .from('sellers')
      .select('id, full_name')
      .eq('tenant_id', user.tenant_id)
      .eq('is_active', true)
      .order('full_name')
      .returns<Pick<Seller, 'id' | 'full_name'>[]>(),
    supabase
      .from('product_variants')
      .select('id, color, size, sku, barcode, price_cents, product:products(name), inventory(quantity)')
      .eq('tenant_id', user.tenant_id)
      .eq('is_active', true)
      .returns<
        {
          id: string;
          color: string;
          size: string;
          sku: string | null;
          barcode: string | null;
          price_cents: number;
          product: { name: string } | null;
          inventory: { quantity: number } | null;
        }[]
      >(),
  ]);

  const catalog = (catalogVariants ?? []).map((v) => ({
    id: v.id,
    color: v.color,
    size: v.size,
    sku: v.sku,
    barcode: v.barcode,
    price_cents: v.price_cents,
    product_name: v.product?.name ?? '—',
    available_quantity: v.inventory?.quantity ?? 0,
  }));

  return (
    <PdvClient
      cashRegister={openRegister}
      customers={customers ?? []}
      sellers={sellers ?? []}
      catalog={catalog}
    />
  );
}
