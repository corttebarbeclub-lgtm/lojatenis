'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { loginSchema, signupSchema } from '@/lib/validations/auth';

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient(cookies());
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: 'E-mail ou senha incorretos.' };
  }

  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    fullName: formData.get('fullName'),
    tenantName: formData.get('tenantName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { fullName, tenantName, email, password } = parsed.data;
  const supabase = createClient(cookies());

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, tenant_name: tenantName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes('already registered')) {
      return { error: 'Este e-mail já está cadastrado.' };
    }
    if (signUpError.code === 'over_email_send_rate_limit') {
      return { error: 'Muitas tentativas de cadastro em pouco tempo. Aguarde alguns minutos e tente novamente.' };
    }
    return { error: 'Não foi possível criar a conta. Tente novamente.' };
  }

  // Se a confirmação por e-mail estiver desligada no projeto, o Supabase
  // já retorna sessão ativa aqui e não há link de confirmação a clicar —
  // nesse caso completamos o bootstrap do tenant imediatamente. Caso
  // contrário, session vem null e o bootstrap acontece em auth/callback.
  if (data.session) {
    const { error: rpcError } = await supabase.rpc('create_tenant_for_new_user', {
      p_tenant_name: tenantName,
      p_store_name: tenantName,
      p_full_name: fullName,
    });

    if (rpcError) {
      return { error: 'Conta criada, mas houve um erro ao configurar a loja. Contate o suporte.' };
    }

    redirect('/dashboard');
  }

  return {
    success: 'Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.',
  };
}

export async function logout() {
  const supabase = createClient(cookies());
  await supabase.auth.signOut();
  redirect('/login');
}
