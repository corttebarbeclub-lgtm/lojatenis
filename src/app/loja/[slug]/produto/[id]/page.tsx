import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface VariantDetail {
  product_id: string;
  product_name: string;
  brand_name: string | null;
  description: string | null;
  gender: string | null;
  variant_id: string;
  color: string;
  size: string;
  price_cents: number;
  quantity: number;
  image_urls: string[] | null;
}

export default async function StorefrontProductPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const supabase = createClient(cookies());

  const variantsResult = await supabase.rpc('get_storefront_product_detail', {
    p_slug: params.slug,
    p_product_id: params.id,
  });
  const list = (variantsResult.data ?? []) as VariantDetail[];
  if (list.length === 0) {
    notFound();
  }

  const first = list[0];
  const images = first.image_urls ?? [];
  const colors = Array.from(new Set(list.map((v) => v.color)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={`/loja/${params.slug}`}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar ao catálogo
        </Link>
      </Button>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          {images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[0]} alt={first.product_name} className="h-full w-full object-cover" />
          )}
        </div>

        <div className="space-y-4">
          {first.brand_name && <p className="text-sm text-muted-foreground">{first.brand_name}</p>}
          <h1 className="text-2xl font-semibold tracking-tight">{first.product_name}</h1>
          <p className="text-xl font-semibold">{formatPrice(first.price_cents)}</p>

          {first.description && <p className="text-sm text-muted-foreground">{first.description}</p>}

          {colors.map((color) => (
            <div key={color} className="space-y-2">
              <p className="text-sm font-medium">Cor: {color}</p>
              <div className="flex flex-wrap gap-2">
                {list
                  .filter((v) => v.color === color)
                  .map((v) => (
                    <Badge
                      key={v.variant_id}
                      variant={v.quantity > 0 ? 'outline' : 'secondary'}
                      className={v.quantity === 0 ? 'text-muted-foreground line-through' : ''}
                    >
                      {v.size}
                    </Badge>
                  ))}
              </div>
            </div>
          ))}

          <p className="text-xs text-muted-foreground">
            Disponibilidade sujeita a confirmação na loja.
          </p>
        </div>
      </div>
    </div>
  );
}
