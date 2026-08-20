'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  PackageSearch,
  Truck,
  Ship,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Bike,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

/* ======= TYPES ======= */
interface FulfillmentOrder {
  id: string;
  status: string;
  order_source: string;
  fulfillment_status: string;
  subtotal_cents: number;
  total_cents: number;
  delivery_fee_cents: number | null;
  delivery_address: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  sale_items: {
    id: string;
    quantity: number;
    unit_price_cents: number;
    total_cents: number;
    variant: {
      id: string;
      size: string;
      color: string;
      product: { id: string; name: string };
    };
  }[];
  payments: {
    id: string;
    method: string;
    amount_cents: number;
  }[];
}

/* ======= CONSTANTS ======= */
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType; bg: string; border: string }
> = {
  separating: {
    label: 'Em Separação',
    color: 'text-amber-700',
    icon: PackageSearch,
    bg: 'bg-amber-50',
    border: 'border-amber-300',
  },
  in_transit: {
    label: 'Em Trânsito',
    color: 'text-blue-700',
    icon: Truck,
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  shipped_moto: {
    label: 'Enviado Uber/Mototáxi',
    color: 'text-violet-700',
    icon: Bike,
    bg: 'bg-violet-50',
    border: 'border-violet-300',
  },
  shipped_boat: {
    label: 'Enviado pelo Barco',
    color: 'text-cyan-700',
    icon: Ship,
    bg: 'bg-cyan-50',
    border: 'border-cyan-300',
  },
  delivered: {
    label: 'Entregue',
    color: 'text-emerald-700',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-red-700',
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-300',
  },
};

const FILTER_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'separating', label: '📦 Em Separação' },
  { key: 'in_transit', label: '🚛 Em Trânsito' },
  { key: 'shipped_moto', label: '🏍️ Moto/Uber' },
  { key: 'shipped_boat', label: '🚢 Barco' },
  { key: 'delivered', label: '✅ Entregues' },
  { key: 'cancelled', label: '❌ Cancelados' },
];

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function paymentLabel(method: string) {
  const map: Record<string, string> = {
    pix: 'PIX',
    credit_card: 'Cartão Crédito',
    debit_card: 'Cartão Débito',
    cash: 'Dinheiro',
    boleto: 'Boleto',
  };
  return map[method] || method;
}

