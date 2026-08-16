'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ConnectionStatus } from '@/lib/offline/use-connection-status';

export function ConnectionIndicator({
  status,
  queueLength,
}: {
  status: ConnectionStatus;
  queueLength: number;
}) {
  if (status === 'syncing') {
    return (
      <Badge variant="secondary" className="gap-1">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Sincronizando
      </Badge>
    );
  }

  if (status === 'offline') {
    return (
      <Badge variant="destructive" className="gap-1">
        <WifiOff className="h-3 w-3" />
        Offline{queueLength > 0 ? ` · ${queueLength} pendente(s)` : ''}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1 text-emerald-700">
      <Wifi className="h-3 w-3" />
      Online
    </Badge>
  );
}
