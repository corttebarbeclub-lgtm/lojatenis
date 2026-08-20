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

  // Polling automático a cada 10 segundos para verificar novos pedidos
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch(`/api/pdv/online-orders?tenant_id=${tenantId || ''}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch {
        // Falha silenciosa em polling
      }
    }

    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [tenantId]);

  async function handleApproveOrder(order: OnlineOrder) {
    setProcessingId(order.id);
    try {
      const res = await fetch('/api/pdv/online-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId: order.id, action: 'approve' }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('🎉 Pedido Aprovado! Emitindo cupom térmico não fiscal...');
        setOrders((prev) => prev.filter((o) => o.id !== order.id));

        // Disparar Impressão Térmica Imediata
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
      } else {
        toast.error(data.error || 'Erro ao aprovar pedido.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setProcessingId(null);
    }
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
        toast.info('Pedido recusado e estoque devolvido com sucesso.');
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

  const pendingCount = orders.length;

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
              Fila de Pedidos da Loja Virtual (PDV)
            </DialogTitle>
            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-bold text-xs">
              Estoque Sequestrado
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Pedidos feitos no site aguardando aprovação do dono para faturamento e emissão do cupom térmico.
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

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-sm space-y-3"
                >
                  {/* Cabeçalho do Pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-gray-900">
                          {order.customer_name || 'Cliente da Loja'}
                        </span>
                        <Badge className="bg-amber-500 text-black text-[10px] font-black">
                          Aguardando Aprovação
                        </Badge>
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
                            <span>Abrir WhatsApp</span>
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
                        Endereço de Entrega (Manaus / AM):
                      </p>
                      <p className="text-[11px]">
                        {order.delivery_address.street}, Nº {order.delivery_address.number || 'S/N'} • Bairro: {order.delivery_address.neighborhood || '—'}
                      </p>
                      {order.delivery_address.complement && (
                        <p className="text-[10px] text-gray-500">Compl: {order.delivery_address.complement}</p>
                      )}
                      {order.delivery_address.reference && (
                        <p className="text-[10px] text-gray-500">Ref: {order.delivery_address.reference}</p>
                      )}
                    </div>
                  )}

                  {/* Lista de Itens do Pedido */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-gray-700">Calçados Sequestrados do Estoque:</p>
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
                  </div>

                  {/* Resumo de Valores */}
                  <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-2">
                    <div>
                      <span>Subtotal: {formatMoney(order.subtotal_cents)}</span>
                      {order.delivery_fee_cents > 0 && (
                        <span className="ml-3 font-semibold text-blue-700">
                          + Taxa de Entrega: {formatMoney(order.delivery_fee_cents)}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-gray-800">
                      Pagamento: {order.payments?.[0]?.method?.toUpperCase() || 'PIX'}
                    </span>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApproveOrder(order)}
                      className="flex-1 bg-black text-white hover:bg-zinc-800 py-3 text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Printer className="h-4 w-4 text-amber-400" />
                      <span>{isProcessing ? 'Processando...' : 'Aprovar Pedido & Imprimir Cupom Térmico'}</span>
                    </Button>

                    <Button
                      type="button"
                      disabled={isProcessing}
                      variant="outline"
                      onClick={() => handleRejectOrder(order.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-bold"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
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
