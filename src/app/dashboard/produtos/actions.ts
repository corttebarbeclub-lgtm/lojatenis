'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { productSchema, brandSchema, categorySchema, supplierSchema } from '@/lib/validations/product';
import { createSupabaseImageProvider } from '@/lib/providers/supabase-image-provider';
import type { ProductInput, BrandInput, CategoryInput, SupplierInput } from '@/lib/validations/product';

export async function createProduct(input: ProductInput) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await requireAppUser();
  const supabase = createClient(cookies());
  const { variants, ...productFields } = parsed.data;

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({ ...productFields, tenant_id: user.tenant_id })
    .select('id')
    .single();

  if (productError || !product) {
    return { error: 'Não foi possível criar o produto.' };
  }

  const { error: variantsError } = await supabase.from('product_variants').insert(
    variants.map((v) => ({
      tenant_id: user.tenant_id,
      product_id: product.id,
      color: v.color,
      size: v.size,
      sku: v.sku || null,
      barcode: v.barcode || null,
      cost_cents: v.cost_cents ?? null,
      price_cents: v.price_cents,
      wholesale_price_cents: v.wholesale_price_cents ?? null,
      wholesale_min_qty: v.wholesale_min_qty ?? null,
    }))
  );

  if (variantsError) {
    await supabase.from('products').delete().eq('id', product.id);
    if (variantsError.code === '23505') {
      return { error: 'Já existe uma variação com essa combinação de cor e tamanho, SKU ou código de barras.' };
    }
    return { error: 'Não foi possível salvar as variações do produto.' };
  }

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'product_created',
    entity_type: 'product',
    entity_id: product.id,
    metadata: { name: productFields.name, variant_count: variants.length },
  });

  revalidatePath('/dashboard/produtos');
  return { success: true, productId: product.id as string };
}

export async function updateProduct(productId: string, input: ProductInput) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await requireAppUser();
  const supabase = createClient(cookies());
  const { variants, ...productFields } = parsed.data;

  const { error: productError } = await supabase
    .from('products')
    .update(productFields)
    .eq('id', productId)
    .eq('tenant_id', user.tenant_id);

  if (productError) {
    return { error: 'Não foi possível atualizar o produto.' };
  }

  // delete-all + reinsert das variações, mesmo padrão usado para planos alimentares no Nutritk
  const { error: deleteError } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', productId)
    .eq('tenant_id', user.tenant_id);

  if (deleteError) {
    return { error: 'Não foi possível atualizar as variações do produto.' };
  }

  const { error: insertError } = await supabase.from('product_variants').insert(
    variants.map((v) => ({
      tenant_id: user.tenant_id,
      product_id: productId,
      color: v.color,
      size: v.size,
      sku: v.sku || null,
      barcode: v.barcode || null,
      cost_cents: v.cost_cents ?? null,
      price_cents: v.price_cents,
      wholesale_price_cents: v.wholesale_price_cents ?? null,
      wholesale_min_qty: v.wholesale_min_qty ?? null,
    }))
  );

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'Já existe uma variação com essa combinação de cor e tamanho, SKU ou código de barras.' };
    }
    return { error: 'Não foi possível salvar as variações do produto.' };
  }

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'product_updated',
    entity_type: 'product',
    entity_id: productId,
    metadata: { name: productFields.name, variant_count: variants.length },
  });

  revalidatePath('/dashboard/produtos');
  revalidatePath(`/dashboard/produtos/${productId}/editar`);
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: images } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('product_id', productId)
    .eq('tenant_id', user.tenant_id);

  const imageProvider = createSupabaseImageProvider(supabase);
  if (images) {
    for (const img of images) {
      await imageProvider.remove(img.storage_path).catch(() => {});
    }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('tenant_id', user.tenant_id);

  if (error) {
    return { error: 'Não foi possível excluir o produto.' };
  }

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'product_deleted',
    entity_type: 'product',
    entity_id: productId,
    metadata: {},
  });

  revalidatePath('/dashboard/produtos');
  return { success: true };
}

export async function createBrand(input: BrandInput) {
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from('brands')
    .insert({ name: parsed.data.name, tenant_id: user.tenant_id })
    .select('id, name')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'Já existe uma marca com esse nome.' };
    return { error: 'Não foi possível criar a marca.' };
  }

  return { success: true, brand: data };
}

export async function createCategory(input: CategoryInput) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: parsed.data.name, tenant_id: user.tenant_id })
    .select('id, name')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'Já existe uma categoria com esse nome.' };
    return { error: 'Não foi possível criar a categoria.' };
  }

  return { success: true, category: data };
}

export async function createSupplier(input: SupplierInput) {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      tenant_id: user.tenant_id,
    })
    .select('id, name')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'Já existe um fornecedor com esse nome.' };
    return { error: 'Não foi possível criar o fornecedor.' };
  }

  return { success: true, supplier: data };
}

export async function addProductImage(
  productId: string,
  storagePath: string,
  url: string,
  meta: { width: number; height: number; sizeBytes: number; format: string }
) {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { count } = await supabase
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('tenant_id', user.tenant_id);

  const { error } = await supabase.from('product_images').insert({
    tenant_id: user.tenant_id,
    product_id: productId,
    storage_path: storagePath,
    url,
    position: count ?? 0,
    is_primary: (count ?? 0) === 0,
    width: meta.width,
    height: meta.height,
    size_bytes: meta.sizeBytes,
    format: meta.format,
  });

  if (error) {
    return { error: 'Não foi possível salvar a imagem no produto.' };
  }

  revalidatePath(`/dashboard/produtos/${productId}/editar`);
  return { success: true };
}

export async function removeProductImage(imageId: string) {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: image, error: fetchError } = await supabase
    .from('product_images')
    .select('id, storage_path, product_id')
    .eq('id', imageId)
    .eq('tenant_id', user.tenant_id)
    .single();

  if (fetchError || !image) {
    return { error: 'Imagem não encontrada.' };
  }

  const imageProvider = createSupabaseImageProvider(supabase);
  await imageProvider.remove(image.storage_path).catch(() => {});

  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)
    .eq('tenant_id', user.tenant_id);

  if (deleteError) {
    return { error: 'Não foi possível remover a imagem.' };
  }

  await supabase.from('audit_logs').insert({
    tenant_id: user.tenant_id,
    user_id: user.id,
    action: 'product_image_deleted',
    entity_type: 'product_image',
    entity_id: imageId,
    metadata: { product_id: image.product_id },
  });

  revalidatePath(`/dashboard/produtos/${image.product_id}/editar`);
  return { success: true };
}

export async function setPrimaryImage(imageId: string, productId: string) {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  await supabase
    .from('product_images')
    .update({ is_primary: false })
    .eq('product_id', productId)
    .eq('tenant_id', user.tenant_id);

  const { error } = await supabase
    .from('product_images')
    .update({ is_primary: true })
    .eq('id', imageId)
    .eq('tenant_id', user.tenant_id);

  if (error) {
    return { error: 'Não foi possível definir a imagem principal.' };
  }

  revalidatePath(`/dashboard/produtos/${productId}/editar`);
  return { success: true };
}
