import { z } from 'zod';

// Máscara de CPF: 000.000.000-00
function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  if (rem !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  return rem === parseInt(digits[10]);
}

export const customerSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo'),
  cpf: z
    .string()
    .min(11, 'CPF inválido')
    .refine((v) => isValidCPF(v), 'CPF inválido'),
  phone: z.string().min(10, 'Informe um telefone válido'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres').optional(),
});

export const addressSchema = z.object({
  cep: z.string().min(8, 'CEP inválido'),
  street: z.string().min(3, 'Informe a rua'),
  number: z.string().min(1, 'Informe o número'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Informe o bairro'),
  city: z.string().min(2, 'Informe a cidade'),
  state: z.string().min(2, 'Informe o estado'),
});

export const paymentMethods = [
  { value: 'pix', label: 'PIX (Aprovação Imediata)', icon: '💠' },
  { value: 'credit', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'debit', label: 'Cartão de Débito', icon: '💳' },
  { value: 'cash', label: 'Dinheiro na entrega', icon: '💵' },
] as const;

export type PaymentMethod = typeof paymentMethods[number]['value'];

export const paymentSchema = z.object({
  method: z.enum(['pix', 'credit', 'debit', 'cash']),
  installments: z.number().int().min(1).max(12).optional(),
});


export const shippingOptions = [
  { value: 'local', label: 'Retirada na Loja', priceCents: 0, days: '0' },
  { value: 'motoboy', label: 'Motoboy (Região Metropolitana)', priceCents: 1500, days: '1-2' },
  { value: 'pac', label: 'Correios PAC', priceCents: 2990, days: '5-8' },
  { value: 'sedex', label: 'Correios SEDEX', priceCents: 4990, days: '2-3' },
] as const;

export type ShippingOption = typeof shippingOptions[number]['value'];

export const shippingSchema = z.object({
  option: z.enum(['local', 'motoboy', 'pac', 'sedex']),
});

export const checkoutSchema = z.object({
  customer: customerSchema,
  address: addressSchema,
  payment: paymentSchema,
  shipping: shippingSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

// Checkout B2B — dados da empresa
export const b2bCustomerSchema = z.object({
  companyName: z.string().min(3, 'Informe a razão social'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  stateRegistration: z.string().optional(),
  contactName: z.string().min(3, 'Informe o nome do contato'),
  phone: z.string().min(10, 'Informe um telefone válido'),
  email: z.string().email('E-mail inválido'),
});

export type B2BCustomerInput = z.infer<typeof b2bCustomerSchema>;
