import { z } from 'zod';

export const productGenderSchema = z.enum(['masculino', 'feminino', 'unissex', 'infantil']);

export const variantSchema = z.object({
  id: z.string().uuid().optional(),
  color: z.string().min(1, 'Informe a cor'),
  size: z.string().min(1, 'Informe o tamanho'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  cost_cents: z.number().int().min(0).optional(),
  price_cents: z.number().int().min(1, 'Informe o preço de venda'),
  wholesale_price_cents: z.number().int().min(0).optional(),
  wholesale_min_qty: z.number().int().min(1).optional(),
});

// Selects HTML/Radix não conseguem representar "nenhum valor" sem usar
// string vazia — o formulário usa '' como estado inicial desses campos,
// então a validação precisa aceitar '' como equivalente a ausente.
const emptyableUuid = z.string().uuid().or(z.literal('')).optional().nullable();
const emptyableGender = productGenderSchema.or(z.literal('')).optional().nullable();

export const productSchema = z.object({
  name: z.string().min(2, 'Informe o nome do produto'),
  brand_id: emptyableUuid,
  category_id: emptyableUuid,
  supplier_id: emptyableUuid,
  gender: emptyableGender,
  reference: z.string().optional(),
  description: z.string().optional(),
  ncm: z.string().optional(),
  variants: z.array(variantSchema).min(1, 'Adicione ao menos uma variação (cor e tamanho)'),
});

export const brandSchema = z.object({
  name: z.string().min(2, 'Informe o nome da marca'),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Informe o nome da categoria'),
});

export const supplierSchema = z.object({
  name: z.string().min(2, 'Informe o nome do fornecedor'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
