'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validations/auth';
import { signup } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  function onSubmit(values: SignupInput) {
    setServerError(null);
    setSuccessMessage(null);
    const formData = new FormData();
    formData.set('fullName', values.fullName);
    formData.set('tenantName', values.tenantName);
    formData.set('email', values.email);
    formData.set('password', values.password);

    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) setServerError(result.error);
      if (result?.success) setSuccessMessage(result.success);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Cadastrar loja</CardTitle>
          <CardDescription>Crie sua conta para começar a usar o Lojatenis.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Seu nome</Label>
              <Input id="fullName" autoComplete="name" {...register('fullName')} />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantName">Nome da loja</Label>
              <Input id="tenantName" {...register('tenantName')} />
              {errors.tenantName && (
                <p className="text-sm text-destructive">{errors.tenantName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
