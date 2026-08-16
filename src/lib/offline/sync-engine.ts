import { getQueuedOperations, removeQueuedOperation, type QueuedOperation } from './db';
import { createSale, registerCashMovement } from '@/app/dashboard/pdv/actions';

export type SyncStatus = 'idle' | 'syncing' | 'done';

interface SyncResult {
  succeeded: number;
  conflicted: number;
}

/**
 * Drena a fila local em ordem de criação, chamando as mesmas Server
 * Actions do fluxo online. Cada operação carrega o clientOperationId
 * gerado no momento em que foi enfileirada — o servidor usa isso para
 * nunca duplicar caso a mesma operação seja reenviada (retry de rede
 * durante a própria sincronização).
 *
 * Um erro de negócio (ex: estoque insuficiente) não interrompe o
 * processamento das operações seguintes — a operação problemática vira
 * um conflito registrado no servidor (tabela sync_conflicts) e some da
 * fila local, porque já foi "tratada" (não fica reenviando para sempre).
 */
export async function syncQueue(onProgress?: (result: SyncResult) => void): Promise<SyncResult> {
  const operations = await getQueuedOperations();
  let succeeded = 0;
  let conflicted = 0;

  for (const operation of operations) {
    const ok = await syncOperation(operation);
    if (ok) succeeded++;
    else conflicted++;

    await removeQueuedOperation(operation.clientOperationId);
    onProgress?.({ succeeded, conflicted });
  }

  return { succeeded, conflicted };
}

async function syncOperation(operation: QueuedOperation): Promise<boolean> {
  if (operation.type === 'SALE_CREATED') {
    const result = await createSale({
      cashRegisterId: operation.payload.cashRegisterId,
      items: operation.payload.items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
      })),
      payments: operation.payload.payments,
      discountCents: operation.payload.discountCents,
      customerId: operation.payload.customerId,
      sellerId: operation.payload.sellerId,
      clientOperationId: operation.clientOperationId,
    });
    return !result.error;
  }

  const result = await registerCashMovement({
    cashRegisterId: operation.payload.cashRegisterId,
    type: operation.payload.type,
    amountCents: operation.payload.amountCents,
    reason: operation.payload.reason ?? undefined,
    clientOperationId: operation.clientOperationId,
  });
  return !result.error;
}
