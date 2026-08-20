import Link from 'next/link';

interface ProductCardWholesaleProps {
  productId: string;
  slug: string;
  name: string;
  brandName: string | null;
  categoryName: string | null;
  gender: string | null;
  imageUrl: string | null;
  minRetailPriceCents: number;
  minWholesalePriceCents: number;
  maxWholesalePriceCents: number;
  wholesaleMinQty: number;
  hasStock: boolean;
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

export function ProductCardWholesale({
  productId,
  slug,
  name,
  brandName,
  categoryName,
  gender,
  imageUrl,
  minRetailPriceCents,
  minWholesalePriceCents,

  wholesaleMinQty,
  hasStock,
}: ProductCardWholesaleProps) {
  const discountPct = minRetailPriceCents > 0
    ? Math.round((1 - minWholesalePriceCents / minRetailPriceCents) * 100)
    : 0;

  const kitMinCents = minWholesalePriceCents * wholesaleMinQty;

  return (
    <Link
      href={`/loja/${slug}/atacado/produto/${productId}`}
      className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-400 hover:shadow-md transition-all duration-200"
    >
      {/* Imagem quadrada compacta */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="text-xs font-medium text-gray-500">Esgotado</span>
          </div>
        )}
      </div>

      {/* Info principal */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        {/* Marca + gênero */}
        <div className="flex items-center gap-2 flex-wrap">
          {brandName && (
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{brandName}</span>
          )}
          {categoryName && (
            <span className="text-xs text-gray-300">·</span>
          )}
          {categoryName && (
            <span className="text-xs text-gray-400">{categoryName}</span>
          )}
          {gender && (
            <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">
              {genderLabel(gender)}
            </span>
          )}
        </div>

        {/* Nome */}
        <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1 group-hover:text-blue-700 transition-colors">
          {name}
        </h3>

        {/* Tabela de preços */}
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1">
          {/* Preço varejo */}
          <div className="text-xs text-gray-400">
            <span>Varejo: </span>
            <span className="line-through">{formatPrice(minRetailPriceCents)}</span>
          </div>

          {/* Preço atacado */}
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-blue-700">
              {formatPrice(minWholesalePriceCents)}
            </span>
            {discountPct > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                -{discountPct}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Coluna direita — kit mínimo */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <div className="text-right">
          <p className="text-xs text-gray-400">Mín. {wholesaleMinQty} pares</p>
          <p className="text-xs font-medium text-gray-600">Kit: {formatPrice(kitMinCents)}</p>
        </div>
        <span className="mt-2 text-xs font-medium text-blue-600 group-hover:underline">
          Ver grades →
        </span>
      </div>
    </Link>
  );
}
