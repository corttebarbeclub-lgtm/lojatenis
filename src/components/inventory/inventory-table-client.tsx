'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  RotateCw,
  PackageCheck,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MovementDialog } from '@/components/inventory/movement-dialog';
import { SneakerDetailModal } from './sneaker-detail-modal';
import { toast } from 'sonner';

export interface InventoryItem {
  id: string;
  product_id: string;
  color: string;
  size: string;
  sku: string;
  barcode: string | null;
  price_cents: number;
  cost_cents: number;
  wholesale_price_cents: number;
  product_name: string;
  brand_name: string;
  quantity: number;
  min_quantity: number;
  image_url: string | null;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function InventoryTableClient({
  items,
  tenantId,
}: {
  items: InventoryItem[];
  tenantId?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estado do Modal de Edição Completa do Tênis
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  function handleOpenSneakerDetail(productId: string) {
    setSelectedProductId(productId);
    setDetailModalOpen(true);
  }

  function handleRefresh() {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Estoque sincronizado em tempo real com o PDV e loja virtual!');
    }, 600);
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Filtro por busca de texto
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.product_name.toLowerCase().includes(query);
        const matchesBrand = item.brand_name.toLowerCase().includes(query);
        const matchesColor = item.color.toLowerCase().includes(query);
        const matchesSize = item.size.toLowerCase().includes(query) || `tam ${item.size}`.includes(query);
        const matchesSku = item.sku.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesColor && !matchesSize && !matchesSku) {
          return false;
        }
      }

      // 2. Filtro por status de estoque
      if (filterMode === 'in_stock') {
        return item.quantity > item.min_quantity;
      }
      if (filterMode === 'low_stock') {
        return item.quantity > 0 && item.quantity <= item.min_quantity;
      }
      if (filterMode === 'out_of_stock') {
        return item.quantity === 0;
      }

      return true;
    });
  }, [items, search, filterMode]);

  const totalInStockCount = items.filter((i) => i.quantity > i.min_quantity).length;
  const lowStockCount = items.filter((i) => i.quantity > 0 && i.quantity <= i.min_quantity).length;
  const outOfStockCount = items.filter((i) => i.quantity === 0).length;

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca Rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tênis, marca, cor, tamanho (ex: 39) ou SKU..."
            className="w-full rounded-xl border border-gray-300 p-2.5 pl-9 text-xs font-bold focus:border-black focus:outline-none bg-zinc-50/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>

        {/* Botões de Filtro por Status */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('in_stock')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap flex items-center gap-1 ${
              filterMode === 'in_stock'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Abastecidos ({totalInStockCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('low_stock')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap flex items-center gap-1 ${
              filterMode === 'low_stock'
                ? 'bg-amber-500 text-black border-amber-500 shadow-xs'
                : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Pouco Estoque ({lowStockCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('out_of_stock')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap flex items-center gap-1 ${
              filterMode === 'out_of_stock'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
            }`}
          >
            <PackageX className="h-3.5 w-3.5" />
            <span>Esgotados ({outOfStockCount})</span>
          </button>

          {/* Botão Sincronizar */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-1"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </Button>
        </div>
      </div>

      {/* Tabela de Estoque */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-14">Foto</TableHead>
              <TableHead>Modelo & Marca (Clique para Editar)</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="text-center">Numeração</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Preço Varejo</TableHead>
              <TableHead className="text-right">Preço Custo</TableHead>
              <TableHead className="text-center">Saldo</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ajustar Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum par de tênis encontrado com os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isLow = item.quantity > 0 && item.quantity <= item.min_quantity;
                const isOut = item.quantity === 0;

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-amber-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Foto (clicável para abrir configurações do tênis) */}
                    <TableCell
                      className="p-2.5"
                      onClick={() => handleOpenSneakerDetail(item.product_id)}
                    >
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 group-hover:ring-2 group-hover:ring-amber-400 transition-all">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300">
                            <PackageCheck className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Modelo e Marca (clicável) */}
                    <TableCell
                      className="py-2.5"
                      onClick={() => handleOpenSneakerDetail(item.product_id)}
                    >
                      <div className="flex items-center gap-1">
                        {item.brand_name && (
                          <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            {item.brand_name}
                          </span>
                        )}
                        <span className="text-[9px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          ⚙️ Editar Tênis
                        </span>
                      </div>
                      <p className="font-black text-xs text-gray-900 leading-tight mt-0.5 group-hover:text-amber-700 transition-colors">
                        {item.product_name}
                      </p>
                    </TableCell>

                    {/* Cor */}
                    <TableCell
                      className="text-xs text-gray-500 font-semibold py-2.5"
                      onClick={() => handleOpenSneakerDetail(item.product_id)}
                    >
                      {item.color}
                    </TableCell>

                    {/* Numeração */}
                    <TableCell
                      className="text-center py-2.5"
                      onClick={() => handleOpenSneakerDetail(item.product_id)}
                    >
                      <span className="font-black text-xs bg-zinc-100 text-black px-2 py-0.5 rounded-lg border border-zinc-200">
                        Tam {item.size}
                      </span>
                    </TableCell>

                    {/* SKU */}
                    <TableCell
                      className="font-mono text-xs text-gray-400 py-2.5"
                      onClick={() => handleOpenSneakerDetail(item.product_id)}
                    >
                      {item.sku}
                    </TableCell>

                    {/* Preço Varejo */}
                    <TableCell
                      className="font-black text-xs text-right font-mono py-2.5 text-gray-900"
                      onClick={() => handleOpenSneakerDetail(item.product_id)}
                    >
                      {formatMoney(item.price_cents)}
                    </TableCell>

                    {/* Preço Custo */}
                    <TableCell
                      className="text-xs text-right font-mono text-gray-500 py-2.5"
                      onClick={() => handleOpenSneakerDetail(item.product_id)}
                    >
                      {item.cost_cents > 0 ? formatMoney(item.cost_cents) : '—'}
                    </TableCell>

                    {/* Saldo em Estoque */}
                    <TableCell
                      className="text-center py-2.5"
                      onClick={() => handleOpenSneakerDetail(item.product_id)}
                    >
                      <span
                        className={`font-black text-xs font-mono px-2 py-0.5 rounded-lg ${
                          isOut
                            ? 'text-red-700 bg-red-50 border border-red-200'
                            : isLow
                            ? 'text-amber-800 bg-amber-50 border border-amber-200'
                            : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {item.quantity} {item.quantity === 1 ? 'par' : 'pares'}
                      </span>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell
                      className="text-center py-2.5"
                      onClick={() => handleOpenSneakerDetail(item.product_id)}
                    >
                      {isOut ? (
                        <Badge variant="destructive" className="text-[10px] font-black">
                          Esgotado
                        </Badge>
                      ) : isLow ? (
                        <Badge variant="outline" className="text-[10px] font-black bg-amber-50 text-amber-800 border-amber-300">
                          Repor
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-black bg-emerald-50 text-emerald-700 border-emerald-300">
                          Disponível
                        </Badge>
                      )}
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="text-right py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenSneakerDetail(item.product_id)}
                          className="h-7 text-xs font-bold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center gap-1"
                        >
                          <SlidersHorizontal className="h-3 w-3 text-amber-700" />
                          <span>Configurar</span>
                        </Button>

                        <MovementDialog
                          variantId={item.id}
                          productName={item.product_name}
                          color={item.color}
                          size={item.size}
                          currentQuantity={item.quantity}
                          currentMinQuantity={item.min_quantity ?? 0}
                          trigger={
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              Movimentar
                            </Button>
                          }
                        />
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-gray-500 hover:text-black">
                          <Link href={`/dashboard/estoque/movimentacoes?variant_id=${item.id}`}>
                            Histórico
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Configurações & Gestão Completa do Tênis */}
      {selectedProductId && (
        <SneakerDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          productId={selectedProductId}
          tenantId={tenantId}
          onSavedSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
