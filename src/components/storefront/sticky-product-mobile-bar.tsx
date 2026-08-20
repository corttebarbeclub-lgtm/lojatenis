'use client';

import { useState, useEffect } from 'react';
import { Zap, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyProductMobileBarProps {
  productName: string;
  priceCents: number;
  imageUrl: string | null;
  hasStock: boolean;
  onBuyClick: () => void;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function StickyProductMobileBar({
  productName,
  priceCents,
  imageUrl,
  hasStock,
  onBuyClick,
}: StickyProductMobileBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      // Exibe a barra após o usuário rolar mais de 250px na tela
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-black/95 text-white border-t border-amber-500/30 p-3 shadow-2xl backdrop-blur-md lg:hidden animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3">
        {/* Foto Miniatura e Preço */}
        <div className="flex items-center gap-2.5 min-w-0">
          {imageUrl && (
            <div className="h-11 w-11 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 border border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={productName} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="min-w-0">
            <h4 className="text-[11px] font-black text-white truncate">{productName}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-black text-amber-400 font-mono">
                {formatPrice(priceCents)}
              </span>
              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                <Truck className="h-2.5 w-2.5" />
                Frete R$ 1
              </span>
            </div>
          </div>
        </div>

        {/* Botão de Ação Touch */}
        <Button
          type="button"
          onClick={onBuyClick}
          disabled={!hasStock}
          className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-4 py-2.5 rounded-xl flex-shrink-0 shadow-lg shadow-amber-400/20 active:scale-95 transition-transform flex items-center gap-1.5"
        >
          <Zap className="h-3.5 w-3.5 fill-black" />
          <span>{hasStock ? 'Comprar' : 'Esgotado'}</span>
        </Button>
      </div>
    </div>
  );
}
