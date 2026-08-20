'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { logout } from '@/app/(auth)/actions';
import { WholesaleAlertsDialog } from '@/components/pdv/wholesale-alerts-dialog';
import type { AppUser } from '@/types/database';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, enabled: true, plan: 'start' },
  { href: '/dashboard/produtos', label: 'Produtos', icon: Package, enabled: true, plan: 'start' },
  { href: '/dashboard/estoque', label: 'Estoque', icon: Boxes, enabled: true, plan: 'start' },
  { href: '/dashboard/pdv', label: 'PDV', icon: ShoppingCart, enabled: true, plan: 'start' },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users, enabled: true, plan: 'start' },
  { href: '/dashboard/pedidos', label: 'Pedidos & Envios', icon: ClipboardList, enabled: false, plan: 'pro' },
  { href: '/dashboard/hero', label: 'Vitrine & Hero', icon: Sparkles, enabled: false, plan: 'pro' },
  { href: '/dashboard/colaboradores', label: 'Colaboradores', icon: Users, enabled: false, plan: 'pro' },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings, enabled: false, plan: 'pro' },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3, enabled: false, plan: 'enterprise' },
];

const ROLE_LABELS: Record<AppUser['role'], string> = {
  owner: 'Dono(a)',
  admin: 'Administrador(a)',
  manager: 'Gerente',
  cashier: 'Caixa',
  seller: 'Vendedor(a)',
  stock: 'Estoque',
  finance: 'Financeiro',
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function DashboardShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/20 md:flex">
        <div className="flex h-16 items-center px-6">
          <span className="text-lg font-semibold tracking-tight">Lojatenis</span>
        </div>
        <Separator />
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.enabled ? item.href : '#'}
                aria-disabled={!item.enabled}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : item.enabled
                      ? 'text-foreground hover:bg-accent'
                      : 'cursor-not-allowed text-muted-foreground/50'
                }`}
                onClick={(e) => {
                  if (!item.enabled) e.preventDefault();
                }}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {!item.enabled && (
                  <Badge variant="outline" className="ml-auto text-[9px] font-black uppercase text-amber-600 bg-amber-50 border-amber-200">
                    {item.plan === 'enterprise' ? 'Enterprise' : 'Plano Pro'}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end gap-4 border-b px-6">
          {/* Alertas Atacado B2B Global */}
          <WholesaleAlertsDialog tenantId={user.tenant_id} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={logout} className="w-full">
                  <button type="submit" className="w-full text-left">
                    Sair
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
