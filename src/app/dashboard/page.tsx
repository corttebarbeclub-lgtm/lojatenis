import { cookies } from 'next/headers';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuickMobileSneakerModal } from '@/components/products/quick-mobile-sneaker-modal';
import { TopSellingSneakersCard } from '@/components/dashboard/top-selling-sneakers-card';
import { fetchTopSellingSneakers } from '@/lib/reports/top-selling';
import {
  ShoppingCart,
  TrendingUp,
  Boxes,
  BarChart3,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function startOfDayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function DashboardPage() {
  const user = await requireAppUser();
  const supabase = createClient(cookies());

  const [
    { data: salesToday },
    { data: salesMonth },
    { data: lowStock },
    { data: monthProfit },
    topSneakers,
  ] = await Promise.all([
    supabase
      .from('sales')
      .select('total_cents')
      .eq('tenant_id', user.tenant_id)
      .eq('status', 'completed')
      .gte('created_at', startOfDayISO()),
    supabase
      .from('sales')
      .select('total_cents')
      .eq('tenant_id', user.tenant_id)
      .eq('status', 'completed')
      .gte('created_at', startOfMonthISO()),
    supabase
      .from('inventory')
      .select('quantity, min_quantity')
      .eq('tenant_id', user.tenant_id),
    supabase.rpc('report_financial_profit', {
      p_start: startOfMonthISO(),
      p_end: new Date().toISOString(),
    }),
    fetchTopSellingSneakers(supabase, user.tenant_id, startOfMonthISO(), new Date().toISOString(), 8),
  ]);

  const todayList = salesToday ?? [];
  const monthList = salesMonth ?? [];
  const todayTotalCents = todayList.reduce((sum, s) => sum + s.total_cents, 0);
  const monthTotalCents = monthList.reduce((sum, s) => sum + s.total_cents, 0);
  const lowStockCount = (lowStock ?? []).filter((i) => i.quantity <= i.min_quantity).length;

  const profitInfo = (monthProfit ?? {
    gross_profit_cents: 0,
    profit_margin_pct: 0,
    total_pairs_sold: 0,
  }) as {
    gross_profit_cents: number;
    profit_margin_pct: number;
    total_pairs_sold: number;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar com Ações Rápidas Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-amber-500">HB TÊNIS MANAUS</span>
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-900 border-amber-300 font-bold">
              Painel do Dono / Admin
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-0.5">
            Olá, {user.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-muted-foreground">
            Gerencie vendas no celular, consulte estoques, veja lucros e lance novos modelos.
          </p>
        </div>

        {/* Botões Rápidos de Ação (Acessíveis em 1 toque) */}
        <div className="flex items-center gap-2 flex-wrap">
          <QuickMobileSneakerModal />

          <Button asChild size="sm" className="bg-black text-white hover:bg-zinc-800 font-black gap-1.5 shadow-md">
            <Link href="/dashboard/pdv">
              <ShoppingCart className="h-4 w-4 text-amber-400" />
              <span>Abrir Caixa PDV</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards Financeiros Principais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Vendas Hoje */}
        <Card className="border-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="font-bold text-xs uppercase text-muted-foreground">
              Vendas Hoje
            </CardDescription>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-black">{formatPrice(todayTotalCents)}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {todayList.length} venda(s) registrada(s)
            </p>
          </CardContent>
        </Card>

        {/* Lucro Bruto do Mês */}
        <Card className="border-2 border-emerald-500/40 bg-emerald-50/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="font-bold text-xs uppercase text-emerald-800">
              Lucro Bruto (Mês)
            </CardDescription>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-black text-emerald-700">
              {formatPrice(profitInfo.gross_profit_cents)}
            </CardTitle>
            <p className="text-xs font-bold text-emerald-600 mt-1">
              Margem de Lucro: {profitInfo.profit_margin_pct}%
            </p>
          </CardContent>
        </Card>

        {/* Vendas no Mês */}
        <Card className="border-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="font-bold text-xs uppercase text-muted-foreground">
              Faturamento no Mês
            </CardDescription>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-black">{formatPrice(monthTotalCents)}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {profitInfo.total_pairs_sold} pares vendidos
            </p>
          </CardContent>
        </Card>

        {/* Estoque e Alertas */}
        <Card className="border-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="font-bold text-xs uppercase text-muted-foreground">
              Estoque Baixo
            </CardDescription>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Boxes className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="flex items-center gap-2 text-2xl font-black">
              {lowStockCount}
              {lowStockCount > 0 ? (
                <Badge variant="destructive" className="text-xs">Atenção</Badge>
              ) : (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300">Em dia</Badge>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/dashboard/estoque" className="underline underline-offset-4 font-bold text-amber-700">
                Consultar estoque completo →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO PRINCIPAL: TOP TÊNIS MAIS VENDIDOS */}
      <TopSellingSneakersCard topProducts={topSneakers} />

      {/* Atalhos Rápidos para o Dono */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/pdv"
          className="group flex flex-col justify-between rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-xs hover:border-black hover:shadow-md transition-all"
        >
          <div className="space-y-1">
            <ShoppingCart className="h-6 w-6 text-amber-500 mb-2" />
            <h3 className="font-black text-sm text-gray-900 group-hover:text-amber-600 transition-colors">
              Fazer Venda Rápida (PDV Mobile)
            </h3>
            <p className="text-xs text-muted-foreground">
              Venda na loja ou pelo celular em qualquer lugar com baixa imediata no estoque central.
            </p>
          </div>
          <div className="pt-3 flex items-center text-xs font-bold text-gray-900 gap-1">
            <span>Abrir Caixa</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/colaboradores"
          className="group flex flex-col justify-between rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-xs hover:border-black hover:shadow-md transition-all"
        >
          <div className="space-y-1">
            <ShieldCheck className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-black text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
              Colaboradores & Permissões
            </h3>
            <p className="text-xs text-muted-foreground">
              Controle quem pode vender, ver estoque ou dar descontos apenas com a sua senha.
            </p>
          </div>
          <div className="pt-3 flex items-center text-xs font-bold text-gray-900 gap-1">
            <span>Gerenciar Equipe</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/relatorios"
          className="group flex flex-col justify-between rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-xs hover:border-black hover:shadow-md transition-all"
        >
          <div className="space-y-1">
            <TrendingUp className="h-6 w-6 text-emerald-600 mb-2" />
            <h3 className="font-black text-sm text-gray-900 group-hover:text-emerald-600 transition-colors">
              Relatório Financeiro & Lucros
            </h3>
            <p className="text-xs text-muted-foreground">
              Veja lucros reais, custo de mercadoria vendida, faturamento e formas de pagamento.
            </p>
          </div>
          <div className="pt-3 flex items-center text-xs font-bold text-gray-900 gap-1">
            <span>Ver Lucros</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
