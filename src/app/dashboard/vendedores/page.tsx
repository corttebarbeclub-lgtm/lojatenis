import { cookies } from 'next/headers';
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
import { NewSellerDialog } from '@/components/pdv/new-seller-dialog';
import type { Seller } from '@/types/database';

export default async function VendedoresPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: sellers } = await supabase
    .from('sellers')
    .select('*')
    .eq('tenant_id', user.tenant_id)
    .order('created_at', { ascending: false })
    .returns<Seller[]>();

  const list = sellers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/dashboard/clientes">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Vendedores</h1>
            <p className="text-muted-foreground">Cadastro de vendedores e comissão.</p>
          </div>
          <NewSellerDialog />
        </div>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum vendedor cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell className="font-medium">{seller.full_name}</TableCell>
                  <TableCell>{seller.commission_percent}%</TableCell>
                  <TableCell>
                    <Badge variant={seller.is_active ? 'default' : 'secondary'}>
                      {seller.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
