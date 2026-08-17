import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Customer } from '@/types/database';

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

interface SaleRow {
  id: string;
  total_cents: number;
  created_at: string;
  sale_items: { quantity: number }[];
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', user.tenant_id)
    .single<Customer>();

  if (!customer) {
    notFound();
  }

  const { data: sales } = await supabase
    .from('sales')
    .select('id, total_cents, created_at, sale_items(quantity)')
    .eq('tenant_id', user.tenant_id)
    .eq('customer_id', params.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .returns<SaleRow[]>();

  const list = sales ?? [];
  const totalSpentCents = list.reduce((sum, s) => sum + s.total_cents, 0);
  const lastPurchase = list[0]?.created_at;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/dashboard/clientes">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{customer.full_name}</h1>
        <p className="text-muted-foreground">
          {customer.cpf ?? 'CPF não informado'} · {customer.phone ?? 'sem telefone'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total gasto</CardDescription>
            <CardTitle>{formatPrice(totalSpentCents)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Compras</CardDescription>
            <CardTitle>{list.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Última compra</CardDescription>
            <CardTitle className="text-base">
              {lastPurchase ? formatDateTime(lastPurchase) : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de compras</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma compra registrada ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDateTime(sale.created_at)}</TableCell>
                    <TableCell className="font-mono">
                      {sale.sale_items.reduce((sum, i) => sum + i.quantity, 0)}
                    </TableCell>
                    <TableCell className="font-mono">{formatPrice(sale.total_cents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
