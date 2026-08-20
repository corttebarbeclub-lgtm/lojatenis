// Funções utilitárias puras para formatação de preços e cálculo de parcelamento

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export interface InstallmentOption {
  installments: number;
  valueCents: number;
  totalWithFeeCents: number;
  feePercent: number;
  hasFee: boolean;
}

/**
 * Helper para calcular parcelas com a regra do cliente:
 * - 1x: À vista sem juros
 * - 2x a 12x: taxa base de 4% + 1% por mês de parcela pago pelo cliente
 *   Ex: 3x -> 4% + 3% = 7% total. Parcela = (Total * 1.07) / 3
 */
export function getInstallments(totalCents: number, maxInstallments = 12): InstallmentOption[] {
  const results: InstallmentOption[] = [];

  for (let i = 1; i <= maxInstallments; i++) {
    if (i === 1) {
      results.push({
        installments: 1,
        valueCents: totalCents,
        totalWithFeeCents: totalCents,
        feePercent: 0,
        hasFee: false,
      });
    } else {
      // Taxa = 4% base + 1% por mês
      const feePercent = 4 + i;
      const totalWithFee = Math.ceil(totalCents * (1 + feePercent / 100));
      const valueCents = Math.ceil(totalWithFee / i);

      results.push({
        installments: i,
        valueCents,
        totalWithFeeCents: totalWithFee,
        feePercent,
        hasFee: true,
      });
    }
  }

  return results;
}
