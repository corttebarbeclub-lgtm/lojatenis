'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Printer,
  XCircle,
  Truck,
  MapPin,
  Phone,
  ShoppingBag,
  ExternalLink,
  Car,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { printThermalReceipt, type ThermalReceiptData } from '@/components/receipt/thermal-receipt';

interface OnlineOrderItem {
  id: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  variant?: {
    id: string;
    size: string;
    color: string;
    product?: {
      id: string;
      name: string;
    };
  };
}

interface OnlineOrder {
  id: string;
  status: string;
  fulfillment_status?: string;
  order_source: string;
  subtotal_cents: number;
  total_cents: number;
  delivery_fee_cents: number;
  delivery_address: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    complement?: string;
    reference?: string;
    zipCode?: string;
    uber_tracking_url?: string;
  } | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes: string;
  created_at: string;
  sale_items: OnlineOrderItem[];
  payments?: { id: string; method: string; amount_cents: number }[];
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function OnlineOrdersQueueDialog({ tenantId }: { tenantId?: string }) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [uberUrls, setUberUrls] = useState<Record<string, string>>({});

  async function loadOrders() {
    try {
      const res = await fetch(`/api/pdv/online-orders?tenant_id=${tenantId || ''}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch {
      // Falha silenciosa
    }
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, [tenantId]);

  async function handleAction(order: OnlineOrder, action: 'approve' | 'set_paid' | 'dispatch_uber' | 'delivered') {
    setProcessingId(order.id);
    try {
      const uberUrl = uberUrls[order.id] || order.delivery_address?.uber_tracking_url || '';
      const res = await fetch('/api/pdv/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId: order.id, action, uberUrl }),
      });

      const data = await res.json();
      if (data.success) {
        if (action === 'approve') {
          toast.success('Pedido Aceito! Status: Aguardando Pagamento.');
        } else if (action === 'set_paid') {
          toast.success('Pagamento Confirmado! Status: Em Separação.');
        } else if (action === 'dispatch_uber') {
          toast.success('🚀 Despachado! Link do Uber enviado para o status do cliente!');
        } else if (action === 'delivered') {
          toast.success('✅ Pedido marcado como Entregue!');
        }

        // Atualizar lista local
        await loadOrders();
      } else {
        toast.error(data.error || 'Erro ao processar pedido.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setProcessingId(null);
    }
  }

  function handlePrintThermal(order: OnlineOrder) {
    const receiptData: ThermalReceiptData = {
      orderNumber: order.id,
      orderSource: 'storefront',
      createdAt: order.created_at,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      deliveryAddress: order.delivery_address,
      deliveryFeeCents: order.delivery_fee_cents,
      subtotalCents: order.subtotal_cents,
      totalCents: order.total_cents,
      items: order.sale_items.map((it) => ({
        productName: it.variant?.product?.name || 'Tênis',
        color: it.variant?.color || '',
        size: it.variant?.size || '',
        quantity: it.quantity,
        unitPriceCents: it.unit_price_cents,
        totalCents: it.total_cents,
      })),
      payments: (order.payments && order.payments.length > 0 ? order.payments : [{ method: 'pix', amount_cents: order.total_cents }]).map((p) => ({
        method: p.method,
        amountCents: p.amount_cents,
      })),
      notes: order.notes,
    };

    printThermalReceipt(receiptData);
    toast.success('Imprimindo cupom térmico não fiscal...');
  }

  async function handleRejectOrder(orderId: string) {
    if (!confirm('Deseja realmente recusar este pedido e devolver os itens ao estoque?')) return;

    setProcessingId(orderId);
    try {
      const res = await fetch('/api/pdv/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId: orderId, action: 'reject' }),
      });

      const data = await res.json();
      if (data.success) {
        toast.info('Pedido recusado e estoque devolvido.');
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        toast.error(data.error || 'Erro ao recusar pedido.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setProcessingId(null);
    }
  }

  const pendingCount = orders.filter((o) => o.status === 'pending_approval' || o.fulfillment_status === 'waiting_payment').length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border shadow-xs ${
            pendingCount > 0
              ? 'bg-red-600 text-white border-red-700 animate-pulse'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Bell className={`h-4 w-4 ${pendingCount > 0 ? 'fill-white' : 'text-amber-600'}`} />
          <span>Pedidos do Site</span>
          {pendingCount > 0 && (
            <span className="bg-white text-red-700 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
              {pendingCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-black text-gray-900">
              <Truck className="h-5 w-5 text-amber-600" />
              Gestão de Pedidos da Loja Virtual (PDV Balcão)
            </DialogTitle>
            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-bold text-xs">
              Plano Start
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Acompanhe pedidos, mude o status para o cliente e anexe o link do Uber para rastreio em tempo real.
          </p>
        </DialogHeader>

        {orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500 space-y-2">
            <ShoppingBag className="h-10 w-10 mx-auto text-gray-300" />
            <p className="font-bold text-gray-800">Nenhum pedido pendente na fila.</p>
            <p className="text-xs text-gray-400">Novos pedidos feitos no site aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {orders.map((order) => {
              const isProcessing = processingId === order.id;
              const fulfillment = order.fulfillment_status || order.status;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border-2 border-zinc-200 bg-white p-4 shadow-sm space-y-3"
                >
                  {/* Cabeçalho do Pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-gray-900">
                          {order.customer_name || 'Cliente da Loja'}
                        </span>
                        {fulfillment === 'pending_approval' && (
                          <Badge className="bg-amber-500 text-black text-[10px] font-black">
                            Novo • Aguardando Aceite
                          </Badge>
                        )}
                        {fulfillment === 'waiting_payment' && (
                          <Badge className="bg-yellow-400 text-black text-[10px] font-black">
                            Aguardando Pagamento
                          </Badge>
                        )}
                        {fulfillment === 'in_preparation' && (
                          <Badge className="bg-blue-600 text-white text-[10px] font-black">
                            Em Separação
                          </Badge>
                        )}
                        {fulfillment === 'shipped' && (
                          <Badge className="bg-emerald-600 text-white text-[10px] font-black">
                            Enviado via Uber
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{order.customer_phone || 'Telefone não informado'}</span>
                        {order.customer_phone && (
                          <a
                            href={`https://wa.me/55${order.customer_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-black hover:underline flex items-center gap-0.5 ml-2"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total do Pedido</p>
                      <p className="text-base font-black text-emerald-700 font-mono">
                        {formatMoney(order.total_cents)}
                      </p>
                    </div>
                  </div>

                  {/* Endereço de Entrega */}
                  {order.delivery_address?.street && (
                    <div className="rounded-xl bg-zinc-50 p-2.5 border border-zinc-200 text-xs text-gray-700 space-y-0.5">
                      <p className="font-black text-gray-900 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-red-500" />
                        Endereço de Entrega:
                      </p>
                      <p className="text-[11px]">
                        {order.delivery_address.street}, Nº {order.delivery_address.number || 'S/N'} • Bairro: {order.delivery_address.neighborhood || '—'} • {order.delivery_address.city}/{order.delivery_address.state}
                      </p>
                    </div>
                  )}

                  {/* Itens do Pedido */}
                  <div className="space-y-1">
                    {order.sale_items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        <div>
                          <span className="font-black text-gray-900">
                            {item.variant?.product?.name || 'Tênis'}
                          </span>
                          <span className="text-gray-500 ml-1">
                            • {item.variant?.color} (<strong>Tam {item.variant?.size}</strong>)
                          </span>
                        </div>
                        <div className="font-mono font-bold text-gray-900">
                          {item.quantity}x {formatMoney(item.unit_price_cents)} = {formatMoney(item.total_cents)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Campo de Link do Uber Flash */}
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 space-y-2">
                    <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-blue-600" />
                      <span>Link de Rastreio do Uber Flash / Entrega (visível para o cliente):</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Ex: https://ubr.to/xyz123"
                        defaultValue={order.delivery_address?.uber_tracking_url || ''}
                        onChange={(e) => setUberUrls({ ...uberUrls, [order.id]: e.target.value })}
                        className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                      />
                      <Button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction(order, 'dispatch_uber')}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 h-auto flex items-center gap-1"
                      >
                        <Send className="h-3 w-3" />
                        <span>Despachar Uber</span>
                      </Button>
                    </div>
                  </div>

                  {/* Ações do Fluxo de Status */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
                    {fulfillment === 'pending_approval' && (
                      <Button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction(order, 'approve')}
                        className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black"
                      >
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        Aceitar Pedido (Aguardando Pagamento)
                      </Button>
                    )}

                    {fulfillment === 'waiting_payment' && (
                      <Button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction(order, 'set_paid')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Confirmar Pagamento (Em Separação)
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePrintThermal(order)}
                      className="border-gray-300 text-gray-800 text-xs font-bold"
                    >
                      <Printer className="h-3.5 w-3.5 mr-1 text-amber-600" />
                      Imprimir Cupom
                    </Button>

                    <Button
                      type="button"
                      disabled={isProcessing}
                      variant="outline"
                      onClick={() => handleRejectOrder(order.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold ml-auto"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Recusar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
