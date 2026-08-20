import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { checkAndNotifyRestockedItems } from '@/lib/notifications/stock-alert-notifier';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmlxhsqfvxjggvqusleu.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  }

  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

// 1. GET: Buscar dados completos de um tênis específico
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id');
    const supabase = getAdminClient();

    if (!productId) {
      return NextResponse.json({ success: false, error: 'ID do produto não informado.' }, { status: 400 });
    }

    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        is_active,
        brand_id,
        brand:brands ( id, name ),
        product_images ( id, url, is_primary, position ),
        product_variants (
          id,
          size,
          color,
          sku,
          barcode,
          price_cents,
          cost_cents,
          wholesale_price_cents,
          inventory ( id, quantity, min_quantity )
        )
      `)
      .eq('id', productId)
      .single();

    if (prodErr || !product) {
      return NextResponse.json({ success: false, error: prodErr?.message || 'Produto não encontrado.' }, { status: 404 });
    }

    // Extrair preços da primeira variante
    const firstVar = product.product_variants?.[0];
    const enrichedProduct = {
      ...product,
      sale_price_cents: firstVar?.price_cents || 57990,
      cost_price_cents: firstVar?.cost_cents || 28000,
      wholesale_price_cents: firstVar?.wholesale_price_cents || 32000,
    };

    return NextResponse.json({ success: true, product: enrichedProduct });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar detalhes do produto.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. PUT: Atualizar produto, fotos e estoques com validação de senha mestra
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      tenantId,
      name,
      brandId,
      brandName,
      color,
      priceCents,
      costCents,
      wholesalePriceCents,
      images, // array de string de urls de imagens
      variantsStock, // array de { variantId, size, quantity }
      adminPin, // Senha mestra do dono
    } = body;

    const supabase = getAdminClient();

    if (!productId) {
      return NextResponse.json({ success: false, error: 'ID do produto obrigatório.' }, { status: 400 });
    }

    // Identificar tenant
    let resolvedTenantId = tenantId;
    if (!resolvedTenantId || resolvedTenantId === 'undefined' || resolvedTenantId === 'null') {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, admin_master_pin')
        .eq('slug', 'tenisstore')
        .single();
      resolvedTenantId = tenant?.id;
    }

    // Se houver alteração de estoque (variantsStock informado), exigir e validar a senha mestra de admin!
    if (variantsStock && variantsStock.length > 0) {
      if (!adminPin || !adminPin.trim()) {
        return NextResponse.json(
          { success: false, error: 'A senha mestra de admin do dono é obrigatória para alterar ou zerar o estoque.' },
          { status: 403 }
        );
      }

      // Validar senha mestra
      const { data: verifyResult, error: verifyErr } = await supabase.rpc('verify_admin_master_pin', {
        p_tenant_id: resolvedTenantId,
        p_pin: adminPin.trim(),
      });

      if (verifyErr || !verifyResult?.success) {
        return NextResponse.json(
          { success: false, error: verifyResult?.error || 'Senha Mestra de Admin incorreta! Operação não autorizada.' },
          { status: 403 }
        );
      }
    }

    // 1. Resolver Brand se digitou nome
    let finalBrandId = brandId;
    if (brandName && brandName.trim()) {
      const { data: brandRow } = await supabase
        .from('brands')
        .upsert(
          {
            tenant_id: resolvedTenantId,
            name: brandName.trim(),
          },
          { onConflict: 'tenant_id,name' }
        )
        .select('id')
        .single();
      if (brandRow?.id) finalBrandId = brandRow.id;
    }

    // 2. Atualizar dados principais do produto
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productUpdates: any = {
      updated_at: new Date().toISOString(),
    };
    if (name) productUpdates.name = name.trim();
    if (finalBrandId) productUpdates.brand_id = finalBrandId;

    const { error: updateProdErr } = await supabase
      .from('products')
      .update(productUpdates)
      .eq('id', productId);

    if (updateProdErr) {
      return NextResponse.json({ success: false, error: updateProdErr.message }, { status: 500 });
    }

    // 3. Atualizar Fotos do Produto (se informadas)
    if (Array.isArray(images)) {
      // Remover fotos antigas e re-inserir a lista atualizada mantendo a ordem
      await supabase.from('product_images').delete().eq('product_id', productId);

      if (images.length > 0) {
        const imageInserts = images.map((imgUrl: string, idx: number) => ({
          tenant_id: resolvedTenantId,
          product_id: productId,
          storage_path: `products/${productId}/${idx}.jpg`,
          url: imgUrl.trim(),
          is_primary: idx === 0,
          position: idx,
        }));
        await supabase.from('product_images').insert(imageInserts);
      }
    }

    // 4. Atualizar Variantes e Saldos de Estoque
    if (Array.isArray(variantsStock) && variantsStock.length > 0) {
      const restockedSizes: string[] = [];

      for (const item of variantsStock) {
        const qty = Math.max(0, parseInt(String(item.quantity)) || 0);
        if (qty > 0 && item.size) {
          restockedSizes.push(String(item.size));
        }

        if (item.variantId) {
          // Atualizar variante com novos preços e cor
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const varUpdates: any = {
            updated_at: new Date().toISOString(),
          };
          if (color) varUpdates.color = color.trim();
          if (priceCents !== undefined) varUpdates.price_cents = Number(priceCents);
          if (costCents !== undefined) varUpdates.cost_cents = Number(costCents);
          if (wholesalePriceCents !== undefined) varUpdates.wholesale_price_cents = Number(wholesalePriceCents);

          await supabase.from('product_variants').update(varUpdates).eq('id', item.variantId);

          // Atualizar saldo no inventário
          await supabase.from('inventory').upsert(
            {
              tenant_id: resolvedTenantId,
              variant_id: item.variantId,
              quantity: qty,
              min_quantity: 2,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'variant_id' }
          );
        }
      }

      // Notificar clientes em fila de espera
      if (restockedSizes.length > 0) {
        await checkAndNotifyRestockedItems(productId, restockedSizes).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tênis e estoque atualizados com sucesso e com efeito imediato!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar tênis.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
