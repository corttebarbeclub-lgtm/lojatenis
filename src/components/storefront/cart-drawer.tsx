'use client';

import { useCartStore, formatPrice } from '@/lib/stores/cart-store';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CartDrawerProps {
  slug: string;
}

export function CartDrawer({ slug }: CartDrawerProps) {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPriceCents());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900">Carrinho</h2>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1.5 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <ShoppingBag className="h-8 w-8 text-gray-200" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Carrinho vazio</h3>
              <p className="mt-1 text-sm text-gray-400">
                Adicione produtos para continuar.
              </p>
              <button
                onClick={closeCart}
                className="mt-4 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Explorar produtos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.variantId}-${item.isWholesale}`}
                  className="flex gap-3 rounded-xl border border-gray-100 p-3"
                >
                  {/* Imagem */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-200" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      {item.brandName && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {item.brandName}
                        </p>
                      )}
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight truncate">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {item.color} • Tam {item.size}
                        {item.isWholesale && (
                          <span className="ml-1 rounded bg-blue-50 px-1 py-0.5 text-xs font-medium text-blue-600">
                            Atacado
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantidade */}
                      <div className="flex items-center gap-1 rounded-lg border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center hover:bg-gray-50 rounded-l-lg transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center hover:bg-gray-50 rounded-r-lg transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Preço */}
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(item.priceCents * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal ({totalItems} itens)</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</span>
            </div>

            {/* Parcelas */}
            {totalPrice > 0 && (
              <p className="text-xs text-gray-400 text-right">
                ou até 10x de {formatPrice(Math.ceil(totalPrice / 10))} sem juros
              </p>
            )}

            {/* Botão Checkout */}
            <Link
              href={`/loja/${slug}/checkout`}
              onClick={closeCart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-gray-800 transition-all hover:shadow-lg"
            >
              Finalizar Pedido
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Continuar comprando */}
            <button
              onClick={closeCart}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
