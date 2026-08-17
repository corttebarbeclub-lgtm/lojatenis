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
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  await requireAppUser();
  const supabase = createClient(cookies());
  const period = searchParams.period ?? 'month';
  const { start, end } = rangeFor(period);

  const [{ data: topProducts }, { data: paymentMethods }, { data: bySeller }] = await Promise.all([
    supabase.rpc('report_top_products', {
      p_start: start.toISOString(),
      p_end: end.toISOString(),
      p_limit: 10,
    }),
    supabase.rpc('report_payment_methods', {
      p_start: start.toISOString(),
      p_end: end.toISOString(),
    }),
    supabase.rpc('report_sales_by_seller', {
      p_start: start.toISOString(),
      p_end: end.toISOString(),
    }),
  ]);

  const products = (topProducts ?? []) as {
    product_name: string;
    color: string;
    size: string;
    quantity_sold: number;
    revenue_cents: number;
  }[];
  const payments = (paymentMethods ?? []) as { method: string; total_cents: number; count: number }[];
  const sellers = (bySeller ?? []) as { seller_name: string; total_cents: number; sale_count: number }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Vendas, produtos e formas de pagamento.</p>
        </div>
        <PeriodPicker current={period} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos mais vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda no período.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {p.product_name} — {p.color} {p.size}
                      </TableCell>
                      <TableCell className="font-mono">{p.quantity_sold}</TableCell>
                      <TableCell className="font-mono">{formatPrice(p.revenue_cents)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formas de pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda no período.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forma</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.method}>
                      <TableCell className="font-medium">{METHOD_LABELS[p.method] ?? p.method}</TableCell>
                      <TableCell className="font-mono">{p.count}</TableCell>
                      <TableCell className="font-mono">{formatPrice(p.total_cents)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas por vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            {sellers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda no período.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Vendas</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{s.seller_name}</TableCell>
                      <TableCell className="font-mono">{s.sale_count}</TableCell>
                      <TableCell className="font-mono">{formatPrice(s.total_cents)}</TableCell>
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
