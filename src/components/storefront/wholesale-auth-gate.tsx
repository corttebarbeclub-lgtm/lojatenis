'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWholesaleAuthStore } from '@/lib/stores/wholesale-auth-store';
import { AMAZONAS_CITIES } from '@/lib/shipping/amazonas';
import {
  KeyRound,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
  ArrowRight,
  Sparkles,
  Building2,
  Loader2,
  Check,
  Copy,
} from 'lucide-react';

interface WholesaleAuthGateProps {
  slug: string;
  storeName?: string;
  whatsappNumber?: string | null;
  children: React.ReactNode;
}

type TabType = 'login' | 'register' | 'change_password' | 'forgot_password';

export function WholesaleAuthGate({
  slug,
  children,
}: WholesaleAuthGateProps) {
  const { customer, isAuthenticated, login, logout, setPasswordChanged } = useWholesaleAuthStore();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabType>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulário de Login
  const [loginTaxId, setLoginTaxId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulário de Cadastro
  const [regName, setRegName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regTaxId, setRegTaxId] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('Manaus');
  const [regMonthlyVolume, setRegMonthlyVolume] = useState('20 a 50 pares/mês');
  const [regSalesChannel, setRegSalesChannel] = useState('Loja Física / Ponto Comercial');
  const [regBusinessTime, setRegBusinessTime] = useState('1 a 3 anos');

  // Estado de Validação CNPJ em Tempo Real
  const [isVerifyingCnpj, setIsVerifyingCnpj] = useState(false);
  const [cnpjStatus, setCnpjStatus] = useState<{
    checked: boolean;
    isCnpj: boolean;
    isReal: boolean;
    isActive: boolean;
    isFootwear: boolean;
    companyName?: string;
    city?: string;
    cnaeDesc?: string;
    error?: string;
  } | null>(null);

  // Estado de Sucesso com Auto-Aprovação e Senha Imediata
  const [autoApprovalData, setAutoApprovalData] = useState<{
    taxId: string;
    tempPassword?: string;
    companyName?: string;
    cnaeDesc?: string;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Formulário de Troca de Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Formulário de Esqueci a Senha
  const [forgotTaxId, setForgotTaxId] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Função para checar CNPJ na Receita Federal
  const checkCnpjOnline = useCallback(async (taxIdValue: string) => {
    const clean = taxIdValue.replace(/\D/g, '');
    if (clean.length === 14) {
      setIsVerifyingCnpj(true);
      try {
        const res = await fetch('/api/wholesale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify_cnpj', slug, cnpj: clean }),
        });
        const data = await res.json();
        if (data.success) {
          setCnpjStatus({
            checked: true,
            isCnpj: true,
            isReal: data.isReal,
            isActive: data.isActive,
            isFootwear: data.isFootwearBusiness,
            companyName: data.companyName,
            city: data.city,
            cnaeDesc: data.matchedCnae?.desc,
          });

          // Preencher automaticamente Razão Social e Cidade se retornado
          if (data.companyName && !regCompanyName) {
            setRegCompanyName(data.companyName);
          }
          if (data.city && AMAZONAS_CITIES.some((c) => c.name.toLowerCase() === data.city.toLowerCase())) {
            setRegCity(data.city);
          }
        } else {
          setCnpjStatus({
            checked: true,
            isCnpj: true,
            isReal: false,
            isActive: false,
            isFootwear: false,
            error: data.error,
          });
        }
      } catch {
        setCnpjStatus(null);
      } finally {
        setIsVerifyingCnpj(false);
      }
    } else if (clean.length === 11) {
      setCnpjStatus({
        checked: true,
        isCnpj: false,
        isReal: true,
        isActive: true,
        isFootwear: false,
      });
    } else {
      setCnpjStatus(null);
    }
  }, [slug, regCompanyName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (regTaxId.replace(/\D/g, '').length >= 11) {
        checkCnpjOnline(regTaxId);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [regTaxId, checkCnpjOnline]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E31837] border-t-transparent" />
        </div>
      </div>
    );
  }

  // 1. SE LOGADO E PRECISA TROCAR A SENHA (1º ACESSO OBRIGATÓRIO)
  if (isAuthenticated && customer?.must_change_password) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border-2 border-amber-300 bg-white p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <KeyRound className="h-7 w-7" />
            </div>
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900">
              1º Acesso Obrigatório
            </span>
            <h2 className="text-2xl font-black text-gray-900">
              Defina sua Senha Definitiva
            </h2>
            <p className="text-xs text-gray-500">
              Olá, <strong className="text-gray-900">{customer.company_name || customer.name}</strong>! Por segurança, crie sua senha pessoal de atacadista para continuar.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2 border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErrorMsg(null);

              if (newPassword.length < 4) {
                setErrorMsg('A nova senha deve ter no mínimo 4 caracteres.');
                return;
              }
              if (newPassword !== confirmPassword) {
                setErrorMsg('A confirmação de senha não confere com a nova senha.');
                return;
              }

              setLoading(true);
              try {
                const res = await fetch('/api/wholesale', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'change_password',
                    slug,
                    customerId: customer.id,
                    newPassword,
                  }),
                });
                const data = await res.json();
                if (!data.success) {
                  setErrorMsg(data.error || 'Erro ao alterar senha.');
                } else {
                  setPasswordChanged();
                }
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Erro de conexão.';
                setErrorMsg(message);
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Nova Senha
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#E31837] focus:outline-none focus:ring-2 focus:ring-[#E31837]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Confirme a Nova Senha
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#E31837] focus:outline-none focus:ring-2 focus:ring-[#E31837]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E31837] py-3.5 text-sm font-black text-white hover:bg-[#c4132d] transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Nova Senha e Acessar Atacado'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. SE LOGADO E COM ACESSO COMPLETO
  if (isAuthenticated && customer) {
    return (
      <div className="space-y-6">
        {/* Banner Superior do Lojista Autenticado */}
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-400 border border-amber-400/20">
                  Lojista Atacadista Aprovado
                </span>
                <span className="text-xs text-gray-400">({customer.city || 'Manaus'})</span>
              </div>
              <h2 className="text-lg font-black text-white">
                {customer.company_name || customer.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400">Tabela de Preços</p>
              <p className="text-sm font-black text-emerald-400">Atacado Exclusivo</p>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 px-4 py-2.5 text-xs font-bold text-gray-300 transition-all border border-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair do Atacado</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Protegido (Grid de Atacado) */}
        {children}
      </div>
    );
  }

  // 3. NÃO LOGADO: PORTAL DE ACESSO (LOGIN OU CADASTRO)
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-950 text-amber-400 shadow-inner">
            <Sparkles className="h-7 w-7" />
          </div>
          <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900">
            Portal B2B de Atacado & Revenda
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Preços Exclusivos para Lojistas
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Acesse a tabela direta com margens de até 100% de lucro para revenda em todo o estado do Amazonas.
          </p>
        </div>

        {/* Seletor de Abas */}
        <div className="grid grid-cols-2 rounded-2xl bg-gray-100 p-1.5 text-xs font-bold">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`rounded-xl py-2.5 transition-all ${
              tab === 'login'
                ? 'bg-white text-gray-950 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Já sou Cadastrado (Login)
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`rounded-xl py-2.5 transition-all ${
              tab === 'register'
                ? 'bg-[#E31837] text-white shadow-sm font-black'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Solicitar Acesso / CNPJ
          </button>
        </div>

        {/* Mensagens de Erro */}
        {errorMsg && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2.5 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal de Sucesso com Senha Imediata (CNPJ Aprovado) */}
        {autoApprovalData && (
          <div className="rounded-3xl bg-gradient-to-br from-emerald-950 to-gray-950 text-white p-6 border-2 border-emerald-400 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-gray-950 font-black">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  ⚡ Aprovação Automática Imediata
                </span>
                <h3 className="text-base font-black text-white">
                  {autoApprovalData.companyName || 'CNPJ Verificado com Sucesso'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              Sua empresa foi validada na Receita Federal no ramo calçadista ({autoApprovalData.cnaeDesc || 'Comércio de Calçados'}) e seu acesso ao Atacado foi <strong>LIBERADO AGORA</strong>!
            </p>

            {autoApprovalData.tempPassword && (
              <div className="rounded-2xl bg-white/10 p-4 border border-white/20 space-y-1">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Sua Senha Provisória de Acesso:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-mono font-black text-white tracking-widest">
                    {autoApprovalData.tempPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (autoApprovalData.tempPassword) {
                        navigator.clipboard.writeText(autoApprovalData.tempPassword);
                        setCopiedPassword(true);
                        setTimeout(() => setCopiedPassword(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold text-white transition-all"
                  >
                    {copiedPassword ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedPassword ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setLoginTaxId(autoApprovalData.taxId);
                if (autoApprovalData.tempPassword) setLoginPassword(autoApprovalData.tempPassword);
                setTab('login');
                setAutoApprovalData(null);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-black text-gray-950 hover:bg-emerald-400 transition-all shadow-lg font-mono"
            >
              <span>Entrar no Atacado Agora com Esta Senha</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Mensagens de Sucesso Normais */}
        {successMsg && !autoApprovalData && (
          <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-start gap-2.5 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{successMsg}</p>
              <p className="text-[11px] text-emerald-700">
                Sua solicitação foi registrada no PDV. Assim que aprovada, você receberá a senha de acesso no WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {tab === 'login' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErrorMsg(null);
              setLoading(true);

              try {
                const res = await fetch('/api/wholesale', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'login',
                    slug,
                    taxId: loginTaxId,
                    password: loginPassword,
                  }),
                });
                const data = await res.json();
                if (!data.success) {
                  setErrorMsg(data.error || 'Erro ao entrar no atacado.');
                } else {
                  login(data.customer);
                }
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Erro de conexão.';
                setErrorMsg(message);
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                CPF ou CNPJ do Lojista
              </label>
              <input
                type="text"
                required
                value={loginTaxId}
                onChange={(e) => setLoginTaxId(e.target.value)}
                placeholder="Digite apenas números ou formatado"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#E31837] focus:outline-none focus:ring-2 focus:ring-[#E31837]/20"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot_password');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-[#E31837] font-bold hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Digite sua senha de atacadista"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#E31837] focus:outline-none focus:ring-2 focus:ring-[#E31837]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E31837] py-3.5 text-sm font-black text-white hover:bg-[#c4132d] transition-all shadow-md disabled:opacity-50 hover:-translate-y-0.5"
            >
              {loading ? 'Verificando Cadastro...' : 'Acessar Preços de Atacado'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="pt-4 text-center border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Ainda não tem cadastro aprovado?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-[#E31837] hover:underline"
                >
                  Cadastre seu CNPJ com aprovação imediata aqui
                </button>
              </p>
            </div>
          </form>
        )}

        {/* TAB 2: SOLICITAR ACESSO (FORMULÁRIO INTELIGENTE CNPJ / CPF) */}
        {tab === 'register' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErrorMsg(null);
              setSuccessMsg(null);
              setLoading(true);

              try {
                const res = await fetch('/api/wholesale', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'apply',
                    slug,
                    name: regName,
                    companyName: regCompanyName,
                    taxId: regTaxId,
                    phone: regPhone,
                    email: regEmail,
                    city: regCity,
                    state: 'AM',
                    monthlyVolume: regMonthlyVolume,
                    salesChannel: regSalesChannel,
                    businessTime: regBusinessTime,
                  }),
                });
                const data = await res.json();
                if (!data.success) {
                  setErrorMsg(data.error || 'Erro ao enviar solicitação.');
                } else if (data.isAutoApproved) {
                  setAutoApprovalData({
                    taxId: regTaxId,
                    tempPassword: data.tempPassword,
                    companyName: regCompanyName,
                    cnaeDesc: data.matchedCnae,
                  });
                } else {
                  setSuccessMsg(data.message || 'Solicitação enviada com sucesso!');
                  setTab('login');
                }
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Erro de conexão.';
                setErrorMsg(message);
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            {/* Banner de Regras CNPJ vs CPF */}
            <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <Building2 className="h-4 w-4 text-amber-700" />
                <span>Cadastro B2B: CNPJ Calçadista vs Pessoa Física (CPF)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                • <strong>CNPJ com CNAE de Calçados / Tênis / Artigos Esportivos:</strong> Validação automática na Receita Federal com liberação imediata da senha de acesso.<br />
                • <strong>Pessoa Física (CPF / Autônomo):</strong> Envio para análise e aprovação comercial no PDV da loja.
              </p>
            </div>

            {/* Campo CPF ou CNPJ com Verificação em Tempo Real */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  CPF ou CNPJ *
                </label>
                {isVerifyingCnpj && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Consultando Receita Federal...
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={regTaxId}
                onChange={(e) => setRegTaxId(e.target.value)}
                placeholder="Digite CNPJ da loja ou CPF de revendedor"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#E31837] focus:outline-none"
              />

              {/* Feedback de Validação do CNPJ */}
              {cnpjStatus && cnpjStatus.isCnpj && (
                <div className={`mt-2 rounded-2xl p-3.5 border text-xs space-y-1 ${
                  cnpjStatus.isFootwear && cnpjStatus.isActive
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : cnpjStatus.isActive
                    ? 'bg-blue-50 border-blue-300 text-blue-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {cnpjStatus.isFootwear && cnpjStatus.isActive ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-800">⚡ CNPJ Ativo e Elegível para Aprovação Automática!</span>
                      </>
                    ) : cnpjStatus.isActive ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">CNPJ Ativo na Receita Federal (Análise Rápida no PDV)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-800">Situação Cadastral Inativa ou CNPJ Inválido</span>
                      </>
                    )}
                  </div>
                  {cnpjStatus.companyName && (
                    <p className="text-[11px] text-gray-700">
                      <strong>Razão Social:</strong> {cnpjStatus.companyName}
                    </p>
                  )}
                  {cnpjStatus.cnaeDesc && (
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      <strong>Ramo Detectado:</strong> {cnpjStatus.cnaeDesc}
                    </p>
                  )}
                </div>
              )}

              {cnpjStatus && !cnpjStatus.isCnpj && (
                <p className="text-[11px] text-blue-700 mt-1 font-medium flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />
                  Pessoa Física (CPF): Seu cadastro será avaliado pelo dono no PDV da loja física.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs focus:border-[#E31837] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Razão Social ou Nome Fantasia
                </label>
                <input
                  type="text"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  placeholder="Ex: Silva Calçados Eireli"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs focus:border-[#E31837] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  WhatsApp do Lojista (DDD + Número) *
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="(92) 98188-3786"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs focus:border-[#E31837] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  E-mail Comercial *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="contato@lojatenis.com"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs focus:border-[#E31837] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Cidade / Município do Amazonas *
              </label>
              <select
                value={regCity}
                onChange={(e) => setRegCity(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs bg-white focus:border-[#E31837] focus:outline-none"
              >
                {AMAZONAS_CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name} (AM)
                  </option>
                ))}
              </select>
            </div>

            {/* Perguntas de Qualificação Comercial */}
            <div className="space-y-3 border-t border-gray-100 pt-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  📊 Quantos pares de tênis você vende ou pretende vender por mês? *
                </label>
                <select
                  value={regMonthlyVolume}
                  onChange={(e) => setRegMonthlyVolume(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs bg-white focus:border-[#E31837] focus:outline-none"
                >
                  <option value="10 a 30 pares/mês">10 a 30 pares/mês (Iniciante / Revenda)</option>
                  <option value="30 a 60 pares/mês">30 a 60 pares/mês (Pequeno lojista)</option>
                  <option value="60 a 100 pares/mês">60 a 100 pares/mês (Médio lojista)</option>
                  <option value="Mais de 100 pares/mês">Mais de 100 pares/mês (Grande distribuidor / Rede)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  🏪 Qual é o seu principal canal de vendas? *
                </label>
                <select
                  value={regSalesChannel}
                  onChange={(e) => setRegSalesChannel(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs bg-white focus:border-[#E31837] focus:outline-none"
                >
                  <option value="Loja Física / Ponto Comercial">Loja Física / Ponto Comercial</option>
                  <option value="Loja Virtual / E-commerce">Loja Virtual / E-commerce próprio</option>
                  <option value="Instagram / WhatsApp / Redes">Instagram / WhatsApp / Catálogo Online</option>
                  <option value="Revendedor Autônomo / Porta a Porta">Revendedor Autônomo / Sacoleiro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  ⏱️ Há quanto tempo atua no ramo de calçados? *
                </label>
                <select
                  value={regBusinessTime}
                  onChange={(e) => setRegBusinessTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs bg-white focus:border-[#E31837] focus:outline-none"
                >
                  <option value="Iniciando agora">Iniciando agora</option>
                  <option value="Menos de 1 ano">Menos de 1 ano</option>
                  <option value="1 a 3 anos">1 a 3 anos</option>
                  <option value="Mais de 3 anos">Mais de 3 anos no mercado</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all shadow-md disabled:opacity-50 ${
                cnpjStatus?.isFootwear && cnpjStatus.isActive
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-gray-950 hover:bg-gray-800'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processando Cadastro...</span>
                </>
              ) : cnpjStatus?.isFootwear && cnpjStatus.isActive ? (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Validar CNPJ & Liberar Atacado Automaticamente</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Enviar Solicitação de Atacado</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
              >
                ← Voltar para o Login
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ESQUECI MINHA SENHA */}
        {tab === 'forgot_password' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErrorMsg(null);
              setSuccessMsg(null);
              setLoading(true);

              try {
                const res = await fetch('/api/wholesale', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'forgot_password',
                    slug,
                    taxId: forgotTaxId,
                    phone: forgotPhone,
                  }),
                });
                const data = await res.json();
                if (!data.success) {
                  setErrorMsg(data.error || 'Erro ao solicitar nova senha.');
                } else {
                  setSuccessMsg(data.message || 'Solicitação enviada ao PDV com sucesso!');
                  setTab('login');
                }
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Erro de conexão.';
                setErrorMsg(message);
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-amber-700" />
                Recuperação de Senha de Atacadista
              </p>
              <p className="text-amber-800">
                Informe o seu CPF/CNPJ e seu WhatsApp cadastrado. Um alerta será enviado ao PDV da loja para geração de uma nova senha enviada diretamente no seu celular.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                CPF ou CNPJ Cadastrado
              </label>
              <input
                type="text"
                required
                value={forgotTaxId}
                onChange={(e) => setForgotTaxId(e.target.value)}
                placeholder="Digite seu CPF ou CNPJ"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#E31837] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                WhatsApp para Recebimento da Senha
              </label>
              <input
                type="tel"
                required
                value={forgotPhone}
                onChange={(e) => setForgotPhone(e.target.value)}
                placeholder="(92) 98188-3786"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#E31837] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-black text-gray-950 hover:bg-amber-400 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Solicitar Nova Senha no PDV'}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
              >
                ← Voltar para o Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
