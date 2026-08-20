import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmlxhsqfvxjggvqusleu.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Chave de serviço não configurada.' }, { status: 500 });
    }

    const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    // 1. Obter tenant_id da loja
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', 'tenisstore')
      .single();

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Loja não encontrada.' }, { status: 404 });
    }

    // 2. Buscar todas as variantes ativas da loja com dados de produto, marca e fotos
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        color,
        size,
        sku,
        barcode,
        price_cents,
        product:products (
          id,
          name,
          brand:brands ( name ),
          product_images ( url, is_primary, position )
        ),
        inventory ( quantity )
      `)
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .limit(600);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const q = query.toLowerCase();

    // Filtrar termos
    const filtered = (variants ?? []).filter((v) => {
      if (!q) return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prod = v.product as any;
      const brandName = (prod?.brand?.name || '').toLowerCase();
      const prodName = (prod?.name || '').toLowerCase();
      const color = (v.color || '').toLowerCase();
      const size = (v.size || '').toLowerCase();
      const sku = (v.sku || '').toLowerCase();
      const barcode = (v.barcode || '').toLowerCase();

      // Divide a query em múltiplos termos para permitir busca flexível como "nike dunk 38"
      const terms = q.split(/\s+/).filter(Boolean);
      return terms.every(
        (term) =>
          prodName.includes(term) ||
          brandName.includes(term) ||
          color.includes(term) ||
          size.includes(term) ||
          sku.includes(term) ||
          barcode.includes(term)
      );
    });

    const formatted = filtered.slice(0, 30).map((v) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prod = v.product as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inv = Array.isArray(v.inventory) ? v.inventory[0] : (v.inventory as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const images = (prod?.product_images as any[]) || [];
      const primaryImage =
        images.find((img) => img.is_primary)?.url || images[0]?.url || null;

      return {
        id: v.id,
        color: v.color,
        size: v.size,
        sku: v.sku,
        barcode: v.barcode,
        price_cents: v.price_cents,
        product_name: prod?.name ?? '—',
        brand_name: prod?.brand?.name ?? '',
        available_quantity: inv?.quantity ?? 0,
        image_url: primaryImage,
      };
    });

    return NextResponse.json({ success: true, results: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro na busca de produtos.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
