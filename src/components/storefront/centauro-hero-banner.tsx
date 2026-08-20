'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Flame, ArrowRight, ShieldCheck, Truck, Percent, CheckCircle2 } from 'lucide-react';

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
  const activeCustom = customBanners.filter((b) => b.is_active);
  const inStockProducts = products.filter((p) => p.has_stock && p.image_url);

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

  let currentTitle = '';
  let currentSubtitle = '';
  let currentTag = '🔥 DESTAQUE EM ESTOQUE';
  let currentBadgeText = 'FRETE R$ 15,00 MANAUS';
  let currentBadgeType = 'shipping';
  let currentImageUrl = '';
  let currentProductUrl = `/loja/${slug}`;
  let currentPriceCents: number | null = null;
  let currentThemeKey = 'gold_amber';
  let currentCtaText = 'Comprar Agora • Frete R$ 15,00';

  if (hasCustom) {
    const banner = activeCustom[currentIndex] || activeCustom[0];
    currentTitle = banner.title;
    currentSubtitle = banner.subtitle || 'Disponível com entrega imediata em Manaus ou envio para todo o Amazonas.';
    currentTag = banner.tag || '🔥 PROMOÇÃO RELÂMPAGO';
    currentBadgeText = banner.discount_badge_text || 'FRETE R$ 15,00 MANAUS';
    currentBadgeType = banner.badge_type || 'shipping';
    currentImageUrl = banner.custom_image_url || '';
    currentProductUrl = banner.cta_link || (banner.product_id ? `/loja/${slug}/produto/${banner.product_id}` : `/loja/${slug}`);
    currentThemeKey = banner.bg_theme || 'gold_amber';
    currentCtaText = banner.cta_text || 'Comprar Agora • Frete R$ 15,00';

    if (!currentImageUrl && inStockProducts.length > 0) {
      currentImageUrl = inStockProducts[0]?.image_url || '/products/real/shoe-008.jpeg';
    }
  } else {
    const item = inStockProducts[currentIndex] || inStockProducts[0];
    currentTitle = item.product_name;
    currentSubtitle = `Grade do 34 ao 44 disponível com entrega rápida em Manaus por R$ 15,00 ou envio expresso para o interior do Amazonas.`;
    currentTag = '🔥 TÊNIS EM ESTOQUE PRONTA ENTREGA';
    currentBadgeText = 'FRETE R$ 15,00 MANAUS';
    currentBadgeType = 'shipping';
    currentImageUrl = item.image_url || '/products/real/shoe-008.jpeg';
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
    <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-950 text-white shadow-2xl group select-none border ${theme.border} w-full max-w-full`}>
      {/* Background com imagem esfumaçada */}
      {currentImageUrl && (
        <div className="absolute inset-0 opacity-15 filter blur-3xl scale-125 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Container Principal Responsivo */}
      <div className={`relative flex flex-col sm:flex-row items-center justify-between p-4 sm:p-10 bg-gradient-to-b sm:bg-gradient-to-r ${theme.gradient} transition-all duration-700 gap-4 sm:gap-8`}>
        
        {/* Lado do Conteúdo / Textos */}
        <div className="relative z-20 w-full sm:w-7/12 space-y-3 sm:space-y-4 text-center sm:text-left">
          <div className="flex justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-black px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md">
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-black" />
              {currentTag}
            </span>
          </div>

          <h2 className="text-xl sm:text-4xl lg:text-5xl font-black italic tracking-tighter leading-tight text-white drop-shadow-md">
            {currentTitle}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-md mx-auto sm:mx-0 leading-relaxed">
            {currentSubtitle}
          </p>

          {/* Preço de Destaque se houver */}
          {currentPriceCents && (
            <div className="flex items-baseline justify-center sm:justify-start gap-2 sm:gap-3 pt-1">
              <span className="text-2xl sm:text-4xl font-black text-amber-400 tracking-tight">
                {formatPrice(currentPriceCents)}
              </span>
              <span className="text-[11px] sm:text-xs text-zinc-300 font-bold">
                ou 3x de {formatPrice(Math.round(currentPriceCents / 3))}
              </span>
            </div>
          )}

          {/* Botão de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 pt-2">
            <Link
              href={currentProductUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-amber-400 px-6 py-3.5 text-xs sm:text-sm font-black text-black hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/20 active:scale-98"
            >
              <span>{currentCtaText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-semibold bg-black/40 px-3 py-2 rounded-xl border border-zinc-800">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Garantia HB Tênis</span>
            </div>
          </div>
        </div>

        {/* Lado da Imagem do Tênis Real em Estoque */}
        <div className="relative z-10 w-full sm:w-5/12 flex flex-col items-center justify-center">
          {currentImageUrl && (
            <div className="relative w-full max-w-[260px] sm:max-w-none h-44 sm:h-72 flex items-center justify-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transform group-hover:scale-105 transition-transform duration-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImageUrl}
                alt={currentTitle}
                className="max-h-full max-w-full object-contain filter contrast-105 rounded-xl"
              />
            </div>
          )}

          {currentBadgeText && (
            <div className="mt-2 bg-black/90 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/40 text-[10px] sm:text-xs font-black text-amber-400 flex items-center gap-1.5 shadow-lg">
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
      </div>

      {/* Botões de Navegação Anterior / Próximo */}
      {slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Tênis Anterior"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 hover:bg-black/90 transition-all"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo Tênis"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 hover:bg-black/90 transition-all"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Indicadores de Slide */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
            {Array.from({ length: slideCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir para banner ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
