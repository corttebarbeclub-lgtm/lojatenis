'use client';

import { useEffect, useState, useCallback } from 'react';
import { getQueueLength } from './db';
import { syncQueue } from './sync-engine';

export type ConnectionStatus = 'online' | 'offline' | 'syncing';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [queueLength, setQueueLength] = useState(0);

  const refreshQueueLength = useCallback(async () => {
    setQueueLength(await getQueueLength());
  }, []);

  const runSync = useCallback(async () => {
    setStatus('syncing');
    await syncQueue();
    await refreshQueueLength();
    setStatus(navigator.onLine ? 'online' : 'offline');
  }, [refreshQueueLength]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setStatus(navigator.onLine ? 'online' : 'offline');
    refreshQueueLength();

    function handleOnline() {
      setIsOnline(true);
      runSync();
    }
    function handleOffline() {
      setIsOnline(false);
      setStatus('offline');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Rede de segurança: o evento 'online' do navegador é o caminho normal,
    // mas nem toda troca de rede o dispara de forma confiável (ex: Wi-Fi
    // trocando de ponto de acesso sem período de desconexão detectável).
    // Um heartbeat leve garante que a fila não fique presa indefinidamente.
    const heartbeat = setInterval(() => {
      if (navigator.onLine) handleOnline();
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(heartbeat);
    };
  }, [runSync, refreshQueueLength]);

  return { isOnline, status, queueLength, refreshQueueLength, runSync };
}
