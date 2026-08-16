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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerMovement, setMinQuantity } from '@/app/dashboard/estoque/actions';
import type { InventoryMovementType } from '@/types/database';

export function MovementDialog({
  variantId,
  productName,
  color,
  size,
  currentQuantity,
  currentMinQuantity,
  trigger,
}: {
  variantId: string;
  productName: string;
  color: string;
  size: string;
  currentQuantity: number;
  currentMinQuantity: number;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<InventoryMovementType | 'min'>('entry');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [minValue, setMinValue] = useState(String(currentMinQuantity));
  const [adjustmentSign, setAdjustmentSign] = useState<1 | -1>(1);

  function reset() {
    setAmount('');
    setReason('');
    setTab('entry');
  }

  function handleSubmit() {
    if (tab === 'min') {
      const parsed = Number(minValue);
      if (!Number.isFinite(parsed) || parsed < 0) {
        toast.error('Informe um estoque mínimo válido.');
        return;
      }
      startTransition(async () => {
        const result = await setMinQuantity({ variantId, minQuantity: parsed });
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success('Estoque mínimo atualizado.');
        setOpen(false);
        router.refresh();
      });
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
      toast.error('Informe uma quantidade válida.');
      return;
    }
    if (tab !== 'count' && parsedAmount < 0) {
      toast.error('Informe a quantidade em valor positivo.');
      return;
    }
    if (tab === 'count' && parsedAmount < 0) {
      toast.error('O saldo contado não pode ser negativo.');
      return;
    }

    startTransition(async () => {
      const result = await registerMovement({
        variantId,
        type: tab as InventoryMovementType,
        quantity: tab === 'adjustment' ? adjustmentSign * parsedAmount : parsedAmount,
        reason: reason || undefined,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Movimentação registrada.');
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {productName} — {color} {size}
          </DialogTitle>
          <DialogDescription>Saldo atual: {currentQuantity}</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="entry">Entrada</TabsTrigger>
            <TabsTrigger value="adjustment">Ajuste</TabsTrigger>
            <TabsTrigger value="count">Contagem</TabsTrigger>
            <TabsTrigger value="min">Mínimo</TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="space-y-3">
            <div className="space-y-2">
              <Label>Quantidade recebida</Label>
              <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: nota fiscal 1234" />
            </div>
          </TabsContent>

          <TabsContent value="adjustment" className="space-y-3">
            <div className="space-y-2">
              <Label>Tipo de ajuste</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={adjustmentSign === 1 ? 'default' : 'outline'}
                  onClick={() => setAdjustmentSign(1)}
                >
                  Adicionar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={adjustmentSign === -1 ? 'default' : 'outline'}
                  onClick={() => setAdjustmentSign(-1)}
                >
                  Remover
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: perda, avaria, erro de cadastro" />
            </div>
          </TabsContent>

          <TabsContent value="count" className="space-y-3">
            <div className="space-y-2">
              <Label>Saldo real contado</Label>
              <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: inventário mensal" />
            </div>
          </TabsContent>

          <TabsContent value="min" className="space-y-3">
            <div className="space-y-2">
              <Label>Estoque mínimo desta variação</Label>
              <Input type="number" min={0} value={minValue} onChange={(e) => setMinValue(e.target.value)} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
