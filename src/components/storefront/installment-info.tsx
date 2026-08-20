import { formatPrice, getInstallments } from '@/lib/utils/pricing';

interface InstallmentInfoProps {
  priceCents: number;
  maxInstallments?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function InstallmentInfo({
  priceCents,
  maxInstallments = 3,
  size = 'md',
  className = '',
}: InstallmentInfoProps) {
  if (priceCents <= 0) return null;

  const installments = getInstallments(priceCents, Math.max(3, maxInstallments));
  const threeX = installments.find((i) => i.installments === 3);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {threeX ? (
        <p className="text-emerald-700 font-semibold flex items-center gap-1">
          <span>💳</span>
          <span>ou 3x de {formatPrice(threeX.valueCents)}</span>
          <span className="text-[11px] text-gray-500 font-normal">(taxa 7%)</span>
        </p>
      ) : (
        <p className="text-gray-500 text-xs">Até 12x no cartão</p>
      )}
    </div>
  );
}
