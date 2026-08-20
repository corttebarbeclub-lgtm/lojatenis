import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, PackageCheck, Building2, Truck, Ship, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { ImageGallery } from '@/components/storefront/image-gallery';
import { WholesaleGridSelector } from '@/components/storefront/wholesale-grid-selector';
import { WholesaleAuthGate } from '@/components/storefront/wholesale-auth-gate';

interface StorefrontTenant {
  id: string;
  name: string;
  whatsapp_number: string | null;
  logo_url: string | null;
  description: string | null;
}

interface WholesaleVariant {
  product_id: string;
  product_name: string;
  brand_name: string | null;
  category_name: string | null;
  description: string | null;
  gender: string | null;
  variant_id: string;
  color: string;
  size: string;
  retail_price_cents: number;
  wholesale_price_cents: number;
  wholesale_min_qty: number;
  quantity: number;
  image_urls: string[] | null;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function genderLabel(g: string | null) {
  const map: Record<string, string> = {
    masculino: 'Masculino',
    feminino: 'Feminino',
    unissex: 'Unissex',
    infantil: 'Infantil',
  };
  return g ? map[g] ?? g : null;
}

interface PageProps {
  params: { slug: string; id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient(cookies());
  const result = await supabase.rpc('get_wholesale_product_detail', {
    p_slug: params.slug,
    p_product_id: params.id,
  });
  const first = (result.data?.[0] as WholesaleVariant | undefined);
  return {
    title: first ? `Atacado — ${first.product_name}` : 'Produto Atacado',
  };
}

export default async function WholesaleProductPage({ params }: PageProps) {
  const supabase = createClient(cookies());

  const [tenantResult, variantsResult] = await Promise.all([
    supabase.rpc('get_storefront_tenant', { p_slug: params.slug }),
    supabase.rpc('get_wholesale_product_detail', {
      p_slug: params.slug,
      p_product_id: params.id,
    }),
  ]);

  const tenant = (tenantResult.data?.[0] as StorefrontTenant | undefined);
  const list = (variantsResult.data ?? []) as WholesaleVariant[];
  if (list.length === 0) notFound();

  const first = list[0];
  const images = first.image_urls ?? [];
  const minWholesalePrice = Math.min(...list.map((v) => v.wholesale_price_cents));
  const minRetailPrice = Math.min(...list.map((v) => v.retail_price_cents));
  const discountPct = minRetailPrice > 0
    ? Math.round((1 - minWholesalePrice / minRetailPrice) * 100)
    : 0;

  const minQty = list[0]?.wholesale_min_qty ?? 6;
  const kitMinCents = minWholesalePrice * minQty;

  const wholesaleVariants = list.map((v) => ({
    variant_id: v.variant_id,
    color: v.color,
    size: v.size,
    wholesale_price_cents: v.wholesale_price_cents,
    quantity: v.quantity,
  }));

  return (
    <>
      {tenant && (
        <StorefrontHeader
          storeName={tenant.name}
          slug={params.slug}
          whatsappNumber={tenant.whatsapp_number}
          activePage="atacado"
        />
      )}

      {/* Gated Wholesale Protection */}
      <WholesaleAuthGate
        slug={params.slug}
        storeName={tenant?.name ?? 'Tênis Store'}
        whatsappNumber={tenant?.whatsapp_number ?? null}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
            <Link href={`/loja/${params.slug}/atacado`} className="hover:text-gray-700 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Catálogo Atacado
            </Link>
            {first.brand_name && (
              <>
                <span>/</span>
                <span>{first.brand_name}</span>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-bold truncate max-w-xs">{first.product_name}</span>
          </nav>

          {/* Badge atacado */}
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-gray-950 px-3.5 py-1 text-xs font-bold text-white shadow-xs">
            <Building2 className="h-3.5 w-3.5 text-blue-400" />
            Canal Atacado B2B — Faturamento Direto com CNPJ/CPF de Lojista
          </div>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Galeria de 5 fotos com zoom interativo */}
            <div className="lg:col-span-6">
              <div className="sticky top-24">
                <ImageGallery images={images} productName={first.product_name} />
              </div>
            </div>

            {/* Info e Seletor Interativo de Grade */}
            <div className="space-y-6 lg:col-span-6">
              {first.brand_name && (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-black uppercase tracking-widest text-gray-900">
                  {first.brand_name}
                </span>
              )}

              <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                {first.product_name}
              </h1>

              {/* Painel de preços atacado */}
              <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50/50 via-white to-gray-50 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-0.5">Preço Atacado (por par)</p>
                    <p className="text-3xl font-black text-blue-700">{formatPrice(minWholesalePrice)}</p>
                  </div>
                  {discountPct > 0 && (
                    <span className="inline-flex items-center rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white shadow-xs">
                      -{discountPct}% vs Varejo
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-2.5">
                  <span>Preço sugerido de varejo:</span>
                  <span className="line-through text-gray-400 font-semibold">{formatPrice(minRetailPrice)}</span>
                  <span className="text-emerald-700 font-bold ml-auto">
                    Lucro aprox: {formatPrice(minRetailPrice - minWholesalePrice)}/par
                  </span>
                </div>

                {/* Kit Mínimo */}
                <div className="rounded-xl bg-blue-100/70 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <PackageCheck className="h-4 w-4" />
                    <span>Kit mínimo por pedido: {minQty} pares</span>
                  </div>
                  <span className="font-black text-blue-950">{formatPrice(kitMinCents)}</span>
                </div>
              </div>

              {/* Componente Interativo de Grade (Seleção de pares por numeração + estoque em tempo real) */}
              <WholesaleGridSelector
                productId={params.id}
                productName={first.product_name}
                brandName={first.brand_name}
                imageUrl={images[0] ?? null}
                wholesaleMinQty={minQty}
                variants={wholesaleVariants}
                whatsappNumber={tenant?.whatsapp_number ?? '5592981883786'}
                storeName={tenant?.name ?? 'Tênis Store'}
              />

              {/* Destaques de Envio B2B para Amazonas */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 space-y-2 text-xs text-gray-700">
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  Opções de Despacho para o Amazonas:
                </p>
                <div className="space-y-1 pl-5 text-gray-600">
                  <p>• <strong>Manaus:</strong> Entrega R$ 1,00 direta no endereço da sua loja.</p>
                  <p className="flex items-center gap-1">
                    <Ship className="h-3.5 w-3.5 text-blue-600 inline" />
                    • <strong>Interior do AM:</strong> R$ 100,00 via Barco/Lancha com despacho imediato no porto de Manaus.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição e Características */}
          {first.description && (
            <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-base font-bold text-gray-900">Sobre o Modelo</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{first.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-gray-100 pt-4 text-xs">
                <div>
                  <p className="text-gray-400">Marca</p>
                  <p className="font-bold text-gray-900">{first.brand_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Categoria</p>
                  <p className="font-bold text-gray-900">{first.category_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Gênero</p>
                  <p className="font-bold text-gray-900">{genderLabel(first.gender)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Garantia & Procedência</p>
                  <p className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> 100% Original c/ NF
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </WholesaleAuthGate>
    </>
  );
}
