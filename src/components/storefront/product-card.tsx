import Link from 'next/link';
import { formatPrice, getInstallments } from '@/lib/utils/pricing';
import { Truck, ShoppingCart } from 'lucide-react';

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

  // Preço De / Por (preço de mercado vs oferta HB Tênis)
  const originalPriceCents = Math.round(minPriceCents * 1.25);

  return (
    <Link
      href={`/loja/${slug}/produto/${productId}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 shadow-md hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 text-white"
    >
      <div>
        {/* Imagem do Calçado */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-zinc-900 to-black p-3">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges HB Tênis Manaus */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {hasStock ? (
              <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-md">
                -20% OFF
              </span>
            ) : (
              <span className="inline-flex items-center rounded-lg bg-zinc-900/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                Esgotado
              </span>
            )}
          </div>

          {brandName && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="rounded-lg bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400 shadow-md border border-amber-500/30">
                {brandName}
              </span>
            </div>
          )}
        </div>

        {/* Informações do Calçado */}
        <div className="p-4 space-y-1.5">
          {/* Categoria / Gênero */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span>{categoryName ?? 'Sneaker'}</span>
            {gender && <span>{genderLabel(gender)}</span>}
          </div>

          {/* Nome do Modelo */}
          <h3 className="text-sm font-black text-white leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
            {name}
          </h3>

          {/* Preços e Parcelamento */}
          <div className="pt-2">
            {hasStock ? (
              <div className="space-y-0.5">
                <p className="text-xs text-zinc-500 line-through font-medium">
                  R$ {formatPrice(originalPriceCents).replace('R$', '').trim()}
                </p>
                <p className="text-lg font-black text-amber-400">
                  {formatPrice(minPriceCents)}
                </p>
                {threeX && (
                  <p className="text-xs font-semibold text-zinc-300">
                    ou <span className="font-bold text-white">3x de {formatPrice(threeX.valueCents)}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs font-semibold text-zinc-500">Indisponível no momento</p>
            )}
          </div>

          {/* Selo de Entrega Manaus */}
          {hasStock && (
            <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <Truck className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Frete R$ 15,00 Manaus</span>
            </div>
          )}
        </div>
      </div>

      {/* Botão de Compra HB */}
      <div className="p-4 pt-0">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-400 py-2.5 text-xs font-black text-black hover:bg-amber-300 transition-all shadow-md group-hover:shadow-amber-500/20"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Comprar</span>
        </button>
      </div>
    </Link>
  );
}
