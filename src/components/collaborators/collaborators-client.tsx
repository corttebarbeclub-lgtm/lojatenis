'use client';

import { useState } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Plus,
  KeyRound,
  UserCheck,
  UserX,
  Sparkles,
  Phone,
  Mail,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Collaborator } from '@/app/dashboard/colaboradores/page';

interface PermissionOption {
  key: string;
  label: string;
  description: string;
  category: 'vendas' | 'estoque' | 'financeiro' | 'admin';
}

const ALL_PERMISSIONS: PermissionOption[] = [
  // Vendas e Atendimento
  {
    key: 'pdv_sales',
    label: 'Realizar Vendas no PDV (Caixa)',
    description: 'Permite abrir o caixa, lançar produtos e fechar vendas.',
    category: 'vendas',
  },
  {
    key: 'manage_customers',
    label: 'Cadastrar & Consultar Clientes',
    description: 'Permite cadastrar novos clientes no balcão e ver histórico.',
    category: 'vendas',
  },
  {
    key: 'grant_discounts',
    label: 'Conceder Desconto Sem Senha do Dono',
    description: 'Permite dar desconto livre no caixa sem exigir a senha mestra do dono.',
    category: 'vendas',
  },

  // Estoque e Produtos
  {
    key: 'view_stock',
    label: 'Visualizar Saldo de Estoque Central',
    description: 'Permite consultar a quantidade de pares por tamanho e modelo.',
    category: 'estoque',
  },
  {
    key: 'manage_stock',
    label: 'Entrada / Ajuste de Estoque (+ Novo Tênis)',
    description: 'Permite dar entrada em lotes de tênis e bater fotos.',
    category: 'estoque',
  },
  {
    key: 'manage_products',
    label: 'Cadastrar / Editar Modelos e Preços',
    description: 'Permite criar produtos e alterar preços de varejo/custo/atacado.',
    category: 'estoque',
  },

  // Financeiro e Relatórios
  {
    key: 'view_revenue',
    label: 'Visualizar Faturamento e Vendas Globais',
    description: 'Permite ver o total de vendas do dia e histórico financeiro.',
    category: 'financeiro',
  },
  {
    key: 'view_profits',
    label: 'Visualizar Lucros e Custos de Mercadoria (CMV)',
    description: 'Acesso restrito: exibe a margem de lucro real e custo de fábrica.',
    category: 'financeiro',
  },

  // Administração e Atacado
  {
    key: 'manage_wholesale',
    label: 'Aprovar Atacadistas B2B & Enviar Senhas',
    description: 'Permite avaliar solicitações de atacado e enviar senhas via WhatsApp.',
    category: 'admin',
  },
  {
    key: 'manage_collaborators',
    label: 'Gerenciar Colaboradores & Configurações',
    description: 'Permite cadastrar e alterar permissões de outros funcionários.',
    category: 'admin',
  },
];

// Perfis Pré-configurados
const PRESET_PROFILES = {
  restricted_sales: {
    name: 'Operador de Caixa / Vendedor (Acesso Restrito Total)',
    icon: ShieldAlert,
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    description:
      'Acesso estritamente às vendas no PDV. Totalmente bloqueado para faturamento, estoque, lucros e configurações. Descontos e dados financeiros exigem senha do dono.',
    defaultPermissions: ['pdv_sales', 'manage_customers'],
  },
  manager: {
    name: 'Gerente / Estoquista (Intermediário)',
    icon: Shield,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description:
      'Acesso ao PDV, Clientes, Entrada de Estoque, Cadastro de Produtos e Faturamento Operacional. Margem de lucro real e configurações do sistema continuam protegidas.',
    defaultPermissions: [
      'pdv_sales',
      'manage_customers',
      'view_stock',
      'manage_stock',
      'manage_products',
      'view_revenue',
    ],
  },
  full_access: {
    name: 'Administrador / Dono (Full Access)',
    icon: ShieldCheck,
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    description:
      'Acesso 100% irrestrito a todos os recursos: Lucro Real, Faturamento, Estoque Central, Atacado B2B, Descontos e Configurações.',
    defaultPermissions: ALL_PERMISSIONS.map((p) => p.key),
  },
};

