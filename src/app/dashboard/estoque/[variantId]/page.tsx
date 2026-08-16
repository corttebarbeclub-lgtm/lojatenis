import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { InventoryMovement, Product, ProductVariant } from '@/types/database';

const TYPE_LABELS: Record<string, string> = {
  entry: 'Entrada',
  adjustment: 'Ajuste',
  count: 'Contagem',
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default async function VariantHistoryPage({ params }: { params: { variantId: string } }) {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: variant } = await supabase
    .from('product_variants')
    .select('*, product:products(id, name)')
    .eq('id', params.variantId)
    .eq('tenant_id', user.tenant_id)
    .single<ProductVariant & { product: Pick<Product, 'id' | 'name'> }>();

  if (!variant) {
    notFound();
  }

  const { data: movements } = await supabase
    .from('inventory_movements')
    .select('*')
    .eq('variant_id', params.variantId)
    .eq('tenant_id', user.tenant_id)
    .order('created_at', { ascending: false })
    .returns<InventoryMovement[]>();

  const list = movements ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/dashboard/estoque">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar ao estoque
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {variant.product.name} — {variant.color} {variant.size}
        </h1>
        <p className="text-muted-foreground">Histórico de movimentações de estoque.</p>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma movimentação registrada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Variação</TableHead>
                <TableHead>Saldo após</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(movement.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{TYPE_LABELS[movement.type]}</Badge>
                  </TableCell>
                  <TableCell
                    className={`font-mono ${movement.quantity_change > 0 ? 'text-emerald-600' : movement.quantity_change < 0 ? 'text-destructive' : ''}`}
                  >
                    {movement.quantity_change > 0 ? '+' : ''}
                    {movement.quantity_change}
                  </TableCell>
                  <TableCell className="font-mono">{movement.quantity_after}</TableCell>
                  <TableCell className="text-muted-foreground">{movement.reason ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
