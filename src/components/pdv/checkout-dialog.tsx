'use client';

import { useMemo, useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, ShieldCheck, Tag, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createSale } from '@/app/dashboard/pdv/actions';
import { enqueueOperation } from '@/lib/offline/db';
import { AdminDiscountDialog } from './admin-discount-dialog';
import { QuickCustomerModal } from './quick-customer-modal';
import { printThermalReceipt, type ThermalReceiptData } from '@/components/receipt/thermal-receipt';
import type { CartItem } from './pdv-client';
import type { Customer, PaymentMethod, Seller } from '@/types/database';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  card: 'Cartão',
};

function inputToCents(value: string) {
  const n = Number(value.replace(',', '.'));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface PaymentEntry {
  method: PaymentMethod;
  amount: string;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  cashRegisterId,
  tenantId,
  cart,
  subtotalCents,
  initialDiscountCents = 0,
  customers: initialCustomers,
  sellers,
  isOnline = true,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cashRegisterId: string;
  tenantId?: string;
  cart: CartItem[];
  subtotalCents: number;
  initialDiscountCents?: number;
  customers: Pick<Customer, 'id' | 'full_name'>[];
  sellers: Pick<Seller, 'id' | 'full_name'>[];
  isOnline?: boolean;
  onSuccess: (soldItems: CartItem[]) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [customersList, setCustomersList] = useState<Pick<Customer, 'id' | 'full_name'>[]>(initialCustomers);
  const [discountCents, setDiscountCents] = useState<number>(initialDiscountCents);
  const [discountDescription, setDiscountDescription] = useState<string>('');
  const [customerId, setCustomerId] = useState('');
  
  // Vendedor padrão: quem abriu o caixa / Dono
  const [sellerId, setSellerId] = useState<string>('');
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([{ method: 'pix', amount: '' }]);

  useEffect(() => {
    setCustomersList(initialCustomers);
  }, [initialCustomers]);

  useEffect(() => {
    setDiscountCents(initialDiscountCents);
  }, [initialDiscountCents]);

  // Pré-selecionar vendedor se houver apenas 1 ou primeiro ativo (quem abriu o caixa)
  useEffect(() => {
    if (!sellerId && sellers.length > 0) {
      setSellerId(sellers[0].id);
    }
  }, [sellers, sellerId]);

  // Se o modal for aberto, inicializar valor a pagar
  useEffect(() => {
    if (open && paymentEntries.length === 1 && !paymentEntries[0].amount) {
      const net = Math.max(0, subtotalCents - discountCents);
      setPaymentEntries([{ method: 'pix', amount: (net / 100).toFixed(2) }]);
    }
  }, [open, subtotalCents, discountCents, paymentEntries]);

  const totalCents = Math.max(0, subtotalCents - discountCents);
  const paidCents = useMemo(
    () => paymentEntries.reduce((sum, p) => sum + inputToCents(p.amount), 0),
    [paymentEntries]
  );
  const remainingCents = totalCents - paidCents;

  function updatePayment(index: number, patch: Partial<PaymentEntry>) {
    setPaymentEntries((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function addPayment() {
    setPaymentEntries((prev) => [
      ...prev,
      { method: 'pix', amount: remainingCents > 0 ? (remainingCents / 100).toFixed(2) : '' },
    ]);
  }

  function removePayment(index: number) {
    setPaymentEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setDiscountCents(0);
    setDiscountDescription('');
    setCustomerId('');
    setPaymentEntries([{ method: 'pix', amount: '' }]);
  }

  function handleConfirm() {
    if (remainingCents !== 0) {
      toast.error(
        remainingCents > 0
          ? `Falta ${formatPrice(remainingCents)} para completar o pagamento.`
          : `Pagamentos excedem o total em ${formatPrice(-remainingCents)}.`
      );
      return;
    }

    const items = cart.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    }));
    const payments = paymentEntries.map((p) => ({ method: p.method, amountCents: inputToCents(p.amount) }));

    if (!isOnline) {
      startTransition(async () => {
        await enqueueOperation({
          clientOperationId: crypto.randomUUID(),
          type: 'SALE_CREATED',
          createdAt: new Date().toISOString(),
          payload: {
            cashRegisterId,
            items,
            payments,
            discountCents,
            customerId: customerId || null,
            sellerId: sellerId || null,
          },
        });
        toast.success('Venda registrada offline — será sincronizada quando a conexão voltar.');
        reset();
        onSuccess(cart);
      });
      return;
    }

    startTransition(async () => {
      const result = await createSale({
        cashRegisterId,
        items,
        payments,
        discountCents,
        customerId: customerId || null,
        sellerId: sellerId || null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('🎉 Venda registrada com sucesso e estoque atualizado!');

      // Imprimir Cupom Térmico Não Fiscal
      const receiptData: ThermalReceiptData = {
        orderNumber: result.sale?.id || crypto.randomUUID(),
        orderSource: 'pdv',
        createdAt: new Date().toISOString(),
        customerName: customersList.find((c) => c.id === customerId)?.full_name || 'Consumidor Final',
        subtotalCents: subtotalCents,
        discountCents: discountCents,
        discountDescription: discountDescription,
        totalCents: totalCents,
        items: cart.map((item) => ({
          productName: item.productName,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          totalCents: item.unitPriceCents * item.quantity,
        })),
        payments: paymentEntries.map((p) => ({
          method: p.method,
          amountCents: inputToCents(p.amount),
        })),
      };

      printThermalReceipt(receiptData);

      reset();
      onSuccess(cart);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-5 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-black text-gray-900">
            Finalizar Venda do Caixa
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            {cart.length} item(ns) no carrinho • Subtotal bruto: <strong>{formatPrice(subtotalCents)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Seleção de Cliente (com botão + Novo Cliente) e Vendedor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-700">Cliente (opcional)</Label>
                <QuickCustomerModal
                  tenantId={tenantId}
                  onCustomerCreated={(newCust) => {
                    setCustomersList((prev) => [newCust, ...prev]);
                    setCustomerId(newCust.id);
                  }}
                />
              </div>
              <Select value={customerId || ''} onValueChange={setCustomerId} key={customersList.length}>
                <SelectTrigger className="rounded-xl border-gray-300 text-xs">
                  <SelectValue placeholder="Balcão / Não identificado" />
                </SelectTrigger>
                <SelectContent>
                  {customersList.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-700">Vendedor Responsável</Label>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                  <UserCheck className="h-3 w-3" /> Caixa Aberto
                </span>
              </div>
              <Select value={sellerId || ''} onValueChange={setSellerId} key={sellers.length}>
                <SelectTrigger className="rounded-xl border-gray-300 text-xs font-bold">
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-semibold">
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SEÇÃO DE DESCONTO EXCLUSIVO DO DONO */}
          <div className="space-y-1.5 rounded-2xl bg-amber-50/50 p-3.5 border border-amber-200">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                Desconto Comercial (Senha do Dono)
              </Label>
              {discountCents > 0 && (
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {discountDescription || `-${formatPrice(discountCents)}`}
                </span>
              )}
            </div>

            <AdminDiscountDialog
              subtotalCents={subtotalCents}
              tenantId={tenantId}
              appliedDiscountCents={discountCents}
              onApplyDiscount={(cents, desc) => {
                setDiscountCents(cents);
                if (desc) setDiscountDescription(desc);
                // Preencher valor pago automaticamente
                const newTotal = Math.max(0, subtotalCents - cents);
                setPaymentEntries([{ method: 'pix', amount: (newTotal / 100).toFixed(2) }]);
              }}
              onRemoveDiscount={() => {
                setDiscountCents(0);
                setDiscountDescription('');
                setPaymentEntries([{ method: 'pix', amount: (subtotalCents / 100).toFixed(2) }]);
              }}
            />
          </div>

          {/* Formas de Pagamento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-700">Formas de Pagamento</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPayment}
                className="h-7 text-xs font-bold rounded-lg"
              >
                <Plus className="mr-1 h-3 w-3" />
                Dividir Pagamento
              </Button>
            </div>

            <div className="space-y-2">
              {paymentEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={entry.method}
                    onValueChange={(v) => updatePayment(index, { method: v as PaymentMethod })}
                  >
                    <SelectTrigger className="w-36 rounded-xl border-gray-300 text-xs font-bold bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-xs font-semibold">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative flex-1">
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={entry.amount}
                      onChange={(e) => updatePayment(index, { amount: e.target.value })}
                      className="rounded-xl border-gray-300 text-xs font-black pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      R$
                    </span>
                  </div>

                  {paymentEntries.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removePayment(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Financeiro da Cobrança */}
          <div className="space-y-1.5 rounded-2xl bg-zinc-50 p-3.5 border border-zinc-200 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal Bruto:</span>
              <span className="font-semibold">{formatPrice(subtotalCents)}</span>
            </div>

            {discountCents > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Desconto Autorizado pelo Dono:</span>
                <span>- {formatPrice(discountCents)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-base font-black text-gray-900 border-t pt-2">
              <span>Total a Cobrar:</span>
              <span className="text-lg text-amber-600 font-mono">{formatPrice(totalCents)}</span>
            </div>

            <div className="flex justify-between text-gray-600 pt-1">
              <span>Total Informado / Pago:</span>
              <span className="font-mono font-bold">{formatPrice(paidCents)}</span>
            </div>

            {remainingCents !== 0 && (
              <div
                className={`flex justify-between font-black pt-1 ${
                  remainingCents > 0 ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                <span>{remainingCents > 0 ? 'Falta Pagar:' : 'Troco:'}</span>
                <span className="font-mono">{formatPrice(Math.abs(remainingCents))}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            onClick={handleConfirm}
            disabled={isPending || remainingCents !== 0}
            className="w-full bg-black text-white hover:bg-zinc-800 py-6 text-sm font-black shadow-lg"
          >
            {isPending ? 'Gravando e Baixando Estoque...' : 'Confirmar Venda & Emitir Recibo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
