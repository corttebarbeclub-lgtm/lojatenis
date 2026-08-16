'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSeller } from '@/app/dashboard/vendedores/actions';

export function NewSellerDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState('');
  const [commission, setCommission] = useState('0');

  function reset() {
    setFullName('');
    setCommission('0');
  }

  function handleSubmit() {
    const commissionValue = Number(commission.replace(',', '.'));
    startTransition(async () => {
      const result = await createSeller({
        fullName,
        commissionPercent: Number.isFinite(commissionValue) ? commissionValue : 0,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Vendedor cadastrado.');
      reset();
      setOpen(false);
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
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Novo vendedor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo vendedor</DialogTitle>
          <DialogDescription>Cadastre um vendedor para associar às vendas do PDV.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Comissão (%)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending || fullName.trim().length < 2}>
            {isPending ? 'Salvando...' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
