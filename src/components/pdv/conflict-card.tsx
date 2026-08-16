'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveSyncConflict } from '@/app/dashboard/pdv/conflitos/actions';
import type { SyncConflict } from '@/types/database';

const TYPE_LABELS: Record<string, string> = {
  sale: 'Venda',
  cash_movement: 'Movimentação de caixa',
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function ConflictCard({
  conflict,
  readOnly = false,
}: {
  conflict: SyncConflict;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState('');

  function handleResolve() {
    startTransition(async () => {
      const result = await resolveSyncConflict(conflict.id, note);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Conflito marcado como resolvido.');
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{TYPE_LABELS[conflict.operation_type] ?? conflict.operation_type}</CardTitle>
          <Badge variant={conflict.status === 'pending' ? 'destructive' : 'secondary'}>
            {conflict.status === 'pending' ? 'Pendente' : 'Resolvido'}
          </Badge>
        </div>
        <CardDescription>
          {formatDateTime(conflict.created_at)} · {conflict.error_message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(conflict.payload, null, 2)}
        </pre>

        {readOnly ? (
          conflict.resolution_note && (
            <p className="text-sm text-muted-foreground">Nota: {conflict.resolution_note}</p>
          )
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Nota de resolução (opcional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button onClick={handleResolve} disabled={isPending}>
              {isPending ? 'Salvando...' : 'Marcar como resolvido'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
