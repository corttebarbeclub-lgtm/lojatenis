'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Building2,
  KeyRound,
  Phone,
  ShieldCheck,
  Send,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface NotificationItem {
  id: string;
  type: 'new_application' | 'forgot_password';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  customer_id: string;
  customer_name: string;
  company_name: string | null;
  tax_id: string;
  phone: string;
  city: string | null;
  monthly_volume: string | null;
  sales_channel: string | null;
  business_time: string | null;
  status: string;
}

interface PendingCustomer {
  id: string;
  name: string;
  company_name: string | null;
  tax_id: string;
  phone: string;
  email: string | null;
  city: string | null;
  monthly_volume: string | null;
  sales_channel: string | null;
  business_time: string | null;
  status: string;
  created_at: string;
}

export function WholesaleAlertsDialog({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingCustomers, setPendingCustomers] = useState<PendingCustomer[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pdv/wholesale-alerts?tenant_id=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setPendingCustomers(data.pending_customers || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error('Erro ao buscar alertas do atacado:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Polling a cada 15s no PDV
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Gerar Senha Aleatória Amigável
  function generateRandomPassword() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefixes = ['TENIS', 'ATACADO', 'AMAZONAS', 'REV', 'MODA'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}-${randomNum}`;
  }

  // 1. Aprovar Cadastro e Enviar Senha via WhatsApp
  async function handleApprove(cust: PendingCustomer | NotificationItem) {
    const generatedPassword = generateRandomPassword();
    setActionLoadingId(cust.id);

    try {
      const customerId = 'customer_id' in cust ? cust.customer_id : cust.id;
      const res = await fetch('/api/pdv/wholesale-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          tenantId,
          customerId,
          tempPassword: generatedPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Formatar Mensagem WhatsApp de Boas-Vindas com Credenciais
        const custName = 'customer_name' in cust ? cust.customer_name : cust.name;
        const companyLabel = cust.company_name ? `${cust.company_name} (${custName})` : custName;
        const msg = `🎉 *CADASTRO DE ATACADO APROVADO — TÊNIS STORE*

Olá, *${companyLabel}*!
Seu acesso exclusivo ao Portal de Atacado B2B foi aprovado com sucesso pela nossa equipe!

🔑 *SUAS CREDENCIAIS DE ACESSO:*
• *Login (CPF/CNPJ):* ${cust.tax_id}
• *Senha Provisória:* *${generatedPassword}*

🌐 *Acesse o portal de atacado:*
http://localhost:3000/loja/tenisstore/atacado

⚠️ *Atenção:* No seu primeiro acesso, o sistema solicitará que você crie sua senha definitiva.

Boas compras e excelentes vendas!`;

        let cleanPhone = cust.phone.replace(/\D/g, '');
        if (!cleanPhone.startsWith('55')) cleanPhone = `55${cleanPhone}`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');

        await fetchAlerts();
      }
    } catch (err) {
      console.error('Erro ao aprovar atacadista:', err);
    } finally {
      setActionLoadingId(null);
    }
  }

  // 2. Redefinir Senha (Esqueci a Senha) e Enviar via WhatsApp
  async function handleResetPassword(notif: NotificationItem) {
    const generatedPassword = generateRandomPassword();
    setActionLoadingId(notif.id);

    try {
      const res = await fetch('/api/pdv/wholesale-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          tenantId,
          customerId: notif.customer_id,
          tempPassword: generatedPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const msg = `🔐 *NOVA SENHA DE ATACADO — TÊNIS STORE*

Olá, *${notif.company_name || notif.customer_name}*!
Recebemos sua solicitação de recuperação de senha no nosso PDV.

🔑 *SUA NOVA SENHA PROVISÓRIA:*
• *Login (CPF/CNPJ):* ${notif.tax_id}
• *Nova Senha:* *${generatedPassword}*

🌐 *Acesse e redefina sua senha:*
http://localhost:3000/loja/tenisstore/atacado

No primeiro login com esta senha, você definirá sua nova senha pessoal.`;

        let cleanPhone = notif.phone.replace(/\D/g, '');
        if (!cleanPhone.startsWith('55')) cleanPhone = `55${cleanPhone}`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');

        await fetchAlerts();
      }
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
    } finally {
      setActionLoadingId(null);
    }
  }

  const hasAlerts = unreadCount > 0 || pendingCustomers.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasAlerts ? 'default' : 'outline'}
          size="sm"
          className={`relative gap-1.5 font-bold ${
            hasAlerts
              ? 'bg-[#E31837] text-white hover:bg-[#c4132d] animate-pulse shadow-md'
              : 'text-gray-700'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Atacado B2B</span>
          {hasAlerts && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-black text-[#E31837]">
              {unreadCount || pendingCustomers.length}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-gray-900">
              <Building2 className="h-5 w-5 text-[#E31837]" />
              Central de Atacadistas & Cadastros B2B
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAlerts}
              disabled={loading}
              className="h-8 gap-1 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Seção 1: Solicitações de Recuperação de Senha (Esqueci a Senha) */}
          {notifications.filter((n) => n.type === 'forgot_password').length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-amber-600" />
                Solicitações de Recuperação de Senha ({notifications.filter((n) => n.type === 'forgot_password').length})
              </h4>

              <div className="space-y-2.5">
                {notifications
                  .filter((n) => n.type === 'forgot_password')
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            {notif.company_name || notif.customer_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            CPF/CNPJ: <strong className="text-gray-900">{notif.tax_id}</strong> • WhatsApp:{' '}
                            <strong className="text-gray-900">{notif.phone}</strong>
                          </p>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {new Date(notif.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/60">
                        <Button
                          size="sm"
                          onClick={() => handleResetPassword(notif)}
                          disabled={actionLoadingId === notif.id}
                          className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1.5 text-xs font-bold shadow-xs"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {actionLoadingId === notif.id
                            ? 'Gerando...'
                            : 'Gerar Nova Senha & Enviar no WhatsApp'}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Seção 2: Novos Atacadistas Solicitando Acesso */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Novos Cadastros Aguardando Avaliação ({pendingCustomers.length})
            </h4>

            {pendingCustomers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500">
                Nenhum novo atacadista aguardando aprovação no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-xs hover:border-gray-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-gray-900">
                            {cust.company_name || cust.name}
                          </span>
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                            {cust.city || 'Manaus'} / AM
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Responsável: <strong className="text-gray-700">{cust.name}</strong> • Documento:{' '}
                          <strong className="text-gray-700">{cust.tax_id}</strong>
                        </p>
                      </div>

                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-bold text-gray-900">{cust.phone}</span>
                      </div>
                    </div>

                    {/* Respostas do Questionário Comercial de Atacado */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-[11px]">
                      <div>
                        <span className="text-gray-400 block font-medium">Vendas Estimadas:</span>
                        <strong className="text-gray-900 font-bold">{cust.monthly_volume || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-medium">Canal de Vendas:</span>
                        <strong className="text-gray-900 font-bold">{cust.sales_channel || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-medium">Tempo de Mercado:</span>
                        <strong className="text-gray-900 font-bold">{cust.business_time || 'Iniciando'}</strong>
                      </div>
                    </div>

                    {/* Botão de Ação: Aprovar & Enviar Senha via WhatsApp */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(cust)}
                        disabled={actionLoadingId === cust.id}
                        className="bg-[#E31837] text-white hover:bg-[#c4132d] gap-1.5 text-xs font-black shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {actionLoadingId === cust.id
                          ? 'Aprovando...'
                          : 'Aprovar Cadastro & Gerar Senha no WhatsApp'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