export function CollaboratorsClient({
  initialCollaborators,
  tenantId,
}: {
  initialCollaborators: Collaborator[];
  tenantId: string;
}) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const [openModal, setOpenModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);

  // Campos do Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('123456');
  const [roleProfile, setRoleProfile] = useState<'restricted_sales' | 'manager' | 'full_access'>(
    'restricted_sales'
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    PRESET_PROFILES.restricted_sales.defaultPermissions
  );
  const [loading, setLoading] = useState(false);

  // Mudar perfil pré-configurado
  function handleSelectProfile(profile: 'restricted_sales' | 'manager' | 'full_access') {
    setRoleProfile(profile);
    setSelectedPermissions(PRESET_PROFILES[profile].defaultPermissions);
  }

  // Toggle de checkbox individual
  function togglePermission(key: string) {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  function openCreateModal() {
    setEditingCollaborator(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('123456');
    handleSelectProfile('restricted_sales');
    setOpenModal(true);
  }

  function openEditModal(c: Collaborator) {
    setEditingCollaborator(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone || '');
    setPassword(c.password_hash);
    setRoleProfile(c.role_profile);
    setSelectedPermissions(c.permissions || []);
    setOpenModal(true);
  }

  async function handleSaveCollaborator(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCollaborator) {
        // Atualizar
        const res = await fetch('/api/admin/collaborators', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCollaborator.id,
            name,
            phone,
            password,
            roleProfile,
            permissions: selectedPermissions,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setCollaborators((prev) =>
            prev.map((item) => (item.id === editingCollaborator.id ? data.collaborator : item))
          );
          toast.success('Colaborador atualizado com sucesso!');
          setOpenModal(false);
        } else {
          toast.error(data.error || 'Erro ao atualizar colaborador.');
        }
      } else {
        // Criar
        const res = await fetch('/api/admin/collaborators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            name,
            email,
            phone,
            password,
            roleProfile,
            permissions: selectedPermissions,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setCollaborators((prev) => [...prev, data.collaborator]);
          toast.success('Novo colaborador cadastrado com sucesso!');
          setOpenModal(false);
        } else {
          toast.error(data.error || 'Erro ao cadastrar colaborador.');
        }
      }
    } catch {
      toast.error('Erro de conexão ao salvar colaborador.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(c: Collaborator) {
    try {
      const nextActive = !c.is_active;
      const res = await fetch('/api/admin/collaborators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: c.id,
          isActive: nextActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCollaborators((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, is_active: nextActive } : item))
        );
        toast.success(nextActive ? 'Colaborador ativado!' : 'Colaborador desativado.');
      }
    } catch {
      toast.error('Erro ao alterar status.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente remover este colaborador?')) return;

    try {
      const res = await fetch(`/api/admin/collaborators?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCollaborators((prev) => prev.filter((item) => item.id !== id));
        toast.success('Colaborador removido.');
      }
    } catch {
      toast.error('Erro ao excluir colaborador.');
    }
  }

  const restrictedCount = collaborators.filter((c) => c.role_profile === 'restricted_sales').length;
  const managerCount = collaborators.filter((c) => c.role_profile === 'manager').length;
  const fullAccessCount = collaborators.filter((c) => c.role_profile === 'full_access').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Gestão de Colaboradores & Permissões
            </h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-bold">
              Controle de Acesso
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cadastre funcionários, defina senhas e controle exatamente o que cada usuário pode acessar ou operar.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-black text-white hover:bg-zinc-800 font-black gap-1.5 shadow-md self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Novo Colaborador</span>
        </Button>
      </div>

      {/* Cards de Métricas por Perfil */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="rounded-2xl border-red-200 bg-red-50/40 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-800 uppercase tracking-wider">
                Acesso Restrito (Vendas)
              </p>
              <p className="text-2xl font-black text-gray-900 mt-1">{restrictedCount} usuários</p>
              <p className="text-[11px] text-gray-500 font-semibold">Sem dados financeiros</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-blue-200 bg-blue-50/40 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Gerentes / Estoquistas
              </p>
              <p className="text-2xl font-black text-gray-900 mt-1">{managerCount} usuários</p>
              <p className="text-[11px] text-gray-500 font-semibold">Acesso intermediário</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-200 bg-amber-50/40 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Administradores (Full)
              </p>
              <p className="text-2xl font-black text-gray-900 mt-1">{fullAccessCount} usuários</p>
              <p className="text-[11px] text-gray-500 font-semibold">Acesso total do dono</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Colaboradores */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
          <Users className="h-4 w-4 text-amber-600" />
          Colaboradores Cadastrados ({collaborators.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {collaborators.map((c) => {
            const profileMeta = PRESET_PROFILES[c.role_profile] || PRESET_PROFILES.restricted_sales;
            const ProfileIcon = profileMeta.icon;

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{c.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        <Mail className="h-3 w-3" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Phone className="h-3 w-3" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${profileMeta.badgeColor}`}
                    >
                      <ProfileIcon className="h-3 w-3 mr-1" />
                      {c.role_profile === 'restricted_sales'
                        ? 'Vendas / Caixa'
                        : c.role_profile === 'manager'
                        ? 'Gerente'
                        : 'Admin'}
                    </Badge>
                  </div>

                  {/* Resumo de Permissões */}
                  <div className="border-t border-gray-100 pt-2 text-[11px] text-gray-600 space-y-1">
                    <p className="font-bold text-gray-700">Permissões Ativas ({c.permissions?.length || 0}/10):</p>
                    <div className="flex flex-wrap gap-1">
                      {(c.permissions || []).map((permKey) => {
                        const perm = ALL_PERMISSIONS.find((p) => p.key === permKey);
                        return (
                          <span
                            key={permKey}
                            className="text-[9px] font-bold bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded"
                          >
                            {perm?.label?.split('(')[0] || permKey}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleStatus(c)}
                      className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                        c.is_active
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {c.is_active ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                      <span>{c.is_active ? 'Ativo' : 'Inativo'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(c)}
                      className="h-7 text-xs font-bold"
                    >
                      Editar Acesso
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="h-7 w-7 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE COLABORADOR */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center gap-2 text-base font-black text-gray-900">
              <Sparkles className="h-5 w-5 text-amber-500" />
              {editingCollaborator ? 'Editar Colaborador & Permissões' : 'Cadastrar Novo Colaborador'}
            </DialogTitle>
            <p className="text-xs text-gray-500">
              Configure as credenciais e selecione as opções do que este usuário poderá acessar no sistema.
            </p>
          </DialogHeader>

          <form onSubmit={handleSaveCollaborator} className="space-y-4 pt-1">
            {/* Dados Básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome Completo do Funcionário *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lucas Ferreira"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-bold focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  E-mail de Acesso (Login) *
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingCollaborator}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lucas@lojatenis.com"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-black focus:outline-none disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  WhatsApp / Celular
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(92) 99999-9999"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Senha de Acesso ao Sistema *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha de login"
                    className="w-full rounded-xl border border-gray-300 p-2.5 pl-8 text-xs font-mono font-bold focus:border-black focus:outline-none"
                  />
                  <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* SELEÇÃO DE PERFIL PRÉ-CONFIGURADO */}
            <div className="space-y-2 border-t border-gray-100 pt-3">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1">
                <Shield className="h-4 w-4 text-amber-600" />
                Escolha um Perfil de Acesso Pré-configurado:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Opção 1: Restrito Total */}
                <div
                  onClick={() => handleSelectProfile('restricted_sales')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                    roleProfile === 'restricted_sales'
                      ? 'border-red-500 bg-red-50/60 ring-1 ring-red-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="font-black text-xs text-gray-900 leading-tight">
                      Acesso Restrito (Vendas)
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug">
                    Apenas PDV/Vendas. Bloqueia financeiro, estoque e faturamento.
                  </p>
                </div>

                {/* Opção 2: Intermediário */}
                <div
                  onClick={() => handleSelectProfile('manager')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                    roleProfile === 'manager'
                      ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="font-black text-xs text-gray-900 leading-tight">
                      Gerente / Estoque
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug">
                    PDV, Estoque, Produtos e Faturamento. Margem de lucro bloqueada.
                  </p>
                </div>

                {/* Opção 3: Full Access */}
                <div
                  onClick={() => handleSelectProfile('full_access')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                    roleProfile === 'full_access'
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span className="font-black text-xs text-gray-900 leading-tight">
                      Administrador (Full)
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug">
                    Acesso total e irrestrito a todos os módulos e lucros.
                  </p>
                </div>
              </div>
            </div>

            {/* CHECKBOXES DE PERMISSÕES GRANULARES */}
            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Permissões Granulares ({selectedPermissions.length}/10 ativas):
                </label>
                <span className="text-[10px] text-gray-500">
                  Marque ou desmarque conforme a função do funcionário
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border rounded-xl bg-zinc-50/50">
                {ALL_PERMISSIONS.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-white border-amber-300 shadow-xs'
                          : 'bg-transparent border-transparent hover:bg-white/80 opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.key)}
                        className="mt-0.5 h-4 w-4 rounded text-black focus:ring-black accent-black"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 leading-tight">{perm.label}</p>
                        <p className="text-[10px] text-gray-500 leading-snug mt-0.5">
                          {perm.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Botão de Gravação */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-zinc-800 py-3.5 text-xs font-black shadow-lg mt-2"
            >
              {loading ? 'Salvando Colaborador...' : 'Salvar Colaborador & Ativar Permissões'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
