import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { ProductForm } from '@/components/products/product-form';
import { DeleteProductButton } from '@/components/products/delete-product-button';
import type { ProductWithRelations } from '@/types/database';

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const [{ data: product }, { data: brands }, { data: categories }, { data: suppliers }] =
    await Promise.all([
      supabase
        .from('products')
        .select(
          '*, brand:brands(*), category:categories(*), supplier:suppliers(*), variants:product_variants(*), images:product_images(*)'
        )
        .eq('id', params.id)
        .eq('tenant_id', user.tenant_id)
        .order('position', { referencedTable: 'product_images' })
        .single<ProductWithRelations>(),
      supabase.from('brands').select('*').eq('tenant_id', user.tenant_id).order('name'),
      supabase.from('categories').select('*').eq('tenant_id', user.tenant_id).order('name'),
      supabase.from('suppliers').select('*').eq('tenant_id', user.tenant_id).order('name'),
    ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground">Editar produto e variações.</p>
        </div>
        <DeleteProductButton productId={product.id} />
      </div>

      <ProductForm
        tenantId={user.tenant_id}
        brands={brands ?? []}
        categories={categories ?? []}
        suppliers={suppliers ?? []}
        product={product}
      />
    </div>
  );
}
