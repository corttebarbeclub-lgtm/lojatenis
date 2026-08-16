import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { ProductForm } from '@/components/products/product-form';

export default async function NovoProdutoPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const [{ data: brands }, { data: categories }, { data: suppliers }] = await Promise.all([
    supabase.from('brands').select('*').eq('tenant_id', user.tenant_id).order('name'),
    supabase.from('categories').select('*').eq('tenant_id', user.tenant_id).order('name'),
    supabase.from('suppliers').select('*').eq('tenant_id', user.tenant_id).order('name'),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo produto</h1>
        <p className="text-muted-foreground">
          Cadastre o produto e as variações de cor e tamanho. As fotos podem ser adicionadas depois de salvar.
        </p>
      </div>

      <ProductForm
        tenantId={user.tenant_id}
        brands={brands ?? []}
        categories={categories ?? []}
        suppliers={suppliers ?? []}
      />
    </div>
  );
}
