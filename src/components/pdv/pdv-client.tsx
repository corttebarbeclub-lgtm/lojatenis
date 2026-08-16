'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ProductSearch, type SearchResultVariant } from './product-search';
import { CheckoutDialog } from './checkout-dialog';
import { CashRegisterHeader } from './cash-register-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CashRegister, Customer, Seller } from '@/types/database';

export interface CartItem {
  variantId: string;
  productName: string;
  color: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
  availableQuantity: number;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PdvClient({
  cashRegister,
  customers,
  sellers,
}: {
  cashRegister: CashRegister;
  customers: Pick<Customer, 'id' | 'full_name'>[];
  sellers: Pick<Seller, 'id' | 'full_name'>[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function addToCart(variant: SearchResultVariant) {
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === variant.id);
      if (existing) {
        if (existing.quantity >= variant.available_quantity) {
          toast.error('Não há mais estoque disponível deste item.');
          return prev;
        }
        return prev.map((i) =>
          i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          productName: variant.product_name,
          color: variant.color,
          size: variant.size,
          unitPriceCents: variant.price_cents,
          quantity: 1,
          availableQuantity: variant.available_quantity,
        },
      ];
    });
  }

  function updateQuantity(variantId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId !== variantId) return item;
          const nextQuantity = item.quantity + delta;
          if (nextQuantity > item.availableQuantity) {
            toast.error('Não há mais estoque disponível deste item.');
            return item;
          }
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(variantId: string) {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  const subtotalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [cart]
  );

  function handleSaleComplete() {
    setCart([]);
    setCheckoutOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <CashRegisterHeader cashRegister={cashRegister} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <ProductSearch onSelect={addToCart} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Carrinho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex items-start justify-between gap-2 text-sm">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.productName} — {item.color} {item.size}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.unitPriceCents)} cada</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.variantId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-mono">{item.quantity}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.variantId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="ml-1 h-6 w-6"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <span className="font-mono">{formatPrice(item.unitPriceCents * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between text-sm font-medium">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(subtotalCents)}</span>
              </div>
            </div>

            <Button className="w-full" disabled={cart.length === 0} onClick={() => setCheckoutOpen(true)}>
              Finalizar venda
            </Button>
          </CardContent>
        </Card>
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cashRegisterId={cashRegister.id}
        cart={cart}
        subtotalCents={subtotalCents}
        customers={customers}
        sellers={sellers}
        onComplete={handleSaleComplete}
      />
    </div>
  );
}
