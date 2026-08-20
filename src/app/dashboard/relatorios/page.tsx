import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { requireAppUser } from '@/lib/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PeriodPicker } from '@/components/reports/period-picker';
import { TopSellingSneakersCard } from '@/components/dashboard/top-selling-sneakers-card';
import { fetchTopSellingSneakers } from '@/lib/reports/top-selling';
import { TrendingUp, DollarSign, Package, Wallet, ArrowUpRight } from 'lucide-react';

const METHOD_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  card: 'Cartão',
};

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function rangeFor(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

interface ProfitReportData {
  total_revenue_cents: number;
  total_cost_cents: number;
  gross_profit_cents: number;
  profit_margin_pct: number;
  total_sales_count: number;
  total_pairs_sold: number;
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const user = await requireAppUser();
  const supabase = createClient(cookies());
  const period = searchParams.period ?? 'month';
  const { start, end } = rangeFor(period);

  const [
    { data: financialData },
    topSellingSneakers,
    { data: paymentMethods },
    { data: bySeller },
  ] = await Promise.all([
    supabase.rpc('report_financial_profit', {
      p_start: start.toISOString(),
      p_end: end.toISOString(),
    }),
    fetchTopSellingSneakers(
      supabase,
      user.tenant_id,
      start.toISOString(),
      end.toISOString(),
      10
    ),
    supabase.rpc('report_payment_methods', {
      p_start: start.toISOString(),
      p_end: end.toISOString(),
    }),
    supabase.rpc('report_sales_by_seller', {
      p_start: start.toISOString(),
      p_end: end.toISOString(),
    }),
  ]);

  const financial = (financialData ?? {
    total_revenue_cents: 0,
    total_cost_cents: 0,
    gross_profit_cents: 0,
    profit_margin_pct: 0,
    total_sales_count: 0,
    total_pairs_sold: 0,
  }) as ProfitReportData;

  const payments = (paymentMethods ?? []) as { method: string; total_cents: number; count: number }[];
  const sellers = (bySeller ?? []) as { seller_name: string; total_cents: number; sale_count: number }[];

  const ticketMedioCents =
    financial.total_sales_count > 0
      ? Math.round(financial.total_revenue_cents / financial.total_sales_count)
      : 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Financeiro, Lucros & TOP Vendas</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o faturamento, custos de estoque, margens de lucro e o ranking dos tênis mais vendidos.
          </p>
        </div>
        <PeriodPicker current={period} />
      </div>

      {/* 4 Cards Principais de Lucro e Finanças */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Faturamento Total */}
        <Card className="border-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Faturamento Bruto
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {formatPrice(financial.total_revenue_cents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total recebido no período ({financial.total_sales_count} vendas)
            </p>
          </CardContent>
        </Card>

        {/* Lucro Bruto Real */}
        <Card className="border-2 border-emerald-500/40 bg-emerald-50/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Lucro Bruto Real
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">
              {formatPrice(financial.gross_profit_cents)}
            </div>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Margem de Lucro: {financial.profit_margin_pct}%
            </p>
          </CardContent>
        </Card>

        {/* Custo dos Calçados */}
        <Card className="border-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Custo dos Produtos (CMV)
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {formatPrice(financial.total_cost_cents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor de fábrica dos pares vendidos
            </p>
          </CardContent>
        </Card>

        {/* Volume de Pares & Ticket Médio */}
        <Card className="border-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pares Vendidos
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {financial.total_pairs_sold} {financial.total_pairs_sold === 1 ? 'par' : 'pares'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ticket Médio: <strong className="text-foreground">{formatPrice(ticketMedioCents)}</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO TOP VENDAS COM RANKING VISUAL E FOTOS */}
      <TopSellingSneakersCard topProducts={topSellingSneakers} />

      {/* Tabelas de Desempenho por Pagamento e Vendedor */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formas de pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Recebimentos por Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma venda registrada no período.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forma</TableHead>
                    <TableHead className="text-center">Transações</TableHead>
                    <TableHead className="text-right">Total Recebido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.method}>
                      <TableCell className="font-bold">{METHOD_LABELS[p.method] ?? p.method}</TableCell>
                      <TableCell className="font-mono text-center">{p.count}</TableCell>
                      <TableCell className="font-mono text-right font-black text-foreground">
                        {formatPrice(p.total_cents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Vendas por vendedor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Desempenho por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            {sellers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma venda no período.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor(a)</TableHead>
                    <TableHead className="text-center">Qtd Vendas</TableHead>
                    <TableHead className="text-right">Total Faturado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{s.seller_name}</TableCell>
                      <TableCell className="font-mono text-center font-bold">{s.sale_count}</TableCell>
                      <TableCell className="font-mono text-right font-black text-foreground">
                        {formatPrice(s.total_cents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
