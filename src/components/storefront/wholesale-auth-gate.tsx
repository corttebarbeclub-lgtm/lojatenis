'use client';

import { useState, useEffect } from 'react';
import { useWholesaleAuthStore } from '@/lib/stores/wholesale-auth-store';
import { AMAZONAS_CITIES } from '@/lib/shipping/amazonas';
import {
  Lock,
  KeyRound,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
  ArrowRight,
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

  // Formulário de Troca de Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Formulário de Esqueci a Senha
  const [forgotTaxId, setForgotTaxId] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 2. SE LOGADO COM SUCESSO: RENDERIZA O CATÁLOGO COM BARRA DE IDENTIFICAÇÃO DO LOJISTA
  if (isAuthenticated && customer) {
    return (
      <>
        {/* Barra Superior do Lojista Autenticado */}
        <div className="bg-gray-950 text-white py-2 px-4 border-b border-gray-800">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-400">Atacadista Conectado:</span>
              <strong className="text-white font-black">{customer.company_name || customer.name}</strong>
              <span className="text-gray-500">({customer.tax_id})</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-bold hidden md:inline">
                ✓ Preços de Fábrica Liberados
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 font-bold transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair do Atacado
              </button>
            </div>
          </div>
        </div>

        {children}
      </>
    );
  }

  // 3. NÃO LOGADO: RENDERIZA O PORTAL FECHADO COM TABS (LOGIN, SOLICITAR CADASTRO, ESQUECI SENHA)
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Banner Superior Exclusivo B2B */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-950 via-slate-900 to-red-950 text-white p-8 sm:p-12 shadow-2xl mb-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-600/30 backdrop-blur-md px-3.5 py-1 text-xs font-black uppercase tracking-wider text-red-200 border border-red-500/30">
            <Lock className="h-3.5 w-3.5 text-red-400" />
            Portal Atacado B2B — Acesso Restrito a Lojistas e Revendedores
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white">
            Preços de Fábrica & Margens de até 60% para Sua Loja
          </h1>

          <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed">
            O catálogo com valores de atacado e montador de grade é exclusivo para parceiros autorizados.
            Forneça seu CPF/CNPJ e senha de acesso abaixo ou solicite seu cadastro comercial.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-bold">
            <div className="rounded-xl bg-white/10 p-3 border border-white/10 backdrop-blur-xs">
              📦 Estoque Central Único
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10 backdrop-blur-xs">
              🚀 Manaus R$ 1,00
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10 backdrop-blur-xs">
              🚢 Interior AM R$ 100
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10 backdrop-blur-xs">
              🛡️ 100% Originais c/ NF
            </div>
          </div>
        </div>
      </div>

      {/* Caixa Central de Autenticação / Cadastro */}
      <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        {/* Abas de Navegação */}
        <div className="flex border-b border-gray-200 bg-gray-50/80">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-wider transition-all ${
              tab === 'login'
                ? 'border-b-2 border-[#E31837] bg-white text-[#E31837]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            1. Já Sou Lojista (Entrar)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-wider transition-all ${
              tab === 'register'
                ? 'border-b-2 border-[#E31837] bg-white text-[#E31837]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            2. Solicitar Acesso ao Atacado
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2 border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-start gap-2 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{successMsg}</p>
                <p className="text-[11px] text-emerald-700">
                  Um alerta foi enviado ao PDV da loja. Assim que aprovado, você receberá a senha de acesso no WhatsApp.
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
                    Solicitar acesso ao atacado aqui
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: SOLICITAR ACESSO (FORMULÁRIO DE QUALIFICAÇÃO) */}
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
              <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-700" />
                  Avaliação Comercial de Novo Comprador
                </p>
                <p className="text-blue-700">
                  Preencha as informações abaixo. Nossa equipe avaliará seu perfil e enviará sua senha de acesso diretamente no seu WhatsApp.
                </p>
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
                    CPF ou CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={regTaxId}
                    onChange={(e) => setRegTaxId(e.target.value)}
                    placeholder="000.000.000-00 ou CNPJ"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs focus:border-[#E31837] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    WhatsApp (DDD + Número) *
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs focus:border-[#E31837] focus:outline-none"
                  />
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 py-3.5 text-sm font-black text-white hover:bg-gray-800 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Enviando Dados...' : 'Enviar Solicitação para Avaliação no PDV'}
                <UserCheck className="h-4 w-4" />
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E31837] py-3.5 text-sm font-black text-white hover:bg-[#c4132d] transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Enviando Alerta ao PDV...' : 'Solicitar Nova Senha ao PDV'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
                >
                  ← Voltar para a tela de Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
