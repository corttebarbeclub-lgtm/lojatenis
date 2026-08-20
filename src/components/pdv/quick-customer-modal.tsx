'use client';

import { useState } from 'react';
import { UserPlus, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Customer } from '@/types/database';

interface QuickCustomerModalProps {
  tenantId?: string;
  onCustomerCreated: (newCustomer: Pick<Customer, 'id' | 'full_name'>) => void;
}

export function QuickCustomerModal({ tenantId, onCustomerCreated }: QuickCustomerModalProps) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Manaus');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Informe o nome do cliente.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/quick-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          city: city.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Erro ao cadastrar cliente.');
      } else {
        setSuccessMsg('Cliente cadastrado com sucesso!');
        onCustomerCreated(data.customer);

        setTimeout(() => {
          setOpen(false);
          setFullName('');
          setPhone('');
          setEmail('');
          setSuccessMsg(null);
        }, 1000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de conexão.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs font-black text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>+ Novo Cliente</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-black text-gray-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Cadastrar Novo Cliente no Caixa
          </DialogTitle>
          <p className="text-xs text-gray-500">
            Cadastro rápido para vincular à venda e registrar histórico de compras.
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
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nome Completo do Cliente *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Ana Paula Ribeiro"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-bold focus:border-amber-500 focus:outline-none bg-white"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                WhatsApp / Celular
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(92) 99999-9999"
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-amber-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cidade (AM)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Manaus"
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-amber-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              E-mail (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-amber-500 focus:outline-none bg-white"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-zinc-800 py-3.5 text-xs font-black shadow-md mt-2"
          >
            {loading ? 'Salvando Cliente...' : 'Salvar e Vincular à Venda'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
