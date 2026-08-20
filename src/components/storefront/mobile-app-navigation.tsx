'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  ShoppingBag,
  User,
  MessageCircle,
} from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { MobileSearchModal } from './mobile-search-modal';

interface MobileAppNavigationProps {
  slug: string;
  whatsappNumber?: string | null;
}

export function MobileAppNavigation({ slug, whatsappNumber }: MobileAppNavigationProps) {
  const pathname = usePathname();
  const openCart = useCartStore((s) => s.openCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const [mounted, setMounted] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? totalItems : 0;
  const isHome = pathname === `/loja/${slug}` || pathname === `/loja/${slug}/`;
  const isAccount = pathname.includes('/minha-conta');
  const isCheckout = pathname.includes('/checkout');

  if (isCheckout) return null;

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Vim pelo site da HB Tênis e gostaria de atendimento.`)}`
    : 'https://wa.me/5592981883786';

  return (
    <>
      <nav
        aria-label="Navegação Mobile"
        className="fixed bottom-0 inset-x-0 z-40 bg-black/95 text-white border-t border-amber-500/20 backdrop-blur-lg shadow-2xl lg:hidden pb-safe max-w-full"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* Início */}
          <Link
            href={`/loja/${slug}`}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              isHome ? 'text-amber-400 font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Home className="h-5 w-5" />
              {isHome && (
                <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">Início</span>
          </Link>

          {/* Busca Rápida */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white transition-all"
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] tracking-tight">Buscar</span>
          </button>

          {/* Minha Conta / Pedidos */}
          <Link
            href={`/loja/${slug}/minha-conta`}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              isAccount ? 'text-amber-400 font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <User className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold tracking-tight text-amber-400">Pedidos</span>
          </Link>

          {/* Carrinho / Sacola */}
          <button
            type="button"
            onClick={openCart}
            className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white transition-all relative"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-black shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Sacola</span>
          </button>

          {/* WhatsApp Suporte */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 text-emerald-400 hover:text-emerald-300 transition-all"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px] tracking-tight font-bold">Whats</span>
          </a>
        </div>
      </nav>

      {/* Modal de Busca Rápida Mobile */}
      <MobileSearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        slug={slug}
      />
    </>
  );
}
