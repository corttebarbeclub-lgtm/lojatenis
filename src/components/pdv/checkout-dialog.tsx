'use client';

import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
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
  cart,
  subtotalCents,
  customers,
  sellers,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cashRegisterId: string;
  cart: CartItem[];
  subtotalCents: number;
  customers: Pick<Customer, 'id' | 'full_name'>[];
  sellers: Pick<Seller, 'id' | 'full_name'>[];
  onComplete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [discount, setDiscount] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([{ method: 'cash', amount: '' }]);

  const discountCents = inputToCents(discount);
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
      { method: 'cash', amount: remainingCents > 0 ? (remainingCents / 100).toFixed(2) : '' },
    ]);
  }

  function removePayment(index: number) {
    setPaymentEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setDiscount('');
    setCustomerId('');
    setSellerId('');
    setPaymentEntries([{ method: 'cash', amount: '' }]);
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

    startTransition(async () => {
      const result = await createSale({
        cashRegisterId,
        items: cart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
        })),
        payments: paymentEntries.map((p) => ({ method: p.method, amountCents: inputToCents(p.amount) })),
        discountCents,
        customerId: customerId || null,
        sellerId: sellerId || null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Venda registrada.');
      reset();
      onComplete();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Finalizar venda</DialogTitle>
          <DialogDescription>{cart.length} item(ns) — subtotal {formatPrice(subtotalCents)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cliente (opcional)</Label>
              <Select value={customerId || ''} onValueChange={setCustomerId} key={customers.length}>
                <SelectTrigger>
                  <SelectValue placeholder="Não informado" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vendedor (opcional)</Label>
              <Select value={sellerId || ''} onValueChange={setSellerId} key={sellers.length}>
                <SelectTrigger>
                  <SelectValue placeholder="Não informado" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Desconto (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Pagamentos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPayment}>
                <Plus className="mr-1 h-3 w-3" />
                Adicionar
              </Button>
            </div>
            {paymentEntries.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={entry.method}
                  onValueChange={(v) => updatePayment(index, { method: v as PaymentMethod })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={entry.amount}
                  onChange={(e) => updatePayment(index, { amount: e.target.value })}
                />
                {paymentEntries.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-medium">{formatPrice(totalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pago</span>
              <span className="font-mono">{formatPrice(paidCents)}</span>
            </div>
            {remainingCents !== 0 && (
              <div className="flex justify-between text-destructive">
                <span>{remainingCents > 0 ? 'Falta' : 'Excedente'}</span>
                <span className="font-mono">{formatPrice(Math.abs(remainingCents))}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={isPending} className="w-full">
            {isPending ? 'Registrando...' : 'Confirmar venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
