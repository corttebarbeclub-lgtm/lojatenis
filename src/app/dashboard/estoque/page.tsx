import { cookies } from 'next/headers';
import Link from 'next/link';
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
import { MovementDialog } from '@/components/inventory/movement-dialog';
import type { Inventory, Product, ProductVariant } from '@/types/database';

interface VariantRow extends ProductVariant {
  product: Pick<Product, 'id' | 'name'>;
  inventory: Pick<Inventory, 'quantity' | 'min_quantity'> | null;
}

export default async function EstoquePage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*, product:products(id, name), inventory(quantity, min_quantity)')
    .eq('tenant_id', user.tenant_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .returns<VariantRow[]>();

  const list = variants ?? [];
  const lowStockCount = list.filter((v) => {
    const inv = v.inventory;
    return inv && inv.quantity <= inv.min_quantity;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estoque</h1>
        <p className="text-muted-foreground">
          Saldo por variação. {lowStockCount > 0 && (
            <span className="text-destructive">{lowStockCount} variação(ões) com estoque baixo.</span>
          )}
        </p>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma variação de produto cadastrada ainda. Crie produtos na aba Produtos primeiro.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((variant) => {
                const inv = variant.inventory;
                const quantity = inv?.quantity ?? 0;
                const minQuantity = inv?.min_quantity ?? 0;
                const isLow = quantity <= minQuantity;

                return (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.product.name}</TableCell>
                    <TableCell>{variant.color}</TableCell>
                    <TableCell>{variant.size}</TableCell>
                    <TableCell className="text-muted-foreground">{variant.sku ?? '—'}</TableCell>
                    <TableCell className="font-mono">{quantity}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{minQuantity}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="destructive">Baixo</Badge>
                      ) : (
                        <Badge variant="secondary">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/estoque/${variant.id}`}>Histórico</Link>
                      </Button>
                      <MovementDialog
                        variantId={variant.id}
                        productName={variant.product.name}
                        color={variant.color}
                        size={variant.size}
                        currentQuantity={quantity}
                        currentMinQuantity={minQuantity}
                        trigger={
                          <Button variant="outline" size="sm">
                            Movimentar
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
