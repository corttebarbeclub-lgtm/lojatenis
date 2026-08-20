'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CashMovementDialog } from './cash-movement-dialog';
import { CloseRegisterDialog } from './close-register-dialog';
import { WholesaleAlertsDialog } from './wholesale-alerts-dialog';
import { OnlineOrdersQueueDialog } from './online-orders-queue-dialog';
import { QuickMobileSneakerModal } from '@/components/products/quick-mobile-sneaker-modal';
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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/40 p-3 sm:px-4 sm:py-3 shadow-xs">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Badge variant="default" className="bg-emerald-600 font-bold text-xs">
          Caixa Aberto
        </Badge>
        <span className="text-xs text-muted-foreground">
          desde {formatTime(cashRegister.opened_at)} · Saldo: <strong className="text-foreground">{formatPrice(cashRegister.opening_balance_cents)}</strong>
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Botão Rápido de Cadastrar Novo Tênis direto no Caixa */}
        <QuickMobileSneakerModal />

        {/* Fila de Pedidos da Loja Virtual (com emissão de cupom térmico) */}
        <OnlineOrdersQueueDialog tenantId={cashRegister.tenant_id} />

        {/* Alertas e Gestão de Atacadistas B2B */}
        <WholesaleAlertsDialog tenantId={cashRegister.tenant_id} />

        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => setMovementDialog('reinforcement')}>
          Suprimento
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => setMovementDialog('withdrawal')}>
          Sangria
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 text-xs font-semibold"
          disabled={!isOnline}
          title={!isOnline ? 'Fechar caixa exige conexão com a internet.' : undefined}
          onClick={() => setCloseDialogOpen(true)}
        >
          Fechar Caixa
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
