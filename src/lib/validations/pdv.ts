import { z } from 'zod';

export const openCashRegisterSchema = z.object({
  storeId: z.string().uuid(),
  openingBalanceCents: z.number().int().min(0),
});

export const closeCashRegisterSchema = z.object({
  cashRegisterId: z.string().uuid(),
  closingBalanceCents: z.number().int().min(0),
});

export const cashMovementTypeSchema = z.enum(['withdrawal', 'reinforcement']);

export const registerCashMovementSchema = z.object({
  cashRegisterId: z.string().uuid(),
  type: cashMovementTypeSchema,
  amountCents: z.number().int().min(1, 'Informe um valor maior que zero'),
  reason: z.string().optional(),
  clientOperationId: z.string().uuid().optional(),
});

export const paymentMethodSchema = z.enum(['cash', 'pix', 'card']);

export const saleItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPriceCents: z.number().int().min(0),
});

export const salePaymentSchema = z.object({
  method: paymentMethodSchema,
  amountCents: z.number().int().min(1),
});

export const createSaleSchema = z.object({
  cashRegisterId: z.string().uuid(),
  items: z.array(saleItemSchema).min(1, 'Adicione ao menos um item à venda'),
  payments: z.array(salePaymentSchema).min(1, 'Informe ao menos uma forma de pagamento'),
  discountCents: z.number().int().min(0).default(0),
  customerId: z.string().uuid().optional().nullable(),
  sellerId: z.string().uuid().optional().nullable(),
  clientOperationId: z.string().uuid().optional(),
});

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Informe o nome do cliente'),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

export const sellerSchema = z.object({
  fullName: z.string().min(2, 'Informe o nome do vendedor'),
  commissionPercent: z.number().min(0).max(100).default(0),
});

export type OpenCashRegisterInput = z.infer<typeof openCashRegisterSchema>;
export type CloseCashRegisterInput = z.infer<typeof closeCashRegisterSchema>;
export type RegisterCashMovementInput = z.infer<typeof registerCashMovementSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SellerInput = z.infer<typeof sellerSchema>;
