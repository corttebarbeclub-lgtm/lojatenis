import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import CheckoutPageClient from '@/components/storefront/checkout-page-client';

interface StorefrontTenant {
  id: string;
  name: string;
  whatsapp_number: string | null;
  logo_url: string | null;
  description: string | null;
}

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient(cookies());
  const result = await supabase.rpc('get_storefront_tenant', { p_slug: params.slug });
  const tenant = (result.data?.[0] as StorefrontTenant | undefined);
  return {
    title: tenant ? `Checkout — ${tenant.name}` : 'Checkout',
  };
}

export default async function CheckoutPage({ params }: PageProps) {
  const supabase = createClient(cookies());
  const tenantResult = await supabase.rpc('get_storefront_tenant', { p_slug: params.slug });
  const tenant = (tenantResult.data?.[0] as StorefrontTenant | undefined);
  if (!tenant) notFound();

  return (
    <CheckoutPageClient
      slug={params.slug}
      storeName={tenant.name}
      whatsappNumber={tenant.whatsapp_number}
    />
  );
}
