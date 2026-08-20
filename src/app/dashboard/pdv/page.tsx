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
      .select(`
        id,
        color,
        size,
        sku,
        barcode,
        price_cents,
        product:products (
          id,
          name,
          brand:brands ( name ),
          product_images ( url, is_primary, position )
        ),
        inventory ( quantity )
      `)
      .eq('tenant_id', user.tenant_id)
      .eq('is_active', true)
      .limit(500),
  ]);

  const catalog = (catalogVariants ?? []).map((v) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prod = v.product as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = Array.isArray(v.inventory) ? v.inventory[0] : (v.inventory as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const images = (prod?.product_images as any[]) || [];
    const primaryImage =
      images.find((img) => img.is_primary)?.url || images[0]?.url || null;

    return {
      id: v.id,
      color: v.color,
      size: v.size,
      sku: v.sku,
      barcode: v.barcode,
      price_cents: v.price_cents,
      product_name: prod?.name ?? '—',
      brand_name: prod?.brand?.name ?? '',
      available_quantity: inv?.quantity ?? 0,
      image_url: primaryImage,
    };
  });

  return (
    <PdvClient
      cashRegister={openRegister}
      customers={customers ?? []}
      sellers={sellers ?? []}
      catalog={catalog}
    />
  );
}
