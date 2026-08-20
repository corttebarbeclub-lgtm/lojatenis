'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ArrowRight } from 'lucide-react';

interface CentauroFloatingOfferProps {
  slug: string;
}

export function CentauroFloatingOffer({ slug }: CentauroFloatingOfferProps) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-xs sm:max-w-sm rounded-3xl bg-zinc-950 p-4 shadow-2xl border border-amber-500/40 text-white animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-start justify-between gap-3">
        {/* Logo HB Tênis Manaus */}
        <div className="relative h-12 w-12 rounded-full overflow-hidden border border-amber-400 flex-shrink-0 bg-black shadow-md shadow-amber-500/20">
          <Image
            src="/hb-logo.png"
            alt="HB Tênis Manaus"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Textos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 leading-tight">
              Ofertas HB Tênis Manaus!
            </span>
            <button
              onClick={() => setClosed(true)}
              className="h-6 w-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-1 text-[11px] text-zinc-300 leading-snug">
            Sneakers Air Jordan, Nike e Adidas com <strong className="text-amber-400 font-bold">Frete R$ 15,00 para Manaus</strong> e parcelamento facilitado!
          </p>

          <Link
            href={`/loja/${slug}?brand=nike`}
            onClick={() => setClosed(true)}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-black hover:bg-amber-300 transition-all shadow-md"
          >
            <span>Ver Sneakers Hype</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
