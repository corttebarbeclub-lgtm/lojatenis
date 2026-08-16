import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Troca o code do link de confirmação por sessão e, se este é o
 * primeiro acesso do usuário (ainda sem registro em `users`), completa
 * o bootstrap do tenant usando os dados guardados no signup.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=confirmacao_invalida`);
  }

  const supabase = createClient(cookies());
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=confirmacao_invalida`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existing) {
      const meta = user.user_metadata as { full_name?: string; tenant_name?: string };
      await supabase.rpc('create_tenant_for_new_user', {
        p_tenant_name: meta.tenant_name ?? 'Minha Loja',
        p_store_name: meta.tenant_name ?? 'Minha Loja',
        p_full_name: meta.full_name ?? user.email ?? 'Usuário',
      });
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
