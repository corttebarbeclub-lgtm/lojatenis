import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { ProductCard } from '@/components/storefront/product-card';
import { StorefrontFilters } from '@/components/storefront/storefront-filters';
import { CentauroHeroBanner } from '@/components/storefront/centauro-hero-banner';
import { CentauroCategoryCircles } from '@/components/storefront/centauro-category-circles';
import { CentauroFloatingOffer } from '@/components/storefront/centauro-floating-offer';
import {
  SlidersHorizontal,
  Truck,
  Ship,
  ShieldCheck,
  CreditCard,
  Flame,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';

interface StorefrontTenant {
  id: string;
  name: string;
  whatsapp_number: string | null;
  logo_url: string | null;
  description: string | null;
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

interface PageProps {
  params: { slug: string };
  searchParams: { brand?: string; category?: string; gender?: string; stock?: string; q?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient(cookies());
  const result = await supabase.rpc('get_storefront_tenant', { p_slug: params.slug });
  const tenant = (result.data?.[0] as StorefrontTenant | undefined);
  return {
    title: tenant ? `${tenant.name} — A Sua Loja de Sneakers e Tênis Exclusivos` : 'HB Tênis Manaus',
    description: tenant?.description ?? `Confira as melhores ofertas de tênis originais em Manaus.`,
  };
}

export default async function StorefrontPage({ params, searchParams }: PageProps) {
  const supabase = createClient(cookies());

  const [tenantResult, productsResult, bannersResult] = await Promise.all([
    supabase.rpc('get_storefront_tenant', { p_slug: params.slug }),
    supabase.rpc('get_storefront_products', { p_slug: params.slug }),
    supabase
      .from('storefront_hero_banners')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true }),
  ]);

  const tenant = (tenantResult.data?.[0] as StorefrontTenant | undefined);
  if (!tenant) notFound();

  const customBanners = bannersResult.data ?? [];
  let list = (productsResult.data ?? []) as StorefrontProduct[];
  const allProducts = [...list];

  // Filtros client-side
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

  // Opções únicas para filtros
  const brands = Array.from(new Set(allProducts.map((p) => p.brand_name).filter(Boolean) as string[]))
    .sort()
    .map((v) => ({ value: v.toLowerCase(), label: v }));
  const categories = Array.from(new Set(allProducts.map((p) => p.category_name).filter(Boolean) as string[]))
    .sort()
    .map((v) => ({ value: v.toLowerCase(), label: v }));
  const genders = Array.from(new Set(allProducts.map((p) => p.gender).filter(Boolean) as string[]))
    .map((v) => ({ value: v, label: v }));

  const hasActiveFilters = !!(searchParams.brand || searchParams.category || searchParams.gender || searchParams.stock || searchParams.q);

  // Seções destacadas para o conceito HB Tênis Manaus
  const featuredNike = allProducts.filter((p) => p.brand_name === 'Nike').slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white">
      <StorefrontHeader
        storeName={tenant.name}
        slug={params.slug}
        whatsappNumber={tenant.whatsapp_number}
        activePage="varejo"
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-24 lg:pb-10 space-y-10">
        {/* 1. Hero Carousel Banner Gigante (Personalizável pelo Admin com Tênis em Estoque) */}
        {!hasActiveFilters && (
          <CentauroHeroBanner
            slug={params.slug}
            customBanners={customBanners}
            products={allProducts.filter((p) => p.has_stock)}
          />
        )}

        {/* 2. Barra de Vantagens e Confiança HB Tênis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-950 border border-zinc-800 p-3.5 shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 flex-shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Manaus: R$ 15,00</p>
              <p className="text-[11px] text-zinc-400 font-medium">Entrega expressa motoboy</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-zinc-950 border border-zinc-800 p-3.5 shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 flex-shrink-0">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Interior AM: R$ 100</p>
              <p className="text-[11px] text-zinc-400 font-medium">Envio Barco / Lancha</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-zinc-950 border border-zinc-800 p-3.5 shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 flex-shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Até 12x no Cartão</p>
              <p className="text-[11px] text-zinc-400 font-medium">Ou desconto no PIX</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-zinc-950 border border-zinc-800 p-3.5 shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">100% Originais</p>
              <p className="text-[11px] text-zinc-400 font-medium">Garantia & Nota Fiscal</p>
            </div>
          </div>
        </div>

        {/* 3. Carrossel de Categorias Circulares */}
        {!hasActiveFilters && (
          <CentauroCategoryCircles slug={params.slug} />
        )}

        {/* 4. Vitrine Destaques Jordan & Nike Heat */}
        {!hasActiveFilters && featuredNike.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  Destaques Air Jordan & Nike Heat
                </h2>
              </div>
              <Link
                href={`/loja/${params.slug}?brand=nike`}
                className="text-xs font-black text-amber-400 hover:underline flex items-center gap-1"
              >
                Ver todos Nike
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {featuredNike.map((prod) => (
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

        {/* 5. Catálogo Completo com Filtros */}
        <div id="produtos" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                {hasActiveFilters ? 'Resultados da Busca / Filtro' : 'Todos os Calçados HB Tênis Manaus'}
              </h2>
            </div>
            <span className="text-xs font-bold text-zinc-400">
              {list.length} {list.length === 1 ? 'modelo' : 'modelos'}
            </span>
          </div>

          <div className="flex gap-8">
            {/* Sidebar de Filtros Desktop */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-28 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="font-black text-sm text-white flex items-center gap-1.5">
                    <SlidersHorizontal className="h-4 w-4 text-amber-400" />
                    Filtrar Sneakers
                  </span>
                  {hasActiveFilters && (
                    <Link href={`/loja/${params.slug}`} className="text-xs text-amber-400 font-bold hover:underline">
                      Limpar
                    </Link>
                  )}
                </div>
                <div className="text-zinc-900">
                  <StorefrontFilters brands={brands} categories={categories} genders={genders} />
                </div>
              </div>
            </aside>

            {/* Grid de Produtos */}
            <div className="flex-1 min-w-0">
              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-zinc-950 border border-zinc-800 p-6">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Nenhum calçado encontrado</h3>
                  <p className="mt-1 text-sm text-zinc-400 max-w-sm">
                    Tente buscar por Jordan, Nike, Samba, Mizuno, Asics ou limpe os filtros.
                  </p>
                  <Link
                    href={`/loja/${params.slug}`}
                    className="mt-5 rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-black text-black hover:bg-amber-300 shadow-md"
                  >
                    Ver Todos os Modelos
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-3">
                  {list.map((product) => (
                    <ProductCard
                      key={product.product_id}
                      productId={product.product_id}
                      slug={params.slug}
                      name={product.product_name}
                      brandName={product.brand_name}
                      categoryName={product.category_name}
                      gender={product.gender}
                      imageUrl={product.image_url}
                      minPriceCents={product.min_price_cents}
                      maxPriceCents={product.max_price_cents}
                      hasStock={product.has_stock}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6. Footer HB Tênis Manaus */}
        <footer className="mt-20 border-t-2 border-amber-500/40 bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border border-amber-400 flex-shrink-0 bg-black">
                  <Image
                    src="/hb-logo.png"
                    alt="HB Tênis Manaus"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-lg font-black italic tracking-tighter text-white block leading-none">
                    <span className="text-amber-400">HB</span> TÊNIS MANAUS
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">
                    Sneakers & Streetwear
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                A principal referência em sneakers raros, lançamentos e calçados exclusivos do Amazonas. Envio imediato para Manaus e todos os 62 municípios.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-black text-amber-400 uppercase tracking-wider">Atendimento Exclusivo</h4>
              <p className="text-zinc-300">WhatsApp: <strong className="text-white">(92) 98188-3786</strong></p>
              <p className="text-zinc-400">Horário: Seg a Sáb das 08h às 20h</p>
              <p className="text-zinc-400">Manaus - Amazonas</p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-black text-amber-400 uppercase tracking-wider">Formas de Pagamento</h4>
              <p className="text-zinc-300">💳 Cartão de Crédito em até 12x</p>
              <p className="text-zinc-300">💠 PIX com aprovação instantânea</p>
              <p className="text-zinc-300">📄 Faturamento B2B no Atacado</p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-black text-amber-400 uppercase tracking-wider">Logística Regional</h4>
              <p className="text-zinc-300">🚀 Manaus: Fixo <strong className="text-amber-400">R$ 15,00</strong> (Motoboy)</p>
              <p className="text-zinc-300">🚢 Interior AM: Fixo <strong className="text-cyan-400">R$ 100,00</strong> (Barco)</p>
              <p className="text-zinc-300">📦 Estoque Central Integrado</p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 text-center text-[11px] text-zinc-500">
            © {new Date().getFullYear()} HB Tênis Manaus — Todos os direitos reservados.
          </div>
        </footer>
      </main>

      {/* 7. Popup Flutuante de Ofertas HB Tênis */}
      <CentauroFloatingOffer slug={params.slug} />
    </div>
  );
}
