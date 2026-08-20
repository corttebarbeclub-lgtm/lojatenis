import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuickMobileSneakerModal } from '@/components/products/quick-mobile-sneaker-modal';
import { InventoryTableClient, type InventoryItem } from '@/components/inventory/inventory-table-client';
import { Layers, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function EstoquePage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const { data: variants } = await supabase
    .from('product_variants')
    .select(`
      id,
      color,
      size,
      sku,
      barcode,
      price_cents,
      cost_cents,
      wholesale_price_cents,
      is_active,
      product:products (
        id,
        name,
        brand:brands ( name ),
        product_images ( image_url, is_cover, position )
      ),
      inventory ( quantity, min_quantity )
    `)
    .eq('tenant_id', user.tenant_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(600);

  const list: InventoryItem[] = (variants ?? []).map((v) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prod = v.product as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = Array.isArray(v.inventory) ? v.inventory[0] : (v.inventory as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const images = (prod?.product_images as any[]) || [];
    const primaryImage =
      images.find((img) => img.is_cover)?.image_url || images[0]?.image_url || null;

    return {
      id: v.id,
      product_id: prod?.id || '',
      color: v.color,
      size: v.size,
      sku: v.sku,
      barcode: v.barcode,
      price_cents: v.price_cents,
      cost_cents: v.cost_cents || 0,
      wholesale_price_cents: v.wholesale_price_cents || 0,
      product_name: prod?.name ?? '—',
      brand_name: prod?.brand?.name ?? '',
      quantity: inv?.quantity ?? 0,
      min_quantity: inv?.min_quantity ?? 2,
      image_url: primaryImage,
    };
  });

  const totalPairsInStock = list.reduce((sum, v) => sum + v.quantity, 0);
  const totalCostValue = list.reduce((sum, v) => sum + v.cost_cents * v.quantity, 0);
  const totalRetailValue = list.reduce((sum, v) => sum + v.price_cents * v.quantity, 0);
  const distinctModelsCount = new Set(list.map((v) => v.product_name)).size;
  const lowStockList = list.filter((v) => v.quantity <= v.min_quantity);

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Estoque Central</h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-bold">
              HB Tênis Manaus
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Saldo em tempo real de cada numeração e modelo sincronizado com o PDV e a loja virtual.
          </p>
        </div>

        <QuickMobileSneakerModal />
      </div>

      {/* 4 Cards de Métricas do Estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total em Estoque</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{totalPairsInStock} pares</p>
              <p className="text-[11px] text-gray-500 font-semibold">{distinctModelsCount} modelos ativos</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Valor em Custo</p>
              <p className="text-xl font-black text-gray-900 mt-1">{formatMoney(totalCostValue)}</p>
              <p className="text-[11px] text-gray-500 font-semibold">Investimento em mercadoria</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Potencial Venda</p>
              <p className="text-xl font-black text-emerald-700 mt-1">{formatMoney(totalRetailValue)}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Preço cheio no varejo</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={`rounded-2xl border shadow-xs ${lowStockList.length > 0 ? 'border-red-200 bg-red-50/30' : 'border-emerald-200 bg-emerald-50/20'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estoque Baixo</p>
              <p className={`text-2xl font-black mt-1 ${lowStockList.length > 0 ? 'text-red-600' : 'text-emerald-800'}`}>
                {lowStockList.length > 0 ? `${lowStockList.length} grades` : '0 grades'}
              </p>
              <p className={`text-[11px] font-bold ${lowStockList.length > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {lowStockList.length > 0 ? 'Abaixo do estoque mínimo (repor)' : '✅ 100% Abastecido (Tudo em dia)'}
              </p>
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${lowStockList.length > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
              {lowStockList.length > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Interativa com Busca e Filtros de Status */}
      <InventoryTableClient items={list} tenantId={user.tenant_id} />
    </div>
  );
}
