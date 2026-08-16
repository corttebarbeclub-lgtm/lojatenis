'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { productSchema, type ProductInput } from '@/lib/validations/product';
import { createProduct, updateProduct, createBrand, createCategory, createSupplier } from '@/app/dashboard/produtos/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductImageUploader } from './product-image-uploader';
import type { ProductWithRelations } from '@/types/database';

const GENDER_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  unissex: 'Unissex',
  infantil: 'Infantil',
};

interface NamedOption {
  id: string;
  name: string;
}

function centsToInput(cents: number | null | undefined) {
  if (cents == null) return '';
  return (cents / 100).toFixed(2);
}

function inputToCents(value: string) {
  const n = Number(value.replace(',', '.'));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

export function ProductForm({
  tenantId,
  brands,
  categories,
  suppliers,
  product,
}: {
  tenantId: string;
  brands: NamedOption[];
  categories: NamedOption[];
  suppliers: NamedOption[];
  product?: ProductWithRelations;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [brandList, setBrandList] = useState<NamedOption[]>(brands);
  const [categoryList, setCategoryList] = useState<NamedOption[]>(categories);
  const [supplierList, setSupplierList] = useState<NamedOption[]>(suppliers);
  const [newBrandName, setNewBrandName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          brand_id: product.brand_id ?? '',
          category_id: product.category_id ?? '',
          supplier_id: product.supplier_id ?? '',
          gender: (product.gender ?? '') as ProductInput['gender'],
          reference: product.reference ?? '',
          description: product.description ?? '',
          ncm: product.ncm ?? '',
          variants: product.variants.map((v) => ({
            id: v.id,
            color: v.color,
            size: v.size,
            sku: v.sku ?? '',
            barcode: v.barcode ?? '',
            cost_cents: v.cost_cents ?? undefined,
            price_cents: v.price_cents,
          })),
        }
      : {
          brand_id: '',
          category_id: '',
          supplier_id: '',
          gender: '' as ProductInput['gender'],
          variants: [{ color: '', size: '', price_cents: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  async function handleCreateBrand() {
    if (!newBrandName.trim()) return;
    const result = await createBrand({ name: newBrandName.trim() });
    if (result.error) return toast.error(result.error);
    if (result.brand) {
      setBrandList((prev) => [...prev, result.brand!]);
      setValue('brand_id', result.brand.id, { shouldDirty: true });
      setNewBrandName('');
      toast.success('Marca criada.');
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    const result = await createCategory({ name: newCategoryName.trim() });
    if (result.error) return toast.error(result.error);
    if (result.category) {
      setCategoryList((prev) => [...prev, result.category!]);
      setValue('category_id', result.category.id, { shouldDirty: true });
      setNewCategoryName('');
      toast.success('Categoria criada.');
    }
  }

  async function handleCreateSupplier() {
    if (!newSupplierName.trim()) return;
    const result = await createSupplier({ name: newSupplierName.trim() });
    if (result.error) return toast.error(result.error);
    if (result.supplier) {
      setSupplierList((prev) => [...prev, result.supplier!]);
      setValue('supplier_id', result.supplier.id, { shouldDirty: true });
      setNewSupplierName('');
      toast.success('Fornecedor criado.');
    }
  }

  function onSubmit(values: ProductInput) {
    const sanitized: ProductInput = {
      ...values,
      brand_id: values.brand_id || null,
      category_id: values.category_id || null,
      supplier_id: values.supplier_id || null,
      gender: values.gender || null,
    };

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, sanitized)
        : await createProduct(sanitized);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(product ? 'Produto atualizado.' : 'Produto criado.');

      if (!product && 'productId' in result) {
        router.push(`/dashboard/produtos/${result.productId}/editar`);
      } else {
        router.refresh();
      }
    });
  }

  const genderValue = watch('gender');
  const brandValue = watch('brand_id');
  const categoryValue = watch('category_id');
  const supplierValue = watch('supplier_id');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados do produto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Marca</Label>
            <div className="flex gap-2">
              <Select
                key={brandList.length}
                value={brandValue ?? ''}
                onValueChange={(v) => setValue('brand_id', v, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {brandList.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nova marca"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="h-8 text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleCreateBrand}>
                Criar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              key={categoryList.length}
              value={categoryValue ?? ''}
              onValueChange={(v) => setValue('category_id', v, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categoryList.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder="Nova categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="h-8 text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleCreateCategory}>
                Criar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Select
              key={supplierList.length}
              value={supplierValue ?? ''}
              onValueChange={(v) => setValue('supplier_id', v, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {supplierList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder="Novo fornecedor"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className="h-8 text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleCreateSupplier}>
                Criar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select
              value={genderValue ?? ''}
              onValueChange={(v) => setValue('gender', v as ProductInput['gender'], { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GENDER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referência</Label>
            <Input id="reference" {...register('reference')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ncm">NCM</Label>
            <Input id="ncm" {...register('ncm')} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variações (cor e tamanho)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {errors.variants?.message && (
            <p className="text-sm text-destructive">{errors.variants.message}</p>
          )}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-6">
                <div className="space-y-1">
                  <Label className="text-xs">Cor</Label>
                  <Input {...register(`variants.${index}.color`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tamanho</Label>
                  <Input {...register(`variants.${index}.size`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">SKU</Label>
                  <Input {...register(`variants.${index}.sku`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Código de barras</Label>
                  <Input {...register(`variants.${index}.barcode`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Custo (R$)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    defaultValue={centsToInput(field.cost_cents)}
                    onChange={(e) =>
                      setValue(`variants.${index}.cost_cents`, inputToCents(e.target.value))
                    }
                  />
                </div>
                <div className="flex items-end gap-1">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Venda (R$)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      defaultValue={centsToInput(field.price_cents)}
                      onChange={(e) =>
                        setValue(`variants.${index}.price_cents`, inputToCents(e.target.value))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ color: '', size: '', price_cents: 0 })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Adicionar variação
          </Button>
        </CardContent>
      </Card>

      {product && (
        <Card>
          <CardHeader>
            <CardTitle>Fotos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImageUploader productId={product.id} tenantId={tenantId} images={product.images} />
          </CardContent>
        </Card>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : product ? 'Salvar alterações' : 'Criar produto'}
      </Button>
    </form>
  );
}
