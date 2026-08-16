import { z } from 'zod';

export const inventoryMovementTypeSchema = z.enum(['entry', 'adjustment', 'count']);

export const registerMovementSchema = z.object({
  variantId: z.string().uuid(),
  type: inventoryMovementTypeSchema,
  quantity: z.number().int(),
  reason: z.string().optional(),
});

export const setMinQuantitySchema = z.object({
  variantId: z.string().uuid(),
  minQuantity: z.number().int().min(0, 'Estoque mínimo não pode ser negativo'),
});

export type RegisterMovementInput = z.infer<typeof registerMovementSchema>;
export type SetMinQuantityInput = z.infer<typeof setMinQuantitySchema>;
