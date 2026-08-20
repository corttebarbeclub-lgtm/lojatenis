import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { ProductCardWholesale } from '@/components/storefront/product-card-wholesale';
import { StorefrontFilters } from '@/components/storefront/storefront-filters';
import { WholesaleAuthGate } from '@/components/storefront/wholesale-auth-gate';
import { Building2, ShieldCheck, PackageCheck, Search, Truck, Ship, PhoneCall, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

interface StorefrontTenant {
  id: string;
  name: string;
  whatsapp_number: string | null;
  logo_url: string | null;
  description: string | null;
}

interface WholesaleProduct {
  product_id: string;
  product_name: string;
  brand_name: string | null;
  category_name: string | null;
  description: string | null;
  gender: string | null;
  image_url: string | null;
  min_retail_price_cents: number;
  max_retail_price_cents: number;
  min_wholesale_price_cents: number;
  max_wholesale_price_cents: number;
  wholesale_min_qty: number;
  has_stock: boolean;
}

interface PageProps {
  params: { slug: string };
  searchParams: { brand?: string; category?: string; gender?: string; stock?: string; q?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient(cookies());
  const result = await supabase.rpc('get_storefront_tenant', { p_slug: params.slug });
  const tenant = (result.data?.[0] as StorefrontTenant | undefined);
  return {
    title: tenant ? `Atacado B2B — ${tenant.name}` : 'Catálogo Atacado',
    description: tenant
      ? `Catálogo de atacado de ${tenant.name}. Preços especiais para lojistas e revendedores de calçados.`
      : 'Catálogo de atacado para revendedores.',
  };
}

export default async function WholesalePage({ params, searchParams }: PageProps) {
  const supabase = createClient(cookies());

  const [tenantResult, productsResult] = await Promise.all([
    supabase.rpc('get_storefront_tenant', { p_slug: params.slug }),
    supabase.rpc('get_wholesale_products', { p_slug: params.slug }),
  ]);

  const tenant = (tenantResult.data?.[0] as StorefrontTenant | undefined);
  if (!tenant) notFound();

  let list = (productsResult.data ?? []) as WholesaleProduct[];

  // Filtros
  if (searchParams.brand) {
    list = list.filter((p) => p.brand_name?.toLowerCase() === searchParams.brand!.toLowerCase());
  }
  if (searchParams.category) {
    list = list.filter((p) => p.category_name?.toLowerCase() === searchParams.category!.toLowerCase());
  }
  if (searchParams.gender) {
    list = list.filter((p) => p.gender === searchParams.gender);
  }
  if (searchParams.stock === 'in_stock') {
    list = list.filter((p) => p.has_stock);
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        p.brand_name?.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q)
    );
  }

  const allProducts = (productsResult.data ?? []) as WholesaleProduct[];
  const brands = Array.from(new Set(allProducts.map((p) => p.brand_name).filter(Boolean) as string[]))
    .sort()
    .map((v) => ({ value: v.toLowerCase(), label: v }));
  const categories = Array.from(new Set(allProducts.map((p) => p.category_name).filter(Boolean) as string[]))
    .sort()
    .map((v) => ({ value: v.toLowerCase(), label: v }));
  const genders = Array.from(new Set(allProducts.map((p) => p.gender).filter(Boolean) as string[]))
    .map((v) => ({ value: v, label: v }));

  const hasActiveFilters = !!(searchParams.brand || searchParams.category || searchParams.gender || searchParams.stock || searchParams.q);

  const whatsappDirectUrl = tenant.whatsapp_number
    ? `https://wa.me/${tenant.whatsapp_number}?text=${encodeURIComponent(`Olá! Sou lojista cadastrado e gostaria de atendimento sobre pedidos de atacado.`)}`
    : '#';

  return (
    <>
      <StorefrontHeader
        storeName={tenant.name}
        slug={params.slug}
        whatsappNumber={tenant.whatsapp_number}
        activePage="atacado"
      />

      {/* Gated Wholesale Portal: Autenticação com CPF/CNPJ e Senha */}
      <WholesaleAuthGate
        slug={params.slug}
        storeName={tenant.name}
        whatsappNumber={tenant.whatsapp_number}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
          {/* Banner B2B Premium com Informações Comerciais */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 px-6 py-10 sm:px-12 sm:py-12 text-white shadow-2xl">
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
                  <Building2 className="h-4 w-4" />
                  Portal Atacado B2B — Acesso Liberado para Lojista
                </div>

                <h1 className="text-3xl font-black sm:text-4xl tracking-tight">
                  Preços de Fábrica & Margens de até 60% para Sua Loja
                </h1>

                <p className="text-sm text-gray-300 leading-relaxed">
                  Abasteça sua loja com as marcas mais vendidas do Brasil. Grade fechada ou fracionada, nota fiscal eletrônica e envio garantido para Manaus e todos os 62 municípios do interior do Amazonas.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Falar com Consultor B2B no WhatsApp
                  </a>
                </div>
              </div>

              {/* Diferenciais B2B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-96 flex-shrink-0">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 space-y-1">
                  <PackageCheck className="h-5 w-5 text-emerald-400" />
                  <p className="text-xs font-bold text-white">Estoque Único</p>
                  <p className="text-[11px] text-gray-300">Saldo integrado em tempo real</p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 space-y-1">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                  <p className="text-xs font-bold text-white">NF-e Garantida</p>
                  <p className="text-[11px] text-gray-300">Produtos 100% autênticos</p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 space-y-1">
                  <Truck className="h-5 w-5 text-amber-400" />
                  <p className="text-xs font-bold text-white">Manaus R$ 1,00</p>
                  <p className="text-[11px] text-gray-300">Entrega rápida na sua loja</p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/10 space-y-1">
                  <Ship className="h-5 w-5 text-cyan-400" />
                  <p className="text-xs font-bold text-white">Interior R$ 100</p>
                  <p className="text-[11px] text-gray-300">Despacho no porto/barco</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Busca de Atacado */}
          <form action={`/loja/${params.slug}/atacado`} method="GET" className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              name="q"
              defaultValue={searchParams.q}
              placeholder="Buscar modelo ou marca no atacado..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </form>

          {/* Catálogo com Filtros */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                {list.length} {list.length === 1 ? 'modelo com preço de revenda' : 'modelos com preço de revenda'}
              </h2>
              {hasActiveFilters && (
                <Link
                  href={`/loja/${params.slug}/atacado`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Limpar filtros
                </Link>
              )}
            </div>

            <div className="flex gap-8">
              {/* Sidebar de filtros */}
              <aside className="hidden lg:block w-60 flex-shrink-0">
                <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros de Atacado
                    </span>
                  </div>
                  <StorefrontFilters brands={brands} categories={categories} genders={genders} />
                </div>
              </aside>

              {/* Grid de produtos de atacado */}
              <div className="flex-1 min-w-0">
                {list.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white border border-gray-200 p-6">
                    <Building2 className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-base font-bold text-gray-900">Nenhum produto encontrado no atacado</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-sm">
                      Tente ajustar seus termos de busca ou remover os filtros aplicados.
                    </p>
                    <Link
                      href={`/loja/${params.slug}/atacado`}
                      className="mt-4 rounded-xl bg-gray-950 px-5 py-2 text-xs font-bold text-white hover:bg-gray-800"
                    >
                      Ver Catálogo Completo de Atacado
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
                    {list.map((product) => (
                      <ProductCardWholesale
                        key={product.product_id}
                        productId={product.product_id}
                        slug={params.slug}
                        name={product.product_name}
                        brandName={product.brand_name}
                        categoryName={product.category_name}
                        gender={product.gender}
                        imageUrl={product.image_url}
                        minRetailPriceCents={product.min_retail_price_cents}
                        minWholesalePriceCents={product.min_wholesale_price_cents}
                        maxWholesalePriceCents={product.max_wholesale_price_cents}
                        wholesaleMinQty={product.wholesale_min_qty}
                        hasStock={product.has_stock}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </WholesaleAuthGate>
    </>
  );
}
