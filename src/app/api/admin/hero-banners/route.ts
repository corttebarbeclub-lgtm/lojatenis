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

// 1. GET: Listar banners e produtos com estoque para o dropdown
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let tenantId = searchParams.get('tenant_id');
    const supabase = getAdminClient();

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'tenisstore')
        .single();
      tenantId = tenant?.id;
    }

    // Buscar banners configurados
    const { data: banners, error: bErr } = await supabase
      .from('storefront_hero_banners')
      .select(`
        *,
        product:products (
          id,
          name,
          brand:brands ( id, name ),
          product_variants (
            id,
            price_cents,
            inventory ( quantity )
          ),
          product_images ( id, url, is_primary )
        )
      `)
      .eq('tenant_id', tenantId)
      .order('position', { ascending: true });

    if (bErr) {
      return NextResponse.json({ success: false, error: bErr.message }, { status: 500 });
    }

    // Buscar lista de todos os tênis com estoque e fotos para o seletor
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select(`
        id,
        name,
        brand:brands ( id, name ),
        product_images ( id, url, is_primary ),
        product_variants (
          id,
          size,
          price_cents,
          inventory ( quantity )
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (pErr) {
      return NextResponse.json({ success: false, error: pErr.message }, { status: 500 });
    }

    // Formatar produtos para facilitar o frontend
    const formattedProducts = (products || []).map((p) => {
      const primaryImage = p.product_images?.find((img) => img.is_primary)?.url || p.product_images?.[0]?.url || null;
      const allImages = p.product_images?.map((img) => img.url) || [];
      const totalStock = p.product_variants?.reduce((acc, v) => acc + (v.inventory?.[0]?.quantity || 0), 0) || 0;
      const minPrice = p.product_variants?.length
        ? Math.min(...p.product_variants.map((v) => v.price_cents))
        : 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const brandObj = Array.isArray(p.brand) ? p.brand[0] : (p.brand as any);
      return {
        id: p.id,
        name: p.name,
        brandName: brandObj?.name || 'Marca',
        primaryImage,
        allImages,
        totalStock,
        minPriceCents: minPrice,
      };
    });

    return NextResponse.json({
      success: true,
      banners: banners ?? [],
      products: formattedProducts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar dados da Hero.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST / PUT: Salvar ou Atualizar Banner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      subtitle,
      tag,
      badgeType,
      discountBadgeText,
      productId,
      customImageUrl,
      bgTheme,
      ctaText,
      ctaLink,
      isActive = true,
      position = 0,
    } = body;
    let { tenantId } = body;

    const supabase = getAdminClient();

    if (!title) {
      return NextResponse.json({ success: false, error: 'O título do banner é obrigatório.' }, { status: 400 });
    }

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'tenisstore')
        .single();
      tenantId = tenant?.id;
    }

    const payload = {
      tenant_id: tenantId,
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      tag: tag?.trim() || '🔥 DESTAQUE EM ESTOQUE',
      badge_type: badgeType || 'drop',
      discount_badge_text: discountBadgeText?.trim() || null,
      product_id: productId || null,
      custom_image_url: customImageUrl?.trim() || null,
      bg_theme: bgTheme || 'gold_amber',
      cta_text: ctaText?.trim() || 'Comprar Agora • Ver Tamanhos',
      cta_link: ctaLink?.trim() || (productId ? `/loja/tenisstore/produto/${productId}` : '/loja/tenisstore'),
      is_active: isActive !== false,
      position: Number(position) || 0,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      // Atualizar existente
      result = await supabase
        .from('storefront_hero_banners')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();
    } else {
      // Inserir novo
      result = await supabase
        .from('storefront_hero_banners')
        .insert(payload)
        .select('*')
        .single();
    }

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Banner da Hero salvo com sucesso e já ativo na vitrine!',
      banner: result.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao salvar banner da Hero.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 3. DELETE: Excluir banner
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const supabase = getAdminClient();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do banner é obrigatório.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('storefront_hero_banners')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Banner excluído com sucesso!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir banner.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
