'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  TrendingUp,
  Flame,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface TopProductItem {
  product_id?: string;
  product_name: string;
  brand_name?: string;
  color?: string;
  image_url?: string | null;
  total_pairs_sold: number;
  total_revenue_cents: number;
  current_stock?: number;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function TopSellingSneakersCard({
  topProducts,
  className = '',
}: {
  topProducts: TopProductItem[];
  className?: string;
}) {
  const [filter, setFilter] = useState<'all' | 'nike' | 'adidas' | 'jordan'>('all');

  const filtered = topProducts.filter((item) => {
    if (filter === 'all') return true;
    const b = (item.brand_name || item.product_name).toLowerCase();
    return b.includes(filter);
  });

  const maxSold = Math.max(...topProducts.map((p) => p.total_pairs_sold), 1);

  return (
    <Card className={`rounded-2xl border-2 border-amber-400/30 bg-gradient-to-b from-white to-amber-50/20 shadow-md ${className}`}>
      <CardHeader className="border-b bg-amber-50/40 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black shadow-xs font-black">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                TOP Tênis Mais Vendidos
                <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
                  <Flame className="h-3 w-3 text-red-500 mr-0.5 fill-red-500" />
                  Ranking Oficial
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Descubra os modelos mais procurados e com maior saída no caixa e atacado.
              </p>
            </div>
          </div>

          {/* Filtros Rápidos de Marca */}
          <div className="flex items-center gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
                filter === 'all'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Todos ({topProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('nike')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
                filter === 'nike'
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Nike
            </button>
            <button
              type="button"
              onClick={() => setFilter('jordan')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
                filter === 'jordan'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Jordan
            </button>
            <button
              type="button"
              onClick={() => setFilter('adidas')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
                filter === 'adidas'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Adidas
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
            <Package className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="font-semibold">Nenhum tênis encontrado no período.</p>
            <p className="text-xs">Faça vendas no PDV para alimentar o ranking de campeões de vendas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((item, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;
              const pctOfMax = Math.round((item.total_pairs_sold / maxSold) * 100);

              const badgeBg = isFirst
                ? 'bg-amber-400 text-black border-amber-500 font-black shadow-sm ring-2 ring-amber-300'
                : isSecond
                ? 'bg-zinc-300 text-black border-zinc-400 font-black'
                : isThird
                ? 'bg-amber-700 text-white border-amber-800 font-black'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200 font-bold';

              const medal = isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${rank}`;

              return (
                <div
                  key={index}
                  className={`rounded-2xl border p-3.5 transition-all flex flex-col justify-between gap-2.5 ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-500/10 via-white to-amber-500/5 border-amber-400 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Selo do Pódio */}
                    <div className="flex flex-col items-center justify-center">
                      <span className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs border ${badgeBg}`}>
                        {medal}
                      </span>
                    </div>

                    {/* Foto do Tênis */}
                    <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                          <Layers className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Detalhes do Modelo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.brand_name && (
                          <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-200">
                            {item.brand_name}
                          </span>
                        )}
                        {isFirst && (
                          <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" /> Campeão de Vendas
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-xs sm:text-sm text-gray-900 leading-tight mt-0.5 line-clamp-1">
                        {item.product_name}
                      </h4>
                      <p className="text-[11px] font-semibold text-gray-500 truncate mt-0.5">
                        {item.color || 'Cores Originais'}
                      </p>

                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="font-black text-emerald-800 font-mono">
                          {formatPrice(item.total_revenue_cents)}
                        </span>
                        <span className="font-black text-gray-900 bg-zinc-100 px-2 py-0.5 rounded-md text-[11px]">
                          <strong>{item.total_pairs_sold}</strong> {item.total_pairs_sold === 1 ? 'par vendido' : 'pares vendidos'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso Visual de Saída */}
                  <div className="space-y-1 border-t border-gray-100 pt-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span className="flex items-center gap-1 font-semibold">
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                        Saída / Volume: {pctOfMax}%
                      </span>
                      {item.current_stock !== undefined && (
                        <span className="flex items-center gap-1 font-bold text-gray-600">
                          <Boxes className="h-3 w-3 text-blue-600" />
                          Estoque Restante: <strong>{item.current_stock} pares</strong>
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFirst
                            ? 'bg-amber-500'
                            : isSecond
                            ? 'bg-zinc-700'
                            : isThird
                            ? 'bg-amber-700'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.max(5, pctOfMax)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rodapé com Link para Estoque / PDV */}
        <div className="border-t border-gray-200/70 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600">
          <span className="flex items-center gap-1 font-semibold">
            💡 Dica: Mantenha sempre estoque abastecido dos 5 primeiros colocados para nunca perder vendas.
          </span>
          <Link
            href="/dashboard/relatorios"
            className="font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 self-end sm:self-auto"
          >
            <span>Ver Relatório Completo de Lucros</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
