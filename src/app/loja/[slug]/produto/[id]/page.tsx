import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Ruler, RefreshCw, Truck, Ship, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { ImageGallery } from '@/components/storefront/image-gallery';
import { SizeSelector } from '@/components/storefront/size-selector';
import { SizeGuideModal } from '@/components/storefront/size-guide-modal';
import { InstallmentInfo } from '@/components/storefront/installment-info';
import { ProductCard } from '@/components/storefront/product-card';

interface StorefrontTenant {
  id: string;
  name: string;
  whatsapp_number: string | null;
  logo_url: string | null;
  description: string | null;
}

interface VariantDetail {
  product_id: string;
  product_name: string;
  brand_name: string | null;
  category_name?: string | null;
  description: string | null;
  gender: string | null;
  variant_id: string;
  color: string;
  size: string;
  price_cents: number;
  quantity: number;
  image_urls: string[] | null;
}

interface StorefrontProduct {
  product_id: string;
  product_name: string;
  brand_name: string | null;
  category_name: string | null;
  description: string | null;
  gender: string | null;
  image_url: string | null;
  min_price_cents: number;
  max_price_cents: number;
  has_stock: boolean;
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
  const result = await supabase.rpc('get_storefront_product_detail', {
    p_slug: params.slug,
    p_product_id: params.id,
  });
  const first = (result.data?.[0] as VariantDetail | undefined);
  return {
    title: first ? `${first.product_name} — ${first.brand_name ?? ''}` : 'Produto',
  };
}

