import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import type { AppUser } from '@/types/database';

/**
 * Retorna o registro `users` (com tenant_id e role) do usuário autenticado
 * na sessão atual, ou null se não houver sessão / registro ainda não criado.
 */
export async function getCurrentAppUser(): Promise<AppUser | null> {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;

  return data as AppUser;
}

/**
 * Mesma resolução, mas lança se não houver usuário — para usar em
 * Server Components/Actions que exigem sessão válida (a rota já é
 * protegida pelo middleware, então isso só falha em uso indevido).
 */
export async function requireAppUser(): Promise<AppUser> {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error('Usuário não autenticado ou sem tenant associado.');
  }
  return appUser;
}
