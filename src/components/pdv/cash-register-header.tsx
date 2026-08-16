'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CashMovementDialog } from './cash-movement-dialog';
import { CloseRegisterDialog } from './close-register-dialog';
import type { CashRegister } from '@/types/database';

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function CashRegisterHeader({
  cashRegister,
  isOnline,
}: {
  cashRegister: CashRegister;
  isOnline: boolean;
}) {
  const [movementDialog, setMovementDialog] = useState<'withdrawal' | 'reinforcement' | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <Badge variant="default">Caixa aberto</Badge>
        <span className="text-sm text-muted-foreground">
          desde {formatTime(cashRegister.opened_at)} · saldo inicial {formatPrice(cashRegister.opening_balance_cents)}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setMovementDialog('reinforcement')}>
          Suprimento
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMovementDialog('withdrawal')}>
          Sangria
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={!isOnline}
          title={!isOnline ? 'Fechar caixa exige conexão com a internet.' : undefined}
          onClick={() => setCloseDialogOpen(true)}
        >
          Fechar caixa
        </Button>
      </div>

      <CashMovementDialog
        cashRegisterId={cashRegister.id}
        type={movementDialog}
        isOnline={isOnline}
        onOpenChange={(open) => !open && setMovementDialog(null)}
      />
      <CloseRegisterDialog
        cashRegisterId={cashRegister.id}
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
      />
    </div>
  );
}
