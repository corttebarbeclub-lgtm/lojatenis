import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getCurrentAppUser } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentAppUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const {
      brandName,
      name,
      categoryName,
      gender,
      description,
      color,
      retailPriceCents,
      costPriceCents,
      wholesalePriceCents,
      wholesaleMinQty,
      imageUrl,
      sizesGrid,
    } = body;

    if (!name || !brandName || !retailPriceCents || !sizesGrid || sizesGrid.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Preencha os campos obrigatórios e ao menos 1 tamanho com quantidade.' },
        { status: 400 }
      );
    }

    const supabase = createClient(cookies());

    const { data, error } = await supabase.rpc('quick_register_sneaker', {
      p_tenant_id: user.tenant_id,
      p_brand_name: brandName,
      p_name: name,
      p_category_name: categoryName || 'Sneaker',
      p_gender: gender || 'unissex',
      p_description: description || null,
      p_color: color || 'Padrão',
      p_retail_price_cents: retailPriceCents,
      p_cost_price_cents: costPriceCents || Math.round(retailPriceCents * 0.55),
      p_wholesale_price_cents: wholesalePriceCents || Math.round(retailPriceCents * 0.75),
      p_wholesale_min_qty: wholesaleMinQty || 6,
      p_image_url: imageUrl || (body.images?.[0] ?? null),
      p_sizes_grid: sizesGrid,
      p_images: body.images || [],
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
