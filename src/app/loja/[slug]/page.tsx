import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface StorefrontProduct {
  product_id: string;
  product_name: string;
  brand_name: string | null;
  category_name: string | null;
  description: string | null;
  gender: string | null;
  image_url: string | null;
  min_price_cents: number;
  max_price_cents: number;
  has_stock: boolean;
}

export default async function StorefrontPage({ params }: { params: { slug: string } }) {
  const supabase = createClient(cookies());

  const tenantResult = await supabase.rpc('get_storefront_tenant', { p_slug: params.slug });
  const tenants = (tenantResult.data ?? []) as { id: string; name: string }[];
  const tenant = tenants[0];

  if (!tenant) {
    notFound();
  }

  const productsResult = await supabase.rpc('get_storefront_products', { p_slug: params.slug });
  const list = (productsResult.data ?? []) as StorefrontProduct[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{tenant.name}</h1>
        <p className="text-muted-foreground">Catálogo de produtos</p>
      </header>

      {list.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((product) => (
            <Link key={product.product_id} href={`/loja/${params.slug}/produto/${product.product_id}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                <div className="aspect-square bg-muted">
                  {product.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="space-y-1 p-3">
                  {product.brand_name && (
                    <p className="text-xs text-muted-foreground">{product.brand_name}</p>
                  )}
                  <p className="text-sm font-medium leading-tight">{product.product_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {product.min_price_cents === product.max_price_cents
                        ? formatPrice(product.min_price_cents)
                        : `a partir de ${formatPrice(product.min_price_cents)}`}
                    </span>
                    {!product.has_stock && <Badge variant="secondary">Esgotado</Badge>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
