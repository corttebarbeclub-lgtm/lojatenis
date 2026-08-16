'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { openCashRegister } from '@/app/dashboard/pdv/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function inputToCents(value: string) {
  const n = Number(value.replace(',', '.'));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

export function OpenRegisterForm({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState('');

  function handleOpen() {
    startTransition(async () => {
      const result = await openCashRegister({ storeId, openingBalanceCents: inputToCents(amount) });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Caixa aberto.');
      router.refresh();
    });
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Abrir caixa</CardTitle>
        <CardDescription>Informe o saldo inicial em dinheiro para começar a vender.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="opening">Saldo inicial (R$)</Label>
          <Input
            id="opening"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={handleOpen} disabled={isPending}>
          {isPending ? 'Abrindo...' : 'Abrir caixa'}
        </Button>
      </CardContent>
    </Card>
  );
}
