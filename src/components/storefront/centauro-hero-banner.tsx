'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Flame, ArrowRight, CheckCircle2, ShieldCheck, Truck, Percent } from 'lucide-react';

export interface CustomHeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  tag: string;
  badge_type: 'promo' | 'shipping' | 'drop' | 'exclusive' | string;
  discount_badge_text: string | null;
  product_id: string | null;
  custom_image_url: string | null;
  bg_theme: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  position: number;
}

export interface HeroProduct {
  product_id: string;
  product_name: string;
  brand_name: string | null;
  category_name?: string | null;
  image_url: string | null;
  min_price_cents: number;
  max_price_cents: number;
  has_stock: boolean;
}

interface CentauroHeroBannerProps {
  slug: string;
  customBanners?: CustomHeroBanner[];
  products?: HeroProduct[];
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const THEME_GRADIENTS: Record<string, { gradient: string; border: string; accent: string }> = {
  gold_amber: { gradient: 'from-amber-600/30 via-zinc-950 to-black', border: 'border-amber-500/30', accent: 'bg-amber-400 text-black' },
  crimson_red: { gradient: 'from-red-600/30 via-zinc-950 to-black', border: 'border-red-500/30', accent: 'bg-red-500 text-white' },
  cyber_cyan: { gradient: 'from-cyan-600/30 via-zinc-950 to-black', border: 'border-cyan-500/30', accent: 'bg-cyan-400 text-black' },
  emerald_green: { gradient: 'from-emerald-600/30 via-zinc-950 to-black', border: 'border-emerald-500/30', accent: 'bg-emerald-400 text-black' },
  dark_purple: { gradient: 'from-purple-600/30 via-zinc-950 to-black', border: 'border-purple-500/30', accent: 'bg-purple-400 text-black' },
};

export function CentauroHeroBanner({ slug, customBanners = [], products = [] }: CentauroHeroBannerProps) {
  // 1. Se o admin configurou banners específicos na tabela storefront_hero_banners
  const activeCustom = customBanners.filter((b) => b.is_active);

  // 2. Tênis em estoque como fallback automático
  const inStockProducts = products.filter((p) => p.has_stock && p.image_url);

  // Determinar lista final de slides
  const hasCustom = activeCustom.length > 0;
  const slideCount = hasCustom ? activeCustom.length : Math.min(6, inStockProducts.length);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % slideCount);
    }, 5500);
    return () => clearInterval(timer);
  }, [slideCount]);

  if (slideCount === 0) {
    return null;
  }

  // Dados do slide atual
  let currentTitle = '';
  let currentSubtitle = '';
  let currentTag = '🔥 DESTAQUE EM ESTOQUE';
  let currentBadgeText = 'EM ESTOQUE EM MANAUS';
  let currentBadgeType = 'shipping';
  let currentImageUrl = '';
  let currentProductUrl = `/loja/${slug}`;
  let currentPriceCents: number | null = null;
  let currentThemeKey = 'gold_amber';
  let currentCtaText = 'Comprar Agora • Ver Tamanhos';

  if (hasCustom) {
    const banner = activeCustom[currentIndex] || activeCustom[0];
    currentTitle = banner.title;
    currentSubtitle = banner.subtitle || 'Disponível com entrega imediata em Manaus ou envio para todo o Amazonas.';
    currentTag = banner.tag || '🔥 DESTAQUE EM ESTOQUE';
    currentBadgeText = banner.discount_badge_text || 'EM ESTOQUE';
    currentBadgeType = banner.badge_type || 'shipping';
    currentImageUrl = banner.custom_image_url || '';
    currentProductUrl = banner.cta_link || (banner.product_id ? `/loja/${slug}/produto/${banner.product_id}` : `/loja/${slug}`);
    currentThemeKey = banner.bg_theme || 'gold_amber';
    currentCtaText = banner.cta_text || 'Comprar Agora • Ver Tamanhos';

    // Buscar preço se tiver produto associado
    if (banner.product_id) {
      const matchProd = inStockProducts.find((p) => p.product_id === banner.product_id);
      if (matchProd) {
        currentPriceCents = matchProd.min_price_cents;
        if (!currentImageUrl) currentImageUrl = matchProd.image_url || '';
      }
    }
  } else {
    const item = inStockProducts[currentIndex] || inStockProducts[0];
    currentTitle = item.product_name;
    currentSubtitle = `Grade do 34 ao 44 disponível com entrega no mesmo dia em Manaus por R$ 1,00 ou envio expresso para todo o interior do Amazonas.`;
    currentTag = '🔥 TÊNIS EM ESTOQUE PRONTA ENTREGA';
    currentBadgeText = 'EM ESTOQUE EM MANAUS';
    currentBadgeType = 'shipping';
    currentImageUrl = item.image_url || '';
    currentProductUrl = `/loja/${slug}/produto/${item.product_id}`;
    currentPriceCents = item.min_price_cents;
    currentThemeKey = ['gold_amber', 'crimson_red', 'cyber_cyan', 'emerald_green', 'dark_purple'][currentIndex % 5];
  }

  const theme = THEME_GRADIENTS[currentThemeKey] || THEME_GRADIENTS.gold_amber;

  function prev() {
    setCurrentIndex((i) => (i === 0 ? slideCount - 1 : i - 1));
  }

  function next() {
    setCurrentIndex((i) => (i + 1) % slideCount);
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-2xl group select-none border ${theme.border}`}>
      {/* Container Principal */}
      <div className={`relative min-h-[420px] sm:min-h-[480px] flex items-center bg-gradient-to-r ${theme.gradient} transition-all duration-700`}>
        
        {/* Background com imagem esfumaçada */}
        {currentImageUrl && (
          <div className="absolute inset-0 opacity-20 filter blur-2xl scale-125">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Lado Direito: Foto Gigante do Tênis Real em Estoque */}
        <div className="absolute right-2 sm:right-10 top-1/2 -translate-y-1/2 w-1/2 sm:w-5/12 h-[280px] sm:h-[380px] flex items-center justify-center pointer-events-none z-10">
          {currentImageUrl && (
            <div className="relative w-full h-full flex items-center justify-center drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] transform group-hover:scale-105 transition-transform duration-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImageUrl}
                alt={currentTitle}
                className="max-h-full max-w-full object-contain filter contrast-105"
              />
              {currentBadgeText && (
                <div className="absolute -bottom-2 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/40 text-[10px] sm:text-xs font-black text-amber-400 flex items-center gap-1.5 shadow-lg">
                  {currentBadgeType === 'shipping' ? (
                    <Truck className="h-3 w-3 text-amber-400" />
                  ) : currentBadgeType === 'promo' ? (
                    <Percent className="h-3 w-3 text-red-400" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  )}
                  <span>{currentBadgeText}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lado Esquerdo: Textos, Preços e Botões de Compra */}
        <div className="relative z-20 max-w-xl px-6 sm:px-12 py-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-black px-3 py-0.5 text-[11px] font-black uppercase tracking-wider shadow-md">
              <Flame className="h-3.5 w-3.5 fill-black" />
              {currentTag}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter leading-none text-white drop-shadow-md">
            {currentTitle}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-md leading-relaxed">
            {currentSubtitle}
          </p>

          {/* Preço de Destaque se houver */}
          {currentPriceCents && (
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {formatPrice(currentPriceCents)}
              </span>
              <span className="text-xs text-amber-400 font-bold">
                ou 3x de {formatPrice(Math.round(currentPriceCents / 3))} sem juros
              </span>
            </div>
          )}

          {/* Botão de Ação */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={currentProductUrl}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-xs sm:text-sm font-black text-black hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/20 active:scale-98"
            >
              <span>{currentCtaText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-semibold bg-black/40 px-3 py-2 rounded-xl border border-zinc-800">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Garantia de Autenticidade HB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Navegação Anterior / Próximo */}
      {slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Tênis Anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo Tênis"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicadores de Slide */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {Array.from({ length: slideCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir para banner ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