/* ======= COMPONENT ======= */
export function FulfillmentManagerClient({ tenantId }: { tenantId?: string }) {
  const [orders, setOrders] = useState<FulfillmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/fulfillment?tenant_id=${tenantId || ''}&status=${activeTab}`
      );
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch {
      toast.error('Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  }, [tenantId, activeTab]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleUpdateStatus(saleId: string, action: string) {
    try {
      const res = await fetch('/api/admin/fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        loadOrders();
      } else {
        toast.error(data.error || 'Erro ao atualizar status.');
      }
    } catch {
      toast.error('Erro de conexão.');
    }
  }

  function openCancelDialog(saleId: string) {
    setCancelTargetId(saleId);
    setAdminPassword('');
    setCancelDialogOpen(true);
  }

  async function handleConfirmCancel() {
    if (!cancelTargetId || !adminPassword) return;

    setCancelling(true);
    try {
      const res = await fetch('/api/admin/fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleId: cancelTargetId,
          action: 'cancel',
          adminPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('🔄 ' + data.message);
        setCancelDialogOpen(false);
        loadOrders();
      } else {
        toast.error(data.error || 'Senha incorreta ou erro ao cancelar.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setCancelling(false);
    }
  }

  // Counts per status
  const counts: Record<string, number> = {};
  for (const tab of FILTER_TABS) {
    if (tab.key === 'all') {
      counts.all = orders.length;
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2">
          <PackageSearch className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Gestão de Pedidos & Envios
          </h1>
          {loading && (
            <Badge
              variant="outline"
              className="text-[10px] text-amber-600 bg-amber-50 border-amber-200 animate-pulse"
            >
              Carregando...
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Acompanhe a separação, trânsito e entrega de todos os pedidos que vieram do site. Cancele
          apenas com a senha mestre do Dono.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-black text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-bold">Carregando pedidos...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageSearch className="h-12 w-12 text-gray-200 mb-3" />
          <h3 className="text-base font-bold text-gray-700">
            Nenhum pedido encontrado nesta categoria
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Os pedidos do site aparecerão aqui assim que forem aprovados no PDV.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.fulfillment_status] || STATUS_CONFIG.separating;
            const StatusIcon = config.icon;
            const isExpanded = expandedOrderId === order.id;
            const isCancelled = order.fulfillment_status === 'cancelled';
            const isDelivered = order.fulfillment_status === 'delivered';

            return (
              <div
                key={order.id}
                className={`rounded-2xl border ${config.border} ${config.bg} p-4 shadow-sm transition-all`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} border ${config.border} flex-shrink-0`}
                    >
                      <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-gray-900 truncate">
                          {order.customer_name || 'Cliente sem nome'}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-black ${config.color} ${config.bg} ${config.border}`}
                        >
                          {config.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="font-black text-gray-900">
                          {formatPrice(order.total_cents)}
                        </span>
                        <span>
                          {order.sale_items.reduce((s, i) => s + i.quantity, 0)} par(es)
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedOrderId(isExpanded ? null : order.id)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/60 text-gray-400 flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-gray-200/60 space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {order.customer_phone && (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-bold">{order.customer_phone}</span>
                        </div>
                      )}
                      {order.customer_email && (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-bold">{order.customer_email}</span>
                        </div>
                      )}
                      {order.delivery_address && (
                        <div className="flex items-center gap-1.5 text-gray-700 sm:col-span-3">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-bold">{order.delivery_address}</span>
                        </div>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="rounded-xl bg-white border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                      {order.sale_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-3.5 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-gray-900 truncate">
                              {item.variant?.product?.name || 'Produto'}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Cor: {item.variant?.color} • Tam: {item.variant?.size}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <p className="text-xs font-black text-gray-900">
                              {item.quantity}x {formatPrice(item.unit_price_cents)}
                            </p>
                            <p className="text-[11px] font-bold text-gray-500">
                              {formatPrice(item.total_cents)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Payment & Delivery Fee */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span className="font-bold">
                          Pagamento:{' '}
                          {order.payments.map((p) => paymentLabel(p.method)).join(', ') ||
                            'Não informado'}
                        </span>
                      </div>
                      {(order.delivery_fee_cents ?? 0) > 0 && (
                        <span className="font-bold text-gray-600">
                          Frete: {formatPrice(order.delivery_fee_cents!)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {!isCancelled && !isDelivered && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/60">
                        {order.fulfillment_status === 'separating' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'shipped_moto')}
                              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl"
                            >
                              <Bike className="h-3.5 w-3.5 mr-1" />
                              Enviar Uber/Mototáxi
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'shipped_boat')}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl"
                            >
                              <Ship className="h-3.5 w-3.5 mr-1" />
                              Enviar pelo Barco
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(order.id, 'in_transit')}
                              className="text-xs font-bold rounded-xl"
                            >
                              <Truck className="h-3.5 w-3.5 mr-1" />
                              Marcar Em Trânsito
                            </Button>
                          </>
                        )}

                        {order.fulfillment_status === 'in_transit' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'shipped_moto')}
                              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl"
                            >
                              <Bike className="h-3.5 w-3.5 mr-1" />
                              Enviado Uber/Mototáxi
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'shipped_boat')}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl"
                            >
                              <Ship className="h-3.5 w-3.5 mr-1" />
                              Enviado pelo Barco
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Marcar como Entregue
                            </Button>
                          </>
                        )}

                        {(order.fulfillment_status === 'shipped_moto' ||
                          order.fulfillment_status === 'shipped_boat') && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Confirmar Entrega ao Cliente
                          </Button>
                        )}

                        {/* Botão de Cancelamento (exige senha mestre) */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCancelDialog(order.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold rounded-xl ml-auto"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                          Cancelar Pedido
                        </Button>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="flex items-center gap-2 rounded-xl bg-red-100 border border-red-200 p-3 text-xs font-bold text-red-800">
                        <XCircle className="h-4 w-4 flex-shrink-0" />
                        <span>
                          Pedido cancelado. Itens devolvidos ao estoque central automaticamente.
                        </span>
                      </div>
                    )}

                    {isDelivered && (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-100 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span>
                          Pedido entregue com sucesso ao cliente!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog (Master Password) */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 border border-red-200">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-gray-900">
                  Cancelar Pedido & Devolver Estoque
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Esta ação requer a senha mestre do Dono da loja.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Atenção: Ao cancelar este pedido:</p>
                <ul className="mt-1 space-y-0.5 list-disc pl-4">
                  <li>Os tênis reservados serão <strong>devolvidos ao estoque central</strong>.</li>
                  <li>Os produtos voltarão a aparecer como <strong>disponíveis</strong> no site.</li>
                  <li>O pedido será marcado como <strong>cancelado</strong> permanentemente.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                Senha Mestre do Dono:
              </label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Digite a senha mestre para autorizar..."
                className="rounded-xl"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Voltar
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={!adminPassword.trim() || cancelling}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                  Confirmar Cancelamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
