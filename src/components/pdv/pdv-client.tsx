'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  PackageSearch,
  Layers,
  Sparkles,
  PackageCheck,
  Eye,
} from 'lucide-react';
import { ProductSearch, type SearchResultVariant } from './product-search';
import { CheckoutDialog } from './checkout-dialog';
import { SneakerQuickViewDialog, type GroupedPdvProduct } from './sneaker-quick-view-dialog';
import { CashRegisterHeader } from './cash-register-header';
import { ConnectionIndicator } from './connection-indicator';
import { AdminDiscountDialog } from './admin-discount-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useConnectionStatus } from '@/lib/offline/use-connection-status';
import { replaceCatalog, decrementLocalStock, type CachedVariant } from '@/lib/offline/db';
import type { CashRegister, Customer, Seller } from '@/types/database';

export interface CartItem {
  variantId: string;
  productName: string;
  color: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
  availableQuantity: number;
  brandName?: string;
  imageUrl?: string | null;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PdvClient({
  cashRegister,
  customers,
  sellers,
  catalog,
}: {
  cashRegister: CashRegister;
  customers: Pick<Customer, 'id' | 'full_name'>[];
  sellers: Pick<Seller, 'id' | 'full_name'>[];
  catalog: CachedVariant[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [appliedDiscountCents, setAppliedDiscountCents] = useState<number>(0);
  const [discountDescription, setDiscountDescription] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<GroupedPdvProduct | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { status, queueLength, refreshQueueLength } = useConnectionStatus();

  useEffect(() => {
    replaceCatalog(catalog).catch(() => {});
  }, [catalog]);

  function addToCart(variant: SearchResultVariant, autoCheckout: boolean = false) {
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === variant.id);
      if (existing) {
        if (existing.quantity >= variant.available_quantity) {
          toast.error(`Estoque esgotado para o tamanho ${variant.size}`);
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
          brandName: variant.brand_name,
          imageUrl: variant.image_url,
        },
      ];
    });

    toast.success(`+1 ${variant.product_name} (Tam ${variant.size})`);

    if (autoCheckout) {
      setCheckoutOpen(true);
    }
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

  const totalItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [cart]
  );

  const finalTotalCents = Math.max(0, subtotalCents - appliedDiscountCents);

  // Agrupamento de produtos para a vitrine visual do PDV
  const groupedProducts = useMemo(() => {
    const map = new Map<
      string,
      {
        productName: string;
        brandName: string;
        imageUrl: string | null;
        priceCents: number;
        color: string;
        variants: CachedVariant[];
      }
    >();

    for (const item of catalog) {
      const key = `${item.product_name}__${item.color}`;
      if (!map.has(key)) {
        map.set(key, {
          productName: item.product_name,
          brandName: item.brand_name || '',
          imageUrl: item.image_url || null,
          priceCents: item.price_cents,
          color: item.color,
          variants: [],
        });
      }
      map.get(key)!.variants.push(item);
    }

    return Array.from(map.values());
  }, [catalog]);

