import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmlxhsqfvxjggvqusleu.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  }

  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const slug = searchParams.get('slug') || 'tenisstore';
    const supabase = getAdminClient();

    const { data: products, error } = await supabase.rpc('get_storefront_products', { p_slug: slug });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    interface StorefrontSearchProduct {
      product_id: string;
      product_name: string;
      brand_name: string | null;
      category_name: string | null;
      image_url: string | null;
      min_price_cents: number;
    }

    let filtered = (products || []) as StorefrontSearchProduct[];

    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.product_name?.toLowerCase().includes(query) ||
          p.brand_name?.toLowerCase().includes(query) ||
          p.category_name?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      products: filtered.slice(0, 15),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro na busca.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
