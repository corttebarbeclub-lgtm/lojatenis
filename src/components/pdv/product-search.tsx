'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
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
  available_quantity: number;
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
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);

      if (!isOnline) {
        const cached = await searchCatalog(query);
        setResults(cached);
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from('product_variants')
        .select('id, color, size, sku, barcode, price_cents, product:products(name), inventory(quantity)')
        .eq('is_active', true)
        .or(`sku.ilike.%${query}%,barcode.ilike.%${query}%`)
        .limit(10)
        .returns<
          {
            id: string;
            color: string;
            size: string;
            sku: string | null;
            barcode: string | null;
            price_cents: number;
            product: { name: string } | null;
            inventory: { quantity: number } | null;
          }[]
        >();

      let combined = data ?? [];

      // Se não achou por SKU/barcode, tenta por nome do produto (relação separada)
      if (combined.length === 0) {
        const { data: byName } = await supabase
          .from('product_variants')
          .select('id, color, size, sku, barcode, price_cents, product:products!inner(name), inventory(quantity)')
          .eq('is_active', true)
          .ilike('product.name', `%${query}%`)
          .limit(10)
          .returns<
            {
              id: string;
              color: string;
              size: string;
              sku: string | null;
              barcode: string | null;
              price_cents: number;
              product: { name: string } | null;
              inventory: { quantity: number } | null;
            }[]
          >();
        combined = byName ?? [];
      }

      setResults(
        combined.map((v) => ({
          id: v.id,
          color: v.color,
          size: v.size,
          sku: v.sku,
          barcode: v.barcode,
          price_cents: v.price_cents,
          product_name: v.product?.name ?? '—',
          available_quantity: v.inventory?.quantity ?? 0,
        }))
      );
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, isOnline]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por produto, SKU ou código de barras"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {query.trim().length >= 2 && (
        <Card className="max-h-80 overflow-y-auto p-1">
          {isLoading ? (
            <p className="p-3 text-sm text-muted-foreground">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Nenhum produto encontrado.</p>
          ) : (
            results.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  onSelect(variant);
                  setQuery('');
                  setResults([]);
                }}
                disabled={variant.available_quantity <= 0}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div>
                  <p className="font-medium">
                    {variant.product_name} — {variant.color} {variant.size}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {variant.sku ?? 'sem SKU'} · estoque: {variant.available_quantity}
                  </p>
                </div>
                <span className="font-mono">{formatPrice(variant.price_cents)}</span>
              </button>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
