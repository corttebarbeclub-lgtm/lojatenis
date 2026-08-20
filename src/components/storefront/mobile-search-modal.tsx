'use client';

import { useState, useEffect } from 'react';
import { Search, X, Flame, ArrowRight, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SearchItem {
  product_id: string;
  product_name: string;
  brand_name: string | null;
  image_url: string | null;
  min_price_cents: number;
}

interface MobileSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const POPULAR_SEARCHES = ['Nike Dunk', 'Adidas Samba', 'Air Jordan', 'Campus 00s', 'Shox 12 Molas', 'Asics Gel'];

export function MobileSearchModal({ open, onOpenChange, slug }: MobileSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/storefront/search?q=${encodeURIComponent(query)}&slug=${slug}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.products || []);
        }
      } catch {
        // Fallback silencioso
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, slug]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-4 sm:p-6 rounded-3xl max-h-[85vh] flex flex-col gap-4">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-amber-500" />
            <DialogTitle className="text-base font-black text-gray-900">
              Buscar Tênis no Estoque
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Input de Busca Otimizado */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o modelo (ex: Samba, Jordan, Dunk, 38, 40)..."
            autoFocus
            className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 p-3.5 pl-10 pr-10 text-xs sm:text-sm font-bold focus:border-black focus:bg-white focus:outline-none transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tags de Buscas Populares */}
        {!query && (
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              Mais Buscados em Manaus:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-800 hover:bg-black hover:text-white transition-all active:scale-95"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados da Busca */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px] pr-1">
          {loading && (
            <div className="py-8 text-center text-xs font-bold text-gray-400 animate-pulse">
              Buscando modelos no estoque...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-800">Nenhum tênis encontrado para &quot;{query}&quot;</p>
              <p className="text-[11px] text-gray-400">Tente buscar por Nike, Adidas, Mizuno, Puma ou número.</p>
            </div>
          )}

          {!loading && results.map((item) => (
            <Link
              key={item.product_id}
              href={`/loja/${slug}/produto/${item.product_id}`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 p-2.5 rounded-2xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group"
            >
              <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <PackageCheck className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {item.brand_name && (
                  <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                    {item.brand_name}
                  </span>
                )}
                <h4 className="text-xs font-black text-gray-900 truncate mt-0.5">
                  {item.product_name}
                </h4>
                <p className="text-xs font-black text-black mt-0.5 font-mono">
                  {formatPrice(item.min_price_cents)}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