  // Lista de marcas disponíveis no catálogo
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    groupedProducts.forEach((p) => {
      if (p.brandName) brandsSet.add(p.brandName);
    });
    return Array.from(brandsSet).sort();
  }, [groupedProducts]);

  // Filtragem da vitrine por marca
  const filteredProducts = useMemo(() => {
    if (selectedBrandFilter === 'all') return groupedProducts;
    return groupedProducts.filter(
      (p) => p.brandName.toLowerCase() === selectedBrandFilter.toLowerCase()
    );
  }, [groupedProducts, selectedBrandFilter]);

  async function handleSaleComplete(soldItems: CartItem[]) {
    for (const item of soldItems) {
      await decrementLocalStock(item.variantId, item.quantity);
    }
    setCart([]);
    setAppliedDiscountCents(0);
    setDiscountDescription('');
    setCheckoutOpen(false);
    await refreshQueueLength();
    if (navigator.onLine) {
      startTransition(() => router.refresh());
    }
    toast.success('🎉 Venda finalizada com sucesso e estoque atualizado!');
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-6">
      {/* Barra de Status e Pendências */}
      <div className="flex items-center justify-between text-xs">
        <ConnectionIndicator status={status} queueLength={queueLength} />
        <Link
          href="/dashboard/pdv/conflitos"
          className="text-xs text-muted-foreground underline underline-offset-4"
        >
          Pendências de sincronização
        </Link>
      </div>

      {/* Cabeçalho do Caixa com Ações Mobile & Desktop */}
      <CashRegisterHeader cashRegister={cashRegister} isOnline={status !== 'offline'} />

      {/* Seletor de Abas Mobile */}
      <div className="flex rounded-2xl bg-muted p-1 lg:hidden border">
        <button
          type="button"
          onClick={() => setMobileTab('products')}
          className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'products'
              ? 'bg-black text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PackageSearch className="h-4 w-4" />
          <span>Produtos & Busca</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'cart'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Carrinho ({totalItemsCount})</span>
        </button>
      </div>

      {/* Grid Principal: Produtos vs Carrinho */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Painel de Produtos & Vitrine */}
        <div className={`space-y-4 ${mobileTab === 'cart' ? 'hidden lg:block' : 'block'}`}>
          {/* Busca Rápida com Dropdown e Imagens */}
          <ProductSearch onSelect={addToCart} isOnline={status !== 'offline'} />

          {/* Filtros Rápidos por Marca */}
          {availableBrands.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedBrandFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                  selectedBrandFilter === 'all'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Todas ({groupedProducts.length})
              </button>
              {availableBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrandFilter(brand)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                    selectedBrandFilter === brand
                      ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}

          {/* Vitrine Visual de Tênis em Estoque */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-1">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Catálogo em Estoque ({filteredProducts.length} modelos)
              </span>
              <span>Clique no tamanho para adicionar ao carrinho</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product, pIdx) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.available_quantity,
                  0
                );

                return (
                  <div
                    key={pIdx}
                    className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-2"
                  >
                    {/* Cabeçalho do Card: Clique na foto ou no nome abre a Janela Maior de Visualização */}
                    <div
                      onClick={() => {
                        setQuickViewProduct(product);
                        setQuickViewOpen(true);
                      }}
                      className="flex gap-3 cursor-pointer group/header hover:bg-zinc-50/80 p-1 -m-1 rounded-xl transition-all"
                      title="Clique para abrir a visualização grande e checar o modelo"
                    >
                      {/* Foto do Tênis com Efeito Zoom no Hover */}
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group-hover/header:border-black transition-colors">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="h-full w-full object-cover group-hover/header:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300">
                            <PackageCheck className="h-6 w-6" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/header:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="h-4 w-4 text-white drop-shadow-md" />
                        </div>
                      </div>

                      {/* Dados do Tênis */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          {product.brandName && (
                            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {product.brandName}
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-gray-400 group-hover/header:text-amber-600 flex items-center gap-0.5">
                            <Eye className="h-2.5 w-2.5" />
                            Ver
                          </span>
                        </div>

                        <h4 className="font-black text-xs text-gray-900 leading-tight mt-0.5 line-clamp-2 group-hover/header:text-amber-700 transition-colors">
                          {product.productName}
                        </h4>
                        <p className="text-[11px] font-semibold text-gray-500 truncate mt-0.5">
                          {product.color}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-black text-xs text-black">
                            {formatPrice(product.priceCents)}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              totalStock > 0 ? 'text-emerald-700' : 'text-red-500'
                            }`}
                          >
                            {totalStock > 0 ? `${totalStock} pares` : 'Esgotado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Grade de Numerações Táteis: Clicar no número vai DIRETO PRO CAIXA para pagamento */}
                    <div className="border-t border-gray-100 pt-2">
                      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                        {product.variants
                          .sort((a, b) => parseInt(a.size) - parseInt(b.size))
                          .map((variant) => {
                            const inStock = variant.available_quantity > 0;
                            const cartQty =
                              cart.find((c) => c.variantId === variant.id)?.quantity || 0;

                            return (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() =>
                                  addToCart(
                                    {
                                      id: variant.id,
                                      color: variant.color,
                                      size: variant.size,
                                      sku: variant.sku,
                                      barcode: variant.barcode,
                                      price_cents: variant.price_cents,
                                      product_name: product.productName,
                                      brand_name: product.brandName,
                                      available_quantity: variant.available_quantity,
                                      image_url: product.imageUrl,
                                    },
                                    true // vai direto para o caixa para pagamento
                                  )
                                }
                                disabled={!inStock}
                                title={
                                  inStock
                                    ? `Tam ${variant.size}: Clique para lançar e ir direto ao pagamento`
                                    : `Tam ${variant.size}: Esgotado`
                                }
                                className={`flex flex-col items-center justify-center min-w-[34px] h-9 rounded-lg text-[10px] font-black transition-all ${
                                  !inStock
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                    : cartQty > 0
                                    ? 'bg-amber-400 text-black ring-2 ring-black font-black shadow-xs'
                                    : 'bg-zinc-100 text-zinc-900 hover:bg-black hover:text-white active:scale-95'
                                }`}
                              >
                                <span>{variant.size}</span>
                                {inStock && (
                                  <span className="text-[8px] opacity-70">
                                    {variant.available_quantity}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Painel do Carrinho Desktop & Mobile */}
        <div className={`${mobileTab === 'products' ? 'hidden lg:block' : 'block'}`}>
          <Card className="shadow-lg border-2 border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-amber-500" />
                  Carrinho do Caixa
                </CardTitle>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {totalItemsCount} {totalItemsCount === 1 ? 'par' : 'pares'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground space-y-1">
                  <Layers className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="font-semibold">Nenhum calçado adicionado.</p>
                  <p className="text-xs">Selecione os tênis ao lado para lançar a venda.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.variantId}
                      className="rounded-xl border bg-card p-3 flex flex-col justify-between gap-2 text-sm shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs text-foreground truncate">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.color} • <strong className="text-foreground">Tam {item.size}</strong>
                          </p>
                          <p className="text-xs font-black text-amber-600 mt-0.5">
                            {formatPrice(item.unitPriceCents)} cada
                          </p>
                        </div>
                        <span className="font-black text-sm text-foreground">
                          {formatPrice(item.unitPriceCents * item.quantity)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t pt-2 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => updateQuantity(item.variantId, -1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-6 text-center font-black text-xs font-mono">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => updateQuantity(item.variantId, 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SEÇÃO DE DESCONTO EXCLUSIVO COM SENHA DO DONO */}
              {cart.length > 0 && (
                <div className="pt-1">
                  <AdminDiscountDialog
                    subtotalCents={subtotalCents}
                    tenantId={cashRegister.tenant_id}
                    appliedDiscountCents={appliedDiscountCents}
                    onApplyDiscount={(cents, desc) => {
                      setAppliedDiscountCents(cents);
                      if (desc) setDiscountDescription(desc);
                      toast.success('Desconto liberado com a Senha Mestra do Dono!');
                    }}
                    onRemoveDiscount={() => {
                      setAppliedDiscountCents(0);
                      setDiscountDescription('');
                      toast.info('Desconto removido do carrinho.');
                    }}
                  />
                </div>
              )}

              {/* Totais do Carrinho */}
              <div className="border-t pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Bruto ({totalItemsCount} pares)</span>
                  <span className="font-semibold">{formatPrice(subtotalCents)}</span>
                </div>

                {appliedDiscountCents > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Desconto do Dono ({discountDescription || 'Autorizado'}):</span>
                    <span>- {formatPrice(appliedDiscountCents)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-black pt-1 border-t">
                  <span>Total da Venda</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">
                    {formatPrice(finalTotalCents)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Baixa automática imediata no estoque único central.
                </p>
              </div>

              {/* Botão de Finalizar Venda */}
              <Button
                type="button"
                className="w-full bg-amber-500 text-black hover:bg-amber-400 font-black py-6 text-sm shadow-md"
                disabled={cart.length === 0}
                onClick={() => setCheckoutOpen(true)}
              >
                <span>Finalizar Venda & Cobrar</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Barra de Checkout Flutuante no Celular */}
      {cart.length > 0 && mobileTab === 'products' && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-black/95 text-white p-3 border-t border-amber-400/30 flex items-center justify-between shadow-2xl lg:hidden backdrop-blur-md">
          <div>
            <p className="text-[10px] text-amber-400 uppercase font-black tracking-wider">
              {totalItemsCount} {totalItemsCount === 1 ? 'par no carrinho' : 'pares no carrinho'}
            </p>
            <p className="text-base font-black font-mono">{formatPrice(finalTotalCents)}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMobileTab('cart')}
              className="px-3 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-white border border-zinc-700"
            >
              Ver Carrinho
            </button>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-black flex items-center gap-1 shadow-lg"
            >
              <span>Cobrar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Pagamento e Fechamento de Venda */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cart={cart}
        subtotalCents={subtotalCents}
        initialDiscountCents={appliedDiscountCents}
        tenantId={cashRegister.tenant_id}
        customers={customers}
        sellers={sellers}
        cashRegisterId={cashRegister.id}
        onSuccess={handleSaleComplete}
      />

      {/* Modal de Visualização Ampliada e Checagem Visual do Calçado */}
      <SneakerQuickViewDialog
        product={quickViewProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onAddToCart={addToCart}
      />
    </div>
  );
}
