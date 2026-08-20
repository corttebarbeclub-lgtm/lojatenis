'use client';

import Link from 'next/link';
import { formatPrice, getInstallments } from '@/lib/utils/pricing';
import { Truck, ShoppingCart, Heart } from 'lucide-react';
import { useFavoritesStore } from '@/lib/stores/favorites-store';

interface ProductCardProps {
  productId: string;
  slug: string;
  name: string;
  brandName: string | null;
  categoryName: string | null;
  gender: string | null;
  imageUrl: string | null;
  minPriceCents: number;
  maxPriceCents: number;
  hasStock: boolean;
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

export function ProductCard({
  productId,
  slug,
  name,
  brandName,
  categoryName,
  gender,
  imageUrl,
  minPriceCents,
  hasStock,
}: ProductCardProps) {
  const installments = getInstallments(minPriceCents, 3);
  const threeX = installments.find((i) => i.installments === 3);
  const originalPriceCents = Math.round(minPriceCents * 1.25);

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorited = isFavorite(productId);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: productId,
      name,
      brandName: brandName || undefined,
      priceCents: minPriceCents,
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <Link
      href={`/loja/${slug}/produto/${productId}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 shadow-md hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 text-white"
    >
      <div>
        {/* Imagem do Calçado */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-zinc-900 to-black p-2 sm:p-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-16 w-16 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges HB Tênis Manaus */}
          <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 flex flex-col gap-1 z-10">
            {hasStock ? (
              <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-black shadow-md">
                -20% OFF
              </span>
            ) : (
              <span className="inline-flex items-center rounded-lg bg-zinc-900/90 backdrop-blur-md px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-zinc-400">
                Esgotado
              </span>
            )}
          </div>

          {/* Marca e Botão de Favoritar */}
          <div className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 flex items-center gap-1.5">
            {brandName && (
              <span className="rounded-lg bg-black/80 backdrop-blur-md px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-400 shadow-md border border-amber-500/30">
                {brandName}
              </span>
            )}
            <button
              type="button"
              onClick={handleHeartClick}
              aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-md ${
                favorited
                  ? 'bg-rose-500 text-white scale-110'
                  : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${favorited ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Informações do Calçado */}
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-1.5">
          {/* Categoria / Gênero */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 font-medium">
            <span>{categoryName ?? 'Casual'}</span>
            {gender && <span>{genderLabel(gender)}</span>}
          </div>

          {/* Nome do Modelo */}
          <h3 className="text-xs sm:text-sm font-black text-white leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
            {name}
          </h3>

          {/* Preço de Tabela Riscado */}
          <p className="text-[10px] sm:text-xs text-zinc-500 line-through">
            {formatPrice(originalPriceCents)}
          </p>

          {/* Preço Real HB Tênis */}
          <div className="pt-0.5">
            <p className="text-base sm:text-xl font-black text-amber-400 tracking-tight">
              {formatPrice(minPriceCents)}
            </p>
            {threeX && (
              <p className="text-[10px] sm:text-xs text-zinc-300 font-semibold">
                ou 3x de {formatPrice(threeX.valueCents)}
              </p>
            )}
          </div>

          {/* Frete R$ 15,00 Manaus */}
          <div className="flex items-center gap-1.5 pt-1 text-[10px] sm:text-[11px] text-emerald-400 font-bold">
            <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
            <span>Frete R$ 15,00 Manaus</span>
          </div>
        </div>
      </div>

      {/* Botão de Compra Rápida */}
      <div className="p-3 sm:p-4 pt-0">
        <button
          type="button"
          disabled={!hasStock}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-black text-xs sm:text-sm font-black py-2 sm:py-2.5 transition-all shadow-md shadow-amber-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>{hasStock ? 'Comprar' : 'Indisponível'}</span>
        </button>
      </div>
    </Link>
  );
}
