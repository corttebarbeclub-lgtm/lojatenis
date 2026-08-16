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
import { closeCashRegister } from '@/app/dashboard/pdv/actions';

function inputToCents(value: string) {
  const n = Number(value.replace(',', '.'));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CloseRegisterDialog({
  cashRegisterId,
  open,
  onOpenChange,
}: {
  cashRegisterId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<{ expected: number; informed: number; diff: number } | null>(null);

  function handleSubmit() {
    const cents = inputToCents(amount);

    startTransition(async () => {
      const res = await closeCashRegister({ cashRegisterId, closingBalanceCents: cents });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const expected = res.cashRegister.expected_balance_cents ?? 0;
      setResult({ expected, informed: cents, diff: cents - expected });
    });
  }

  function handleClose() {
    setAmount('');
    setResult(null);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fechar caixa</DialogTitle>
          <DialogDescription>Conte o dinheiro em caixa e informe o valor real.</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo esperado</span>
              <span className="font-mono">{formatPrice(result.expected)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo informado</span>
              <span className="font-mono">{formatPrice(result.informed)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Diferença</span>
              <span className={`font-mono ${result.diff !== 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                {formatPrice(result.diff)}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Saldo contado (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={handleClose}>Concluir</Button>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? 'Fechando...' : 'Fechar caixa'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