export default async function StorefrontProductPage({ params }: PageProps) {
  const supabase = createClient(cookies());

  const [tenantResult, variantsResult, allProductsResult] = await Promise.all([
    supabase.rpc('get_storefront_tenant', { p_slug: params.slug }),
    supabase.rpc('get_storefront_product_detail', {
      p_slug: params.slug,
      p_product_id: params.id,
    }),
    supabase.rpc('get_storefront_products', { p_slug: params.slug }),
  ]);

  const tenant = (tenantResult.data?.[0] as StorefrontTenant | undefined);
  const list = (variantsResult.data ?? []) as VariantDetail[];
  if (list.length === 0) notFound();

  const allProducts = (allProductsResult.data ?? []) as StorefrontProduct[];

  const first = list[0];
  const images = first.image_urls ?? [];
  const minPrice = Math.min(...list.map((v) => v.price_cents));
  const maxPrice = Math.max(...list.map((v) => v.price_cents));

  const variants = list.map((v) => ({
    variantId: v.variant_id,
    color: v.color,
    size: v.size,
    priceCents: v.price_cents,
    quantity: v.quantity,
  }));

  // Produtos relacionados: Mesma marca com prioridade, ou mesma categoria
  const related = allProducts
    .filter((p) => p.product_id !== params.id)
    .sort((a, b) => {
      const aSameBrand = a.brand_name === first.brand_name ? -1 : 1;
      const bSameBrand = b.brand_name === first.brand_name ? -1 : 1;
      return aSameBrand - bSameBrand;
    })
    .slice(0, 4);

  return (
    <>
      {tenant && (
        <StorefrontHeader
          storeName={tenant.name}
          slug={params.slug}
          whatsappNumber={tenant.whatsapp_number}
          activePage="varejo"
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 pb-28 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link href={`/loja/${params.slug}`} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Catálogo
          </Link>
          {first.brand_name && (
            <>
              <span>/</span>
              <span>{first.brand_name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-xs">{first.product_name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Galeria de imagens */}
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <ImageGallery images={images} productName={first.product_name} />
            </div>
          </div>

          {/* Info e compra */}
          <div className="space-y-6 lg:col-span-5">
            {/* Marca e Badges */}
            <div className="flex items-center justify-between">
              {first.brand_name && (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-black uppercase tracking-widest text-gray-900">
                  {first.brand_name}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <Check className="h-3.5 w-3.5" /> Produto 100% Original
              </span>
            </div>

            {/* Nome */}
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              {first.product_name}
            </h1>

            {/* Preço e Parcelas */}
            <div className="rounded-2xl bg-gray-50/80 p-4 border border-gray-100 space-y-1.5">
              {minPrice === maxPrice ? (
                <p className="text-3xl font-black text-gray-900">{formatPrice(minPrice)}</p>
              ) : (
                <div>
                  <p className="text-xs text-gray-400">a partir de</p>
                  <p className="text-3xl font-black text-gray-900">{formatPrice(minPrice)}</p>
                </div>
              )}
              
              <InstallmentInfo priceCents={minPrice} maxInstallments={3} size="md" />

              <p className="pt-1 text-xs text-gray-500 flex items-center gap-1">
                <span>💠</span> <strong>5% de desconto extra</strong> no pagamento via PIX
              </p>
            </div>

            {/* Guia de Tamanho */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Escolha a Numeração</span>
              <SizeGuideModal />
            </div>

            {/* Seletor de tamanho com botão Adicionar ao Carrinho */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <SizeSelector
                variants={variants}
                productId={params.id}
                productName={first.product_name}
                brandName={first.brand_name}
                imageUrl={images[0] ?? null}
              />
            </div>

            {/* Banner de Frete Amazonas */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Truck className="h-4 w-4 text-emerald-600" />
                Entrega para todo o Amazonas:
              </div>
              <div className="text-xs text-emerald-800 space-y-1 pl-6">
                <p>• <strong>Manaus:</strong> R$ 1,00 (Chega em até 24h via Motoboy)</p>
                <p className="flex items-center gap-1">
                  <Ship className="h-3.5 w-3.5 text-blue-600 inline" />
                  • <strong>Interior do AM:</strong> R$ 100,00 (Envio expresso via Barco/Lancha)
                </p>
              </div>
            </div>

            {/* Garantias */}
            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              {[
                { icon: ShieldCheck, title: 'Original', desc: 'Garantia de fábrica' },
                { icon: RefreshCw, title: 'Troca Fácil', desc: '7 dias grátis' },
                { icon: Ruler, title: 'Ajuste Perfeito', desc: 'Guia de medidas' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-gray-100 bg-white p-3 shadow-xs">
                  <Icon className="mx-auto mb-1 h-5 w-5 text-gray-700" />
                  <p className="text-xs font-bold text-gray-800">{title}</p>
                  <p className="text-[11px] text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Descrição + características */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Descrição */}
          {first.description && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Detalhes do Modelo
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{first.description}</p>
            </div>
          )}

          {/* Características */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-900">Especificações Técnicas</h2>
            <dl className="space-y-2.5 text-sm">
              {first.brand_name && (
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Marca</dt>
                  <dd className="font-bold text-gray-900">{first.brand_name}</dd>
                </div>
              )}
              {first.gender && (
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Gênero Indicado</dt>
                  <dd className="font-semibold text-gray-900">{genderLabel(first.gender)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <dt className="text-gray-500">Cores Disponíveis</dt>
                <dd className="font-semibold text-gray-900">
                  {Array.from(new Set(list.map((v) => v.color))).join(', ')}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Numerações em Estoque</dt>
                <dd className="font-bold text-gray-900">
                  {Array.from(new Set(list.map((v) => v.size))).sort((a, b) => Number(a) - Number(b)).join(', ')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Produtos Relacionados */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Você também pode gostar</h2>
                <p className="text-xs text-gray-500">Modelos recomendados de {first.brand_name ?? 'destaque'}</p>
              </div>
              <Link
                href={`/loja/${params.slug}`}
                className="text-xs font-semibold text-gray-900 hover:underline flex items-center gap-1"
              >
                Ver todos os tênis
                <ArrowLeft className="h-3 w-3 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((prod) => (
                <ProductCard
                  key={prod.product_id}
                  productId={prod.product_id}
                  slug={params.slug}
                  name={prod.product_name}
                  brandName={prod.brand_name}
                  categoryName={prod.category_name}
                  gender={prod.gender}
                  imageUrl={prod.image_url}
                  minPriceCents={prod.min_price_cents}
                  maxPriceCents={prod.max_price_cents}
                  hasStock={prod.has_stock}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
