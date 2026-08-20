'use client';

import { useState } from 'react';
import {
  ShieldAlert,
  Percent,
  CheckCircle2,
  Lock,
  DollarSign,
  Sparkles,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AdminDiscountDialogProps {
  subtotalCents: number;
  tenantId?: string;
  appliedDiscountCents: number;
  onApplyDiscount: (discountCents: number, description?: string) => void;
  onRemoveDiscount: () => void;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function AdminDiscountDialog({
  subtotalCents,
  tenantId,
  appliedDiscountCents,
  onApplyDiscount,
  onRemoveDiscount,
}: AdminDiscountDialogProps) {
  const [open, setOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [percentValue, setPercentValue] = useState<string>('10');
  const [fixedValue, setFixedValue] = useState<string>('50,00');
  const [masterPin, setMasterPin] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Calcular valor do desconto em centavos
  const calculatedDiscountCents = (() => {
    if (discountType === 'percent') {
      const pct = parseFloat(percentValue.replace(',', '.')) || 0;
      if (pct <= 0) return 0;
      const validPct = Math.min(100, Math.max(0, pct));
      return Math.round((subtotalCents * validPct) / 100);
    } else {
      const clean = fixedValue.replace(/[^\d,.]/g, '').replace(',', '.');
      const num = parseFloat(clean);
      if (isNaN(num) || num <= 0) return 0;
      return Math.min(subtotalCents, Math.round(num * 100));
    }
  })();

  const finalTotalCents = Math.max(0, subtotalCents - calculatedDiscountCents);

  async function handleAuthorize(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (calculatedDiscountCents <= 0) {
      setErrorMsg('Informe uma porcentagem ou valor válido de desconto.');
      return;
    }

    if (!masterPin.trim()) {
      setErrorMsg('Digite a senha mestra de admin do dono para autorizar.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pdv/authorize-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_pin',
          tenantId,
          pin: masterPin.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Senha mestra de admin incorreta.');
      } else {
        const desc =
          discountType === 'percent'
            ? `${percentValue}% de desconto autorizado`
            : `${formatMoney(calculatedDiscountCents)} de desconto autorizado`;

        onApplyDiscount(calculatedDiscountCents, desc);
        setSuccessMsg(data.message || 'Desconto autorizado com sucesso!');
        setMasterPin('');

        setTimeout(() => {
          setOpen(false);
          setSuccessMsg(null);
        }, 1200);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao validar autorização.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  const QUICK_PERCENTAGES = [5, 10, 15, 20, 25, 30, 50];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {appliedDiscountCents > 0 ? (
          <button
            type="button"
            className="flex items-center justify-between w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100/80 transition-all"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Desconto Aplicado: <strong>-{formatMoney(appliedDiscountCents)}</strong></span>
            </div>
            <span className="text-[11px] underline text-emerald-700">Alterar / Remover</span>
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 hover:bg-amber-500/25 transition-all text-xs font-black"
          >
            <Percent className="h-3.5 w-3.5 text-amber-700" />
            <span>Aplicar Desconto (Requer Senha do Dono)</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-black text-gray-900">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            Autorização de Desconto (Dono / Admin)
          </DialogTitle>
          <p className="text-xs text-gray-500">
            Defina a porcentagem livre ou valor fixo e autorize com a senha mestra de admin.
          </p>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2 border border-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuthorize} className="space-y-4 pt-1">
          {/* Seletor de Tipo: Porcentagem ou Valor Fixo */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 border">
            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={`py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                discountType === 'percent'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Percent className="h-3.5 w-3.5 text-amber-400" />
              <span>Porcentagem (%)</span>
            </button>

            <button
              type="button"
              onClick={() => setDiscountType('fixed')}
              className={`py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                discountType === 'fixed'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 text-amber-400" />
              <span>Valor em Reais (R$)</span>
            </button>
          </div>

          {/* Campo de Entrada de Desconto */}
          {discountType === 'percent' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Porcentagem de Desconto (% livre):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  required
                  value={percentValue}
                  onChange={(e) => setPercentValue(e.target.value)}
                  placeholder="Ex: 10, 15, 20..."
                  className="w-full rounded-xl border border-gray-300 p-3 pr-10 text-base font-black text-gray-900 focus:border-amber-500 focus:outline-none bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">
                  %
                </span>
              </div>

              {/* Botões de Atalho de % */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_PERCENTAGES.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentValue(String(pct))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all border ${
                      percentValue === String(pct)
                        ? 'bg-amber-500 text-black border-amber-500 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Valor do Desconto em Dinheiro (R$):
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fixedValue}
                  onChange={(e) => setFixedValue(e.target.value)}
                  placeholder="50,00"
                  className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-base font-black text-gray-900 focus:border-amber-500 focus:outline-none bg-white"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">
                  R$
                </span>
              </div>
            </div>
          )}

          {/* Card Resumo do Desconto */}
          <div className="rounded-2xl bg-amber-50/70 p-3.5 border border-amber-200 space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal da Venda:</span>
              <span className="font-semibold">{formatMoney(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-800 font-bold">
              <span>Desconto Solicitado:</span>
              <span>- {formatMoney(calculatedDiscountCents)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black text-gray-900 border-t border-amber-200/80 pt-2">
              <span>Novo Total a Cobrar:</span>
              <span className="text-base text-amber-700 font-mono">
                {formatMoney(finalTotalCents)}
              </span>
            </div>
          </div>

          {/* Campo de Senha Mestra de Admin */}
          <div className="space-y-1.5 border-t border-gray-100 pt-3">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-amber-600" />
              Senha Mestra de Admin do Dono *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={masterPin}
                onChange={(e) => setMasterPin(e.target.value)}
                placeholder="Digite a senha mestra (ex: 123456)..."
                className="w-full rounded-xl border-2 border-amber-400 p-3 pl-10 text-sm font-black text-gray-900 bg-amber-50/40 focus:border-black focus:outline-none"
              />
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
            </div>
            <p className="text-[11px] text-gray-500">
              * Apenas o dono/administrador possui essa senha para liberar o desconto.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2 pt-1">
            <Button
              type="submit"
              disabled={loading || calculatedDiscountCents <= 0}
              className="w-full bg-black text-white hover:bg-zinc-800 py-3.5 text-xs font-black shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              {loading
                ? 'Validando Senha Mestra...'
                : `Autorizar e Aplicar -${formatMoney(calculatedDiscountCents)}`}
            </Button>

            {appliedDiscountCents > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onRemoveDiscount();
                  setOpen(false);
                }}
                className="w-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Remover Desconto Atual
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
