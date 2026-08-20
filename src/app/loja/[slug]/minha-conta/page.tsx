'use client';

import { useState, useEffect } from 'react';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { formatPrice } from '@/lib/stores/cart-store';
import Link from 'next/link';
import {
  User,
  Package,
  Heart,
  ExternalLink,
  Clock,
  CheckCircle2,
  Car,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Search,
  MessageCircle,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  variant?: {
    size: string;
    color: string;
    product?: {
      name: string;
    };
  };
}

interface CustomerOrder {
  id: string;
  status: string;
  fulfillment_status?: string;
  subtotal_cents: number;
  total_cents: number;
  delivery_fee_cents: number;
  delivery_address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    uber_tracking_url?: string;
  };
  customer_name: string;
  created_at: string;
  sale_items: OrderItem[];
}

export default function CustomerPortalPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'pedidos' | 'favoritos'>('pedidos');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [searched, setSearched] = useState(false);

  const { favorites, toggleFavorite } = useFavoritesStore();

  useEffect(() => {
    // Tentar carregar último e-mail/telefone salvo no localStorage
    const saved = localStorage.getItem('hb_customer_contact');
    if (saved) {
      setEmailOrPhone(saved);
      fetchOrders(saved);
    }
  }, []);

  async function fetchOrders(query: string) {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      localStorage.setItem('hb_customer_contact', query.trim());
      const isEmail = query.includes('@');
      const param = isEmail ? `email=${encodeURIComponent(query.trim())}` : `phone=${encodeURIComponent(query.trim())}`;
      const res = await fetch(`/api/storefront/order-status?${param}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch {
      // erro silencioso
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchOrders(emailOrPhone);
  }

  function getStatusBadge(order: CustomerOrder) {
    const fulfillment = order.fulfillment_status || order.status;

    if (fulfillment === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/40">
          <Car className="h-3.5 w-3.5 animate-bounce" />
          Enviado / A caminho (Uber)
        </span>
      );
    }
    if (fulfillment === 'in_preparation') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <Package className="h-3.5 w-3.5" />
          Em Separação no Estoque
        </span>
      );
    }
    if (fulfillment === 'waiting_payment') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
          <Clock className="h-3.5 w-3.5" />
          Aguardando Pagamento
        </span>
      );
    }
    if (fulfillment === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Entregue com Sucesso
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-zinc-800 text-zinc-300 border border-zinc-700">
        <Clock className="h-3.5 w-3.5" />
        Recebido no PDV
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-400 selection:text-black">
      <StorefrontHeader
        storeName="HB Tênis Manaus"
        slug={params.slug}
        whatsappNumber="92981883786"
        activePage="varejo"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* Cabeçalho do Portal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Área do Cliente • HB Tênis
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Minha Conta & Meus Pedidos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Acompanhe o status do seu pedido em tempo real, rastreio via Uber e calçados favoritos.
            </p>
          </div>

          {/* Abas */}
          <div className="flex items-center bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'pedidos'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="h-4 w-4" />
              Meus Pedidos ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('favoritos')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'favoritos'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className="h-4 w-4 fill-current" />
              Favoritos ({favorites.length})
            </button>
          </div>
        </div>

        {/* TAB 1: MEUS PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            {/* Formulário de Identificação */}
            <form
              onSubmit={handleSearch}
              className="rounded-3xl bg-zinc-950 border border-zinc-800 p-4 sm:p-6 space-y-3"
            >
              <label className="block text-xs sm:text-sm font-bold text-zinc-200">
                Digite seu E-mail ou WhatsApp para localizar seus pedidos:
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Ex: seuemail@gmail.com ou (92) 98188-3786"
                    className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !emailOrPhone.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-black px-6 py-3 text-xs sm:text-sm font-black transition-all shadow-md disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Consultar Pedidos'}
                </button>
              </div>
            </form>

            {/* Lista de Pedidos */}
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-3" />
                <p className="text-xs text-zinc-400 font-medium">Buscando seus pedidos na HB Tênis...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-3xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 space-y-4 hover:border-zinc-700 transition-all shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                      <div>
                        <span className="text-[11px] font-mono text-zinc-500 uppercase">
                          Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <p className="text-xs text-zinc-400">
                          {new Date(order.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div>{getStatusBadge(order)}</div>
                    </div>

                    {/* Itens do Pedido */}
                    <div className="space-y-2 divide-y divide-zinc-900">
                      {order.sale_items?.map((item) => (
                        <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs sm:text-sm">
                          <div>
                            <p className="font-bold text-white">
                              {item.variant?.product?.name || 'Tênis Sneaker'}
                            </p>
                            <p className="text-zinc-400 text-xs">
                              {item.variant?.color} • Tamanho: <strong className="text-amber-400">{item.variant?.size}</strong> • Qtd: {item.quantity}
                            </p>
                          </div>
                          <span className="font-black text-white">
                            {formatPrice(item.total_cents)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs sm:text-sm">
                      <span className="text-zinc-400">
                        Frete: {formatPrice(order.delivery_fee_cents)}
                      </span>
                      <span className="text-base sm:text-lg font-black text-amber-400">
                        Total: {formatPrice(order.total_cents)}
                      </span>
                    </div>

                    {/* Rastreio do Uber (Se houver link) */}
                    {order.delivery_address?.uber_tracking_url && (
                      <div className="rounded-2xl bg-gradient-to-r from-blue-600/20 to-black border border-blue-500/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-3 text-center sm:text-left">
                          <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                            <Car className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white">
                              🚗 Seu pedido está a caminho via Uber Flash!
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              Acompanhe o motorista em tempo real no mapa até a sua casa.
                            </p>
                          </div>
                        </div>
                        <a
                          href={order.delivery_address.uber_tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white px-4 py-2.5 text-xs font-black shadow-md transition-all active:scale-98"
                        >
                          <span>Acompanhar no Uber</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Botão de Dúvida / WhatsApp */}
                    <div className="flex justify-end pt-1">
                      <a
                        href={`https://wa.me/5592981883786?text=${encodeURIComponent(
                          `Olá! Gostaria de informações sobre o meu pedido #${order.id.slice(0, 8).toUpperCase()}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Falar com o Caixa sobre este pedido</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : searched ? (
              <div className="text-center py-12 rounded-3xl bg-zinc-950 border border-zinc-800 p-6">
                <ShoppingBag className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-zinc-300">Nenhum pedido localizado.</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Verifique se digitou o mesmo e-mail ou telefone cadastrado no momento da compra.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 rounded-3xl bg-zinc-950/50 border border-zinc-900 p-6">
                <User className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">
                  Informe seus dados acima para ver o status dos seus pedidos e links de entrega.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FAVORITOS COM CORAÇÃO */}
        {activeTab === 'favoritos' && (
          <div>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="group relative rounded-2xl bg-zinc-950 border border-zinc-800 p-3 space-y-2 flex flex-col justify-between"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900">
                      {fav.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fav.imageUrl}
                          alt={fav.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-700">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(fav)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-md"
                      >
                        <Heart className="h-3.5 w-3.5 fill-white" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white line-clamp-2">{fav.name}</p>
                      <p className="text-sm font-black text-amber-400">{formatPrice(fav.priceCents)}</p>
                    </div>

                    <Link
                      href={`/loja/${params.slug}/produto/${fav.id}`}
                      className="w-full inline-flex items-center justify-center rounded-xl bg-amber-400 hover:bg-amber-300 text-black py-2 text-xs font-black transition-all"
                    >
                      Ver Modelo
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-3xl bg-zinc-950 border border-zinc-800 p-6 space-y-3">
                <Heart className="h-12 w-12 text-zinc-700 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-300">Você ainda não favoritou nenhum tênis</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Clique no ícone de coração nos calçados que você mais gostou para salvá-los e comprar quando quiser.
                </p>
                <Link
                  href={`/loja/${params.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 text-black px-5 py-2.5 text-xs font-black hover:bg-amber-300 transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Ir para a Vitrine
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
