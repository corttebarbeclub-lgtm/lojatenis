'use client';

import { useEffect, useState } from 'react';
import { Search, Loader2, PackageCheck, Sparkles } from 'lucide-react';
import { searchCatalog } from '@/lib/offline/db';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export interface SearchResultVariant {
  id: string;
  color: string;
  size: string;
  sku: string | null;
  barcode: string | null;
  price_cents: number;
  product_name: string;
  brand_name?: string;
  available_quantity: number;
  image_url?: string | null;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProductSearch({
  onSelect,
  isOnline,
}: {
  onSelect: (variant: SearchResultVariant) => void;
  isOnline: boolean;
  initialCatalog?: SearchResultVariant[];
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    const timeout = setTimeout(async () => {
      setIsLoading(true);

      try {
        if (isOnline) {
          // Busca via endpoint de API dedicado
          const res = await fetch(`/api/admin/pdv/search?q=${encodeURIComponent(trimmed)}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.results)) {
            setResults(data.results);
            setIsLoading(false);
            return;
          }
        }

        // Fallback para catálogo local (IndexedDB)
        const cached = await searchCatalog(trimmed);
        setResults(cached);
      } catch {
        // Fallback em caso de erro de rede
        const cached = await searchCatalog(trimmed);
        setResults(cached);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, isOnline]);

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-10 pr-10 py-5 rounded-2xl border-gray-300 text-xs font-semibold focus:border-black focus:ring-1 focus:ring-black bg-white shadow-sm"
          placeholder="Buscar por marca, modelo, cor, tamanho (ex: Nike, Jordan 38, Preto, 40)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          autoFocus
        />
        {isLoading && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {(query.trim().length > 0 || (isFocused && results.length > 0)) && (
        <Card className="max-h-96 overflow-y-auto p-1.5 rounded-2xl border border-gray-200 shadow-xl bg-white space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-xs font-bold text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              <span>Buscando modelos no estoque...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-700">Nenhum produto encontrado para &quot;{query}&quot;</p>
              <p className="text-[11px] text-gray-400">
                Tente buscar pelo nome do tênis (ex: Dunk Panda, Air Jordan), marca (Nike, Adidas) ou número (38, 40).
              </p>
            </div>
          ) : (
            <div>
              {query.trim().length === 0 && (
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Sugestões Rápidas de Tênis em Estoque
                </div>
              )}
              <div className="space-y-1">
                {results.map((variant) => {
                  const hasStock = variant.available_quantity > 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        onSelect(variant);
                        setQuery('');
                        setIsFocused(false);
                      }}
                      disabled={!hasStock}
                      className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                        hasStock
                          ? 'hover:bg-amber-50/80 active:scale-[0.99] border border-transparent hover:border-amber-200 cursor-pointer'
                          : 'opacity-40 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      {/* Miniatura da Foto do Tênis */}
                      <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                        {variant.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={variant.image_url}
                            alt={variant.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PackageCheck className="h-5 w-5 text-gray-400" />
                        )}
                      </div>

                      {/* Informações do Tênis */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {variant.brand_name && (
                            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {variant.brand_name}
                            </span>
                          )}
                          <p className="text-xs font-black text-gray-900 truncate">
                            {variant.product_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                          <span className="font-semibold">{variant.color}</span>
                          <span>•</span>
                          <span className="font-black text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                            Tam {variant.size}
                          </span>
                          {variant.sku && (
                            <>
                              <span>•</span>
                              <span className="text-[10px] text-gray-400 font-mono">{variant.sku}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Preço e Estoque */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-black text-gray-900">
                          {formatPrice(variant.price_cents)}
                        </p>
                        <p
                          className={`text-[10px] font-bold ${
                            hasStock ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {hasStock ? `${variant.available_quantity} em estoque` : 'Esgotado'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
