'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PackageCheck,
  ShoppingCart,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import type { SearchResultVariant } from './product-search';

export interface GroupedPdvProduct {
  productName: string;
  brandName: string;
  imageUrl: string | null;
  priceCents: number;
  color: string;
  variants: SearchResultVariant[];
}

interface SneakerQuickViewDialogProps {
  product: GroupedPdvProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (variant: SearchResultVariant, autoCheckout?: boolean) => void;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function SneakerQuickViewDialog({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: SneakerQuickViewDialogProps) {
  const [selectedVariant, setSelectedVariant] = useState<SearchResultVariant | null>(null);

  if (!product) return null;

  const totalStock = product.variants.reduce((acc, v) => acc + (v.available_quantity || 0), 0);
  const sortedVariants = [...product.variants].sort(
    (a, b) => parseInt(a.size) - parseInt(b.size)
  );

  function handleSelectVariant(variant: SearchResultVariant) {
    if (variant.available_quantity <= 0) return;
    setSelectedVariant(variant);
  }

  function handleBuyNow() {
    if (!selectedVariant) return;
    onAddToCart(selectedVariant, true);
    onOpenChange(false);
  }

  function handleAddOnly() {
    if (!selectedVariant) return;
    onAddToCart(selectedVariant, false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-5 sm:p-7 overflow-y-auto max-h-[90vh] rounded-3xl border-2 border-gray-100 shadow-2xl">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-500" />
              <DialogTitle className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                Visualização do Calçado & Checagem Visual
              </DialogTitle>
            </div>
            {product.brandName && (
              <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-black text-xs uppercase px-2.5 py-0.5">
                {product.brandName}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-center">
          
          {/* Foto Grande do Tênis para Checagem Visual */}
          <div className="md:col-span-6 flex flex-col items-center">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border-2 border-gray-200 shadow-inner flex items-center justify-center p-3 group">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="max-h-full max-w-full object-contain filter contrast-105 transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300 gap-2">
                  <PackageCheck className="h-16 w-16" />
                  <span className="text-xs font-bold">Sem imagem</span>
                </div>
              )}

              <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white flex items-center gap-1 shadow-md">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Foto Original do Estoque</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 font-medium text-center mt-2">
              Passe o mouse na foto para ampliar os detalhes do tênis.
            </p>
          </div>

          {/* Dados do Tênis, Preço e Grade de Tamanhos */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                {product.productName}
              </h3>
              <p className="text-xs font-bold text-gray-500 mt-1">
                Cor: <span className="text-gray-900 font-black">{product.color}</span>
              </p>
            </div>

            {/* Bloco de Preço */}
            <div className="rounded-2xl bg-zinc-50 p-3.5 border border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400">Preço de Venda</span>
                <p className="text-2xl font-black text-black">
                  {formatPrice(product.priceCents)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-gray-400">Saldo Geral</span>
                <p className={`text-sm font-black ${totalStock > 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                  {totalStock > 0 ? `${totalStock} pares em estoque` : 'Esgotado'}
                </p>
              </div>
            </div>

            {/* Grade de Numerações Táteis */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                Selecione o Tamanho para o Caixa:
              </label>

              <div className="grid grid-cols-4 gap-2">
                {sortedVariants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isAvailable = v.available_quantity > 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleSelectVariant(v)}
                      className={`
                        relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all
                        ${isSelected
                          ? 'border-black bg-black text-white shadow-lg ring-2 ring-amber-400 scale-105'
                          : isAvailable
                          ? 'border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                          : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        }
                      `}
                    >
                      <span className="text-sm font-black">Tam {v.size}</span>
                      <span className={`text-[10px] font-bold mt-0.5 ${
                        isSelected
                          ? 'text-amber-300'
                          : isAvailable
                          ? 'text-emerald-700'
                          : 'text-gray-300'
                      }`}>
                        {isAvailable ? `${v.available_quantity} un` : '0 un'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ações de Venda Imediata */}
            <div className="space-y-2 pt-2">
              {selectedVariant ? (
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full bg-black text-white hover:bg-zinc-800 py-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span>Lançar Tam {selectedVariant.size} e Ir Direto para o Pagamento</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOnly}
                    className="w-full border-gray-300 text-gray-800 hover:bg-gray-100 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4 text-gray-600" />
                    <span>Apenas Adicionar ao Carrinho</span>
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800 flex items-center gap-2 border border-amber-200 font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
                  <span>Clique em um tamanho acima para confirmar o par desejado.</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
