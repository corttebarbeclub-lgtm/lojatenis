'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatPrice } from '@/lib/utils/pricing';
import { ShoppingCart, Check, Plus, Minus, PackageCheck, AlertCircle } from 'lucide-react';
import { StockAlertModal } from '@/components/storefront/stock-alert-modal';
import { StickyProductMobileBar } from '@/components/storefront/sticky-product-mobile-bar';

interface Variant {
  variantId: string;
  color: string;
  size: string;
  priceCents: number;
  quantity: number;
}

interface SizeSelectorProps {
  variants: Variant[];
  productId: string;
  productName: string;
  brandName: string | null;
  imageUrl: string | null;
  onSelect?: (variantId: string | null) => void;
}

export function SizeSelector({
  variants,
  productId,
  productName,
  brandName,
  imageUrl,
  onSelect,
}: SizeSelectorProps) {
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? '');
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedOutOfStockSize, setSelectedOutOfStockSize] = useState<string | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const filteredVariants = variants.filter((v) => v.color === selectedColor);
  const selectedVariant = selectedVariantId
    ? variants.find((v) => v.variantId === selectedVariantId)
    : null;

  function handleColorSelect(color: string) {
    setSelectedColor(color);
    setSelectedVariantId(null);
    setSelectedOutOfStockSize(null);
    setPurchaseQuantity(1);
    setJustAdded(false);
    onSelect?.(null);
  }

  function handleSizeSelect(variant: Variant) {
    if (variant.quantity === 0) {
      setSelectedVariantId(null);
      setSelectedOutOfStockSize(variant.size);
      onSelect?.(null);
      return;
    }

    setSelectedOutOfStockSize(null);
    const newId = variant.variantId === selectedVariantId ? null : variant.variantId;
    setSelectedVariantId(newId);
    setPurchaseQuantity(1);
    setJustAdded(false);
    onSelect?.(newId);
  }

  function handleAddToCart() {
    if (!selectedVariant || selectedVariant.quantity === 0) return;

    addItem({
      variantId: selectedVariant.variantId,
      productId,
      productName,
      brandName,
      color: selectedVariant.color,
      size: selectedVariant.size,
      priceCents: selectedVariant.priceCents,
      quantity: purchaseQuantity,
      imageUrl,
      isWholesale: false,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Seletor de cor */}
      {colors.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Cor selecionada: <span className="font-black text-gray-900">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                  selectedColor === color
                    ? 'border-gray-950 bg-gray-950 text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seletor de tamanho com quantidade de estoque visível */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Numeração BR:{' '}
            {selectedVariant ? (
              <span className="font-black text-gray-900">
                Tam {selectedVariant.size} — {formatPrice(selectedVariant.priceCents)}
              </span>
            ) : selectedOutOfStockSize ? (
              <span className="font-black text-red-600">
                Tam {selectedOutOfStockSize} — Esgotado no momento
              </span>
            ) : (
              <span className="font-normal text-gray-400">Clique para selecionar</span>
            )}
          </p>
          {selectedVariant && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <PackageCheck className="h-3.5 w-3.5" />
              {selectedVariant.quantity} em estoque
            </span>
          )}
        </div>

        {/* Grade de tamanhos com estoque unitário */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {filteredVariants.map((variant) => {
            const isSelected = variant.variantId === selectedVariantId;
            const isOutOfStock = variant.quantity === 0;
            const isSelectedOut = selectedOutOfStockSize === variant.size;

            return (
              <button
                key={variant.variantId}
                onClick={() => handleSizeSelect(variant)}
                title={isOutOfStock ? `Tam ${variant.size} Esgotado - Clique para ser avisado` : `${variant.quantity} unidades em estoque`}
                className={`
                  relative flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all
                  ${isSelected
                    ? 'border-gray-950 bg-gray-950 text-white shadow-md scale-102 ring-2 ring-gray-950/20'
                    : isSelectedOut
                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-400'
                    : isOutOfStock
                    ? 'border-gray-200 bg-gray-50 text-gray-400 hover:border-red-300'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-sm font-black">{variant.size}</span>
                <span className={`text-[10px] font-semibold mt-0.5 ${
                  isSelected
                    ? 'text-gray-300'
                    : isOutOfStock
                    ? 'text-red-500 font-bold'
                    : variant.quantity <= 2
                    ? 'text-amber-600 font-bold'
                    : 'text-gray-400'
                }`}>
                  {isOutOfStock ? 'Esgotado' : `${variant.quantity} un`}
                </span>

                {isOutOfStock && !isSelectedOut && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <svg className="h-full w-full text-red-400" viewBox="0 0 40 40" preserveAspectRatio="none">
                      <line x1="0" y1="40" x2="40" y2="0" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CASO O TAMANHO ESTEJA ESGOTADO: BOTÃO AVISE-ME QUANDO CHEGAR */}
      {selectedOutOfStockSize && (
        <div className="space-y-3 pt-2">
          <div className="rounded-2xl bg-red-50 p-4 border border-red-200 space-y-2">
            <p className="text-xs font-black text-red-900 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Tamanho {selectedOutOfStockSize} está esgotado no momento.
            </p>
            <p className="text-[11px] text-red-700">
              Cadastre seu e-mail abaixo para receber um alerta automático imediato assim que dermos entrada de novos pares deste tamanho no estoque!
            </p>

            <StockAlertModal
              productId={productId}
              productName={productName}
              size={selectedOutOfStockSize}
            />
          </div>
        </div>
      )}

      {/* Seletor de Quantidade do Calçado e Botão Adicionar ao Carrinho */}
      {selectedVariant && selectedVariant.quantity > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-200">
            <span className="text-xs font-bold text-gray-700">Quantidade de pares:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPurchaseQuantity((q) => Math.max(1, q - 1))}
                disabled={purchaseQuantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-black text-sm text-gray-900">{purchaseQuantity}</span>
              <button
                type="button"
                onClick={() => setPurchaseQuantity((q) => Math.min(selectedVariant.quantity, q + 1))}
                disabled={purchaseQuantity >= selectedVariant.quantity}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950 text-white hover:bg-gray-800 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`
              flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black transition-all duration-300 shadow-lg
              ${justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gray-950 text-white hover:bg-gray-800 shadow-gray-950/20 hover:-translate-y-0.5'
              }
            `}
          >
            {justAdded ? (
              <>
                <Check className="h-5 w-5" />
                Adicionado ao carrinho ({purchaseQuantity}x)!
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                Adicionar ao Carrinho — {formatPrice(selectedVariant.priceCents * purchaseQuantity)}
              </>
            )}
          </button>
        </div>
      )}

      {!selectedVariant && !selectedOutOfStockSize && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2 border border-amber-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
          <span>Selecione uma numeração acima para visualizar o estoque e comprar.</span>
        </div>
      )}

      {/* Barra de Compra Rápida Fixa no Rodapé Mobile */}
      <StickyProductMobileBar
        productName={productName}
        priceCents={selectedVariant ? selectedVariant.priceCents : variants[0]?.priceCents || 0}
        imageUrl={imageUrl}
        hasStock={variants.some((v) => v.quantity > 0)}
        onBuyClick={() => {
          if (selectedVariant) {
            handleAddToCart();
            openCart();
          } else {
            // Rola suavemente até o seletor de tamanhos
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}
