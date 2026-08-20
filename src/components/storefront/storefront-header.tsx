'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Heart,
  ShoppingCart,
  Menu,
  X,
  Phone,
  Flame,
  ChevronDown,
  Sparkles,
  User,
} from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { CartDrawer } from './cart-drawer';
import { MobileAppNavigation } from './mobile-app-navigation';
import { useState, useEffect } from 'react';

interface StorefrontHeaderProps {
  storeName: string;
  slug: string;
  whatsappNumber?: string | null;
  activePage?: 'varejo' | 'atacado';
}

export function StorefrontHeader({
  storeName,
  slug,
  whatsappNumber,
  activePage = 'varejo',
}: StorefrontHeaderProps) {
  const openCart = useCartStore((s) => s.openCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cepModalOpen, setCepModalOpen] = useState(false);
  const [userCep, setUserCep] = useState('69000-000');
  const [tempCep, setTempCep] = useState('');

  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? totalItems : 0;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Vim pelo site da ${storeName} e gostaria de atendimento.`)}`
    : null;

  function handleSaveCep(e: React.FormEvent) {
    e.preventDefault();
    if (tempCep.trim()) {
      setUserCep(tempCep.trim());
      setCepModalOpen(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-black text-white border-b border-amber-500/20 shadow-xl">
        {/* Top Mini Promo Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black py-1 px-4 text-center text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>HB TÊNIS MANAUS • FRETE R$ 15,00 PARA MANAUS • ENVIOS PARA TODO O AMAZONAS</span>
          <Sparkles className="h-3.5 w-3.5" />
        </div>

        {/* Top Header Bar — HB Tênis Manaus Sneakerhead Layout */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between gap-4 lg:gap-8">
            {/* Mobile menu toggle */}
            <button
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo Oficial HB Tênis Manaus */}
            <Link href={`/loja/${slug}`} className="flex items-center gap-3 flex-shrink-0 group">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full border-2 border-amber-400 shadow-lg shadow-amber-500/20 transition-transform group-hover:scale-105 bg-black">
                <Image
                  src="/hb-logo.png"
                  alt="HB Tênis Manaus"
                  width={56}
                  height={56}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black italic tracking-tighter text-white sm:text-2xl leading-none flex items-center gap-1.5">
                  <span className="text-amber-400">HB</span> TÊNIS
                </span>
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                  MANAUS • SNEAKERS & STREETWEAR
                </span>
              </div>
            </Link>

            {/* Barra de Busca Centralizada Escura com Borda Dourada */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <form action={`/loja/${slug}`} method="GET" className="relative">
                <input
                  type="search"
                  name="q"
                  placeholder="Buscar Air Jordan, Dunk, Yeezy, Samba, TN, Mizuno..."
                  className="w-full rounded-full border border-zinc-700 bg-zinc-900/90 py-3 pl-5 pr-12 text-sm text-white placeholder:text-zinc-400 focus:border-amber-400 focus:bg-black focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:brightness-110 transition-all shadow-md"
                  aria-label="Buscar"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Ações da Direita */}
            <div className="flex items-center gap-3 lg:gap-5">
              {/* Switcher Varejo / Atacado B2B */}
              <div className="hidden xl:flex items-center rounded-full bg-zinc-900 p-1 border border-zinc-800">
                <Link
                  href={`/loja/${slug}`}
                  className={`px-3.5 py-1 rounded-full text-xs font-black transition-all ${
                    activePage === 'varejo'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Varejo
                </Link>
                <Link
                  href={`/loja/${slug}/atacado`}
                  className={`px-3.5 py-1 rounded-full text-xs font-black transition-all ${
                    activePage === 'atacado'
                      ? 'bg-zinc-800 text-amber-400 shadow-md border border-amber-400/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Atacado B2B
                </Link>
              </div>

              {/* Entrega ou Retirada / CEP */}
              <button
                onClick={() => setCepModalOpen(true)}
                className="hidden lg:flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
              >
                <MapPin className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="text-zinc-400 block">Entrega expressa</span>
                  <span className="font-bold text-white flex items-center gap-0.5">
                    {userCep === '69000-000' ? 'Manaus / AM' : `CEP ${userCep}`}
                    <ChevronDown className="h-3 w-3 text-zinc-400" />
                  </span>
                </div>
              </button>

              {/* Atendimento WhatsApp */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-black text-white hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>(92) 98188-3786</span>
                </a>
              )}

              {/* Minha Conta / Meus Pedidos */}
              <Link
                href={`/loja/${slug}/minha-conta`}
                className="hidden md:flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-amber-400 px-3.5 py-2 text-xs font-black text-white hover:text-amber-400 transition-all"
              >
                <User className="h-4 w-4 text-amber-400" />
                <span>Meus Pedidos</span>
              </Link>

              {/* Favoritos */}
              <Link
                href={`/loja/${slug}/minha-conta`}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-rose-500 transition-colors"
                aria-label="Favoritos"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Carrinho de Compras */}
              <button
                onClick={openCart}
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 hover:border-amber-400 text-white transition-all shadow-md"
                aria-label="Carrinho de Compras"
              >
                <ShoppingCart className="h-5 w-5 text-amber-400" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-black text-black shadow-md animate-in zoom-in duration-200">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>


          {/* Barra de Busca Mobile */}
          <div className="pb-3 md:hidden">
            <form action={`/loja/${slug}`} method="GET" className="relative">
              <input
                type="search"
                name="q"
                placeholder="O que você procura? (ex: Jordan, Nike, Samba...)"
                className="w-full rounded-full border border-zinc-700 bg-zinc-900 py-2.5 pl-4 pr-11 text-xs text-white placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-black font-bold"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Menu de Categorias Horizontal — HB Sneakerhead Navigation Bar */}
        <div className="hidden lg:block border-t border-zinc-800 bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <nav className="flex items-center justify-between gap-6 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-300">
              <Link href={`/loja/${slug}`} className="hover:text-amber-400 transition-colors">
                🔥 Todos os Sneakers
              </Link>
              <Link href={`/loja/${slug}?brand=nike`} className="text-amber-400 font-black hover:underline flex items-center gap-1">
                <span>Jordan & Nike Heat</span>
              </Link>
              <Link href={`/loja/${slug}?brand=adidas`} className="hover:text-amber-400 transition-colors">
                Adidas Retrô & Samba
              </Link>
              <Link href={`/loja/${slug}?brand=new balance`} className="hover:text-amber-400 transition-colors">
                New Balance 550/9060
              </Link>
              <Link href={`/loja/${slug}?category=corrida`} className="hover:text-amber-400 transition-colors">
                Corrida & Performance
              </Link>
              <Link href={`/loja/${slug}?category=casual`} className="hover:text-amber-400 transition-colors">
                Casual / Streetwear
              </Link>
              <Link href={`/loja/${slug}?category=skateboard`} className="hover:text-amber-400 transition-colors">
                Skateboard & Vans
              </Link>
              <Link href={`/loja/${slug}?gender=masculino`} className="hover:text-amber-400 transition-colors">
                Masculino
              </Link>
              <Link href={`/loja/${slug}?gender=feminino`} className="hover:text-amber-400 transition-colors">
                Feminino
              </Link>
              <Link href={`/loja/${slug}/atacado`} className="flex items-center gap-1 text-cyan-400 font-black hover:underline">
                <span>🏢 Atacado B2B</span>
              </Link>
              <Link href={`/loja/${slug}?stock=in_stock`} className="flex items-center gap-1 text-yellow-400 font-black hover:underline">
                <Flame className="h-3.5 w-3.5" />
                <span>Ofertas HB</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-800 bg-zinc-950 p-4 space-y-3 shadow-2xl">
            <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
              <Link
                href={`/loja/${slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-black ${
                  activePage === 'varejo' ? 'bg-amber-400 text-black shadow-xs' : 'text-zinc-300'
                }`}
              >
                Varejo
              </Link>
              <Link
                href={`/loja/${slug}/atacado`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-black ${
                  activePage === 'atacado' ? 'bg-zinc-800 text-amber-400 shadow-xs border border-amber-400/40' : 'text-zinc-300'
                }`}
              >
                Atacado B2B
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2">
              <Link href={`/loja/${slug}?brand=nike`} onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400">
                ⚡ Jordan & Nike
              </Link>
              <Link href={`/loja/${slug}?brand=adidas`} onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white">
                👟 Adidas Samba
              </Link>
              <Link href={`/loja/${slug}?category=corrida`} onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white">
                🏃 Corrida
              </Link>
              <Link href={`/loja/${slug}?category=casual`} onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white">
                🔥 Streetwear
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Modal de CEP */}
      {cepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-amber-500/30 p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-black">
                <MapPin className="h-5 w-5 text-amber-400" />
                <h3>Onde você quer receber seus tênis?</h3>
              </div>
              <button
                onClick={() => setCepModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Entrega rápida para Manaus por <strong className="text-amber-400 font-bold">R$ 1,00</strong> ou despacho via Barco para todos os 62 municípios do Interior por <strong className="text-amber-400 font-bold">R$ 100,00</strong>.
            </p>

            <form onSubmit={handleSaveCep} className="space-y-3">
              <input
                type="text"
                value={tempCep}
                onChange={(e) => setTempCep(e.target.value)}
                placeholder="Digite seu CEP (ex: 69000-000)"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-amber-400 py-3 text-sm font-black text-black hover:bg-amber-300 transition-colors shadow-md"
              >
                Confirmar CEP
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer slug={slug} />

      {/* Barra de Navegação Estilo App Mobile Nativo */}
      <MobileAppNavigation slug={slug} whatsappNumber={whatsappNumber} />
    </>
  );
}
