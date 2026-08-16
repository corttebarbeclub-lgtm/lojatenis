import { cookies } from 'next/headers';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NewCustomerDialog } from '@/components/pdv/new-customer-dialog';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/types/database';

export default async function ClientesPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', user.tenant_id)
    .order('created_at', { ascending: false })
    .returns<Customer[]>();

  const list = customers ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Cadastro de clientes da loja.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/vendedores">Vendedores</Link>
          </Button>
          <NewCustomerDialog />
        </div>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum cliente cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.full_name}</TableCell>
                  <TableCell>{customer.cpf ?? '—'}</TableCell>
                  <TableCell>{customer.phone ?? '—'}</TableCell>
                  <TableCell>{customer.email ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
