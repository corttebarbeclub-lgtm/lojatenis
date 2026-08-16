import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Informe seu nome completo'),
  tenantName: z.string().min(2, 'Informe o nome da loja'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha precisa ter no mínimo 8 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
