'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerCashMovement } from '@/app/dashboard/pdv/actions';
import { enqueueOperation } from '@/lib/offline/db';

function inputToCents(value: string) {
  const n = Number(value.replace(',', '.'));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

const LABELS = {
  withdrawal: { title: 'Sangria', description: 'Retirada de dinheiro do caixa.' },
  reinforcement: { title: 'Suprimento', description: 'Entrada extra de dinheiro no caixa.' },
};

export function CashMovementDialog({
  cashRegisterId,
  type,
  isOnline,
  onOpenChange,
}: {
  cashRegisterId: string;
  type: 'withdrawal' | 'reinforcement' | null;
  isOnline: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  function handleSubmit() {
    if (!type) return;
    const cents = inputToCents(amount);
    if (cents <= 0) {
      toast.error('Informe um valor maior que zero.');
      return;
    }

    if (!isOnline) {
      startTransition(async () => {
        await enqueueOperation({
          clientOperationId: crypto.randomUUID(),
          type: 'CASH_MOVEMENT_CREATED',
          createdAt: new Date().toISOString(),
          payload: { cashRegisterId, type, amountCents: cents, reason: reason || null },
        });
        toast.success(`${LABELS[type].title} registrada offline — será sincronizada quando a conexão voltar.`);
        setAmount('');
        setReason('');
        onOpenChange(false);
      });
      return;
    }

    startTransition(async () => {
      const result = await registerCashMovement({
        cashRegisterId,
        type,
        amountCents: cents,
        reason: reason || undefined,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${LABELS[type].title} registrada.`);
      setAmount('');
      setReason('');
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={type !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {type && (
          <>
            <DialogHeader>
              <DialogTitle>{LABELS[type].title}</DialogTitle>
              <DialogDescription>{LABELS[type].description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Motivo (opcional)</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? 'Salvando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
