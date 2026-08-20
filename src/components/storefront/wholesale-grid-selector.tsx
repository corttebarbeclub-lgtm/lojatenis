'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatPrice } from '@/lib/utils/pricing';
import { Plus, Minus, ShoppingBag, Check, PackageCheck, Layers } from 'lucide-react';

export interface WholesaleVariantItem {
  variant_id: string;
  color: string;
  size: string;
  wholesale_price_cents: number;
  quantity: number; // Estoque disponível
}

interface WholesaleGridSelectorProps {
  productId: string;
  productName: string;
  brandName: string | null;
  imageUrl: string | null;
  wholesaleMinQty: number;
  variants: WholesaleVariantItem[];
  whatsappNumber: string | null;
  storeName: string;
}

export function WholesaleGridSelector({
  productId,
  productName,
  brandName,
  imageUrl,
  wholesaleMinQty,
  variants,
  whatsappNumber,
  storeName,
}: WholesaleGridSelectorProps) {
  // Mapa de quantidades selecionadas por variant_id: { [variantId]: number }
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const colors = Array.from(new Set(variants.map((v) => v.color)));

  function handleQuantityChange(variantId: string, delta: number, maxStock: number) {
    const current = selectedQuantities[variantId] || 0;
    const next = Math.max(0, Math.min(maxStock, current + delta));
    setSelectedQuantities((prev) => ({
      ...prev,
      [variantId]: next,
    }));
  }

  function handleDirectInput(variantId: string, val: string, maxStock: number) {
    const parsed = parseInt(val.replace(/\D/g, ''), 10) || 0;
    const next = Math.max(0, Math.min(maxStock, parsed));
    setSelectedQuantities((prev) => ({
      ...prev,
      [variantId]: next,
    }));
  }

  // Estatísticas da grade selecionada
  const selectedEntries = Object.entries(selectedQuantities).filter(([, qty]) => qty > 0);
  const totalSelectedPairs = selectedEntries.reduce((sum, [, qty]) => sum + qty, 0);
  const totalSelectedPriceCents = selectedEntries.reduce((sum, [varId, qty]) => {
    const v = variants.find((item) => item.variant_id === varId);
    return sum + (v ? v.wholesale_price_cents * qty : 0);
  }, 0);

  const meetsMinQty = totalSelectedPairs >= wholesaleMinQty;

  // Adicionar toda a grade ao carrinho
  function handleAddGridToCart() {
    if (totalSelectedPairs === 0) return;

    for (const [varId, qty] of selectedEntries) {
      const v = variants.find((item) => item.variant_id === varId);
      if (v) {
        addItem({
          variantId: v.variant_id,
          productId,
          productName,
          brandName,
          color: v.color,
          size: v.size,
          priceCents: v.wholesale_price_cents,
          quantity: qty,
          imageUrl,
          isWholesale: true,
          wholesaleMinQty,
        });
      }
    }

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  }

  // Enviar grade fechada direto no WhatsApp
  function handleSendWhatsAppQuote() {
    if (!whatsappNumber || totalSelectedPairs === 0) return;

    const breakdown = selectedEntries
      .map(([varId, qty]) => {
        const v = variants.find((item) => item.variant_id === varId);
        return `   • ${v?.color} - Tam ${v?.size}: *${qty} pares* x ${formatPrice(v?.wholesale_price_cents ?? 0)}`;
      })
      .join('\n');

    const msg = `🏢 *PEDIDO ATACADO B2B — ${storeName.toUpperCase()}*

Olá! Gostaria de fechar a seguinte grade do calçado:
📦 *Produto:* ${productName} (${brandName ?? 'Original'})

📋 *GRADE SELECIONADA (${totalSelectedPairs} pares):*
${breakdown}

💰 *Subtotal Atacado:* *${formatPrice(totalSelectedPriceCents)}*
(Preço unitário: ${formatPrice(variants[0]?.wholesale_price_cents ?? 0)}/par)

Por favor, confirme a disponibilidade para separação e envio.`;

    let cleanPhone = whatsappNumber.replace(/\D/g, '');
    if (!cleanPhone.startsWith('55')) cleanPhone = `55${cleanPhone}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return (
    <div className="space-y-6">
      {/* Título da Grade */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-700" />
          <h2 className="text-base font-bold text-gray-900">
            Monte sua Grade por Tamanho e Cor
          </h2>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          Mínimo do kit: {wholesaleMinQty} pares
        </span>
      </div>

      {/* Matriz de Cores e Tamanhos com Estoque Visível e Controles */}
      <div className="space-y-6">
        {colors.map((color) => {
          const colorVariants = variants.filter((v) => v.color === color);
          return (
            <div key={color} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-gray-900 inline-block" />
                  Cor: {color}
                </span>
                <span className="text-xs text-gray-400">
                  {colorVariants.reduce((sum, v) => sum + v.quantity, 0)} unidades em estoque
                </span>
              </div>

              {/* Grid de Tamanhos da Cor */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {colorVariants.map((v) => {
                  const qty = selectedQuantities[v.variant_id] || 0;
                  const isOutOfStock = v.quantity === 0;

                  return (
                    <div
                      key={v.variant_id}
                      className={`flex flex-col justify-between rounded-xl border p-2.5 transition-all ${
                        qty > 0
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : isOutOfStock
                          ? 'border-gray-100 bg-gray-50/60 opacity-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Top info: Tamanho e Estoque */}
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-gray-900">
                          Tam {v.size}
                        </span>
                        <span className={`text-[11px] font-bold ${v.quantity > 5 ? 'text-emerald-700' : v.quantity > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                          {v.quantity > 0 ? `${v.quantity} un` : 'Esgotado'}
                        </span>
                      </div>

                      {/* Controles de Quantidade */}
                      <div className="mt-3 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(v.variant_id, -1, v.quantity)}
                          disabled={qty === 0 || isOutOfStock}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <input
                          type="text"
                          value={qty}
                          onChange={(e) => handleDirectInput(v.variant_id, e.target.value, v.quantity)}
                          disabled={isOutOfStock}
                          className="w-10 text-center font-bold text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-600 rounded"
                        />

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(v.variant_id, 1, v.quantity)}
                          disabled={qty >= v.quantity || isOutOfStock}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel Flutuante / Fixo com Resumo da Grade e Botões */}
      <div className="rounded-2xl border-2 border-blue-600/30 bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-white p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-blue-200/60 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Resumo da Grade Selecionada</span>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-2xl font-black text-gray-900">
                {totalSelectedPairs} {totalSelectedPairs === 1 ? 'par' : 'pares'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-2xl font-black text-blue-700">
                {formatPrice(totalSelectedPriceCents)}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            {meetsMinQty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                <Check className="h-3.5 w-3.5" /> Kit Mínimo Atingido
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                Faltam {wholesaleMinQty - totalSelectedPairs} pares para o pedido mínimo
              </span>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Adicionar ao Carrinho */}
          <button
            type="button"
            onClick={handleAddGridToCart}
            disabled={totalSelectedPairs === 0}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-5 text-sm font-bold transition-all shadow-md ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-950 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" />
                Grade adicionada ao carrinho!
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                Adicionar Grade ao Carrinho ({totalSelectedPairs} pares)
              </>
            )}
          </button>

          {/* Pedir via WhatsApp */}
          <button
            type="button"
            onClick={handleSendWhatsAppQuote}
            disabled={totalSelectedPairs === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 px-5 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
          >
            <PackageCheck className="h-4 w-4" />
            Fechar Grade no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
