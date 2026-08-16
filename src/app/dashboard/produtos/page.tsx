import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { Brand, Category, ProductImage, ProductVariant } from '@/types/database';

interface ProductRow {
  id: string;
  name: string;
  is_active: boolean;
  brand: Brand | null;
  category: Category | null;
  variants: Pick<ProductVariant, 'id' | 'price_cents'>[];
  images: Pick<ProductImage, 'url' | 'is_primary'>[];
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function ProdutosPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: products } = await supabase
    .from('products')
    .select(
      'id, name, is_active, brand:brands(*), category:categories(*), variants:product_variants(id, price_cents), images:product_images(url, is_primary)'
    )
    .eq('tenant_id', user.tenant_id)
    .order('created_at', { ascending: false })
    .returns<ProductRow[]>();

  const list = products ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Catálogo de calçados da loja.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/produtos/novo">
            <Plus className="mr-1 h-4 w-4" />
            Novo produto
          </Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum produto cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Variações</TableHead>
                <TableHead>A partir de</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((product) => {
                const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];
                const minPrice = product.variants.length
                  ? Math.min(...product.variants.map((v) => v.price_cents))
                  : null;

                return (
                  <TableRow key={product.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/dashboard/produtos/${product.id}/editar`}>
                        <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                          {primaryImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={primaryImage.url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/produtos/${product.id}/editar`}>{product.name}</Link>
                    </TableCell>
                    <TableCell>{product.brand?.name ?? '—'}</TableCell>
                    <TableCell>{product.category?.name ?? '—'}</TableCell>
                    <TableCell>{product.variants.length}</TableCell>
                    <TableCell>{minPrice != null ? formatPrice(minPrice) : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
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
