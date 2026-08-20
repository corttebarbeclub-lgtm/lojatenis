'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, Sparkles, Mail, Phone, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface StockAlertModalProps {
  productId: string;
  variantId?: string;
  productName: string;
  size: string;
  tenantId?: string;
}

export function StockAlertModal({
  productId,
  variantId,
  productName,
  size,
  tenantId,
}: StockAlertModalProps) {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Informe o seu e-mail para receber o aviso.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/storefront/stock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variantId,
          size,
          customerName: customerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          tenantId,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Erro ao cadastrar alerta.');
      } else {
        setSuccessMsg(data.message || 'Cadastro realizado! Você será avisado assim que o tênis chegar.');
        setTimeout(() => {
          setOpen(false);
          setSuccessMsg(null);
        }, 1800);
      }
    } catch {
      setErrorMsg('Erro de conexão ao salvar alerta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-amber-400 hover:bg-black font-black text-xs flex items-center justify-center gap-2 border border-amber-400/40 shadow-sm transition-all active:scale-98"
        >
          <Bell className="h-4 w-4 fill-amber-400 text-amber-400 animate-bounce" />
          <span>🔔 Avise-me Quando Chegar (Tam {size})</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-black text-gray-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Avise-me Quando Chegar no Estoque
          </DialogTitle>
          <p className="text-xs text-gray-500">
            {productName} • <strong>Tamanho {size}</strong>
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

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Seu Nome</label>
            <div className="relative">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-8 text-xs font-bold focus:border-black focus:outline-none bg-white"
              />
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Seu E-mail *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-8 text-xs font-bold focus:border-black focus:outline-none bg-white"
              />
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp (opcional)</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(92) 99999-9999"
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-8 text-xs focus:border-black focus:outline-none bg-white"
              />
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-zinc-800 py-3.5 text-xs font-black shadow-md mt-2"
          >
            {loading ? 'Cadastrando Alerta...' : 'Cadastrar Alerta Grátis'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
