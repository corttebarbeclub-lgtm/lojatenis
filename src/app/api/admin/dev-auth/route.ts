import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'phabrycio@gmail.com',
    password: 'admin123',
  });

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || 'Falha ao autenticar' }, { status: 400 });
  }

  const response = NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  return response;
}
