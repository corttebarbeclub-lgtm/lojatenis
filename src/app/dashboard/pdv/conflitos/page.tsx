import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConflictCard } from '@/components/pdv/conflict-card';
import type { SyncConflict } from '@/types/database';

export default async function SyncConflictsPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: conflicts } = await supabase
    .from('sync_conflicts')
    .select('*')
    .eq('tenant_id', user.tenant_id)
    .order('created_at', { ascending: false })
    .returns<SyncConflict[]>();

  const list = conflicts ?? [];
  const pending = list.filter((c) => c.status === 'pending');
  const resolved = list.filter((c) => c.status === 'resolved');

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/dashboard/pdv">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar ao PDV
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Pendências de sincronização</h1>
        <p className="text-muted-foreground">
          Operações feitas offline que não puderam ser aplicadas automaticamente (ex: estoque
          vendido por outro caixa antes da sincronização).
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma pendência no momento.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((conflict) => (
            <ConflictCard key={conflict.id} conflict={conflict} />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Resolvidas</h2>
          {resolved.map((conflict) => (
            <ConflictCard key={conflict.id} conflict={conflict} readOnly />
          ))}
        </div>
      )}
    </div>
  );
}
