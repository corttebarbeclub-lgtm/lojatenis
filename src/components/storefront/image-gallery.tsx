'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // Imagens da galeria
  const galleryImages = images && images.length > 0 ? images : [
    '/products/real/WhatsApp Image 2026-08-19 at 03.51.23 (2).jpeg'
  ];

  // Bloquear Scroll do Body e Escutar Tecla ESC quando Lightbox estiver aberto
  useEffect(() => {
    if (isLightboxOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsLightboxOpen(false);
          setLightboxScale(1);
        }
        if (e.key === 'ArrowLeft') {
          setActiveIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1));
        }
        if (e.key === 'ArrowRight') {
          setActiveIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1));
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isLightboxOpen, galleryImages.length]);

  function prev() {
    setActiveIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1));
  }

  // Hover Zoom no Desktop
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!imgContainerRef.current) return;
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  }

  return (
    <div className="space-y-4 select-none">
      {/* Imagem principal com Lupa de Zoom e Enquadramento Completo (sem cortes) */}
      <div
        ref={imgContainerRef}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
        className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-900/5 dark:bg-neutral-900 border border-gray-200/80 shadow-sm cursor-zoom-in group flex items-center justify-center p-2 sm:p-4"
      >
        {/* Imagem com Zoom Suave por Transformação CSS */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={galleryImages[activeIndex]}
          alt={`${productName} — Foto ${activeIndex + 1}`}
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: isZoomed ? 'scale(2.0)' : 'scale(1)',
          }}
          className="h-full w-full object-contain transition-transform duration-100 ease-out will-change-transform pointer-events-none drop-shadow-md"
        />

        {/* Badge de Zoom */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
          <span>Clique para Tela Cheia</span>
        </div>

        {/* Navegação Prev / Next */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Indicador de fotos (1/X) */}
        <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white">
          {activeIndex + 1} / {galleryImages.length}
        </div>
      </div>

      {/* Carrossel de Miniaturas (Thumbnails) */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
          {galleryImages.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all duration-200 bg-gray-50 p-1 flex items-center justify-center ${
                i === activeIndex
                  ? 'border-gray-950 ring-2 ring-gray-950/20 shadow-md scale-102'
                  : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Miniatura ${i + 1} de ${productName}`}
                className="h-full w-full object-contain"
              />
              {i === activeIndex && (
                <div className="absolute inset-0 bg-gray-950/5 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* MODAL LIGHTBOX FULLSCREEN COM ZOOM ULTRA-HD (ISOLAMENTO COMPLETO DE TELA) */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setIsLightboxOpen(false);
            setLightboxScale(1);
          }}
          className="fixed inset-0 z-[99999] h-screen w-screen flex flex-col items-center justify-between bg-black/98 p-4 sm:p-6 backdrop-blur-2xl animate-in fade-in duration-200 overscroll-none"
        >
          {/* Barra de Ferramentas Superior */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-7xl flex items-center justify-between z-10 text-white pb-3 border-b border-white/10"
          >
            <button
              onClick={() => {
                setIsLightboxOpen(false);
                setLightboxScale(1);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Produto</span>
            </button>

            <div className="text-center hidden sm:block">
              <span className="font-bold text-sm text-white block">{productName}</span>
              <span className="text-xs text-amber-400 font-medium">Foto {activeIndex + 1} de {galleryImages.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxScale((s) => (s === 1 ? 1.7 : 1))}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20 transition-colors"
              >
                {lightboxScale === 1 ? <Maximize2 className="h-4 w-4 text-amber-400" /> : <Minimize2 className="h-4 w-4 text-amber-400" />}
                <span>{lightboxScale === 1 ? 'Zoom Detalhes' : 'Encaixar na Tela'}</span>
              </button>

              <button
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxScale(1);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all"
              >
                <X className="h-5 w-5" />
                <span>Fechar [ESC]</span>
              </button>
            </div>
          </div>

          {/* Área Central da Imagem Lightbox (100% Enquadrada, sem cortes) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setLightboxScale((s) => (s === 1 ? 1.7 : 1));
            }}
            className="relative flex-1 w-full max-w-5xl my-auto flex items-center justify-center cursor-zoom-in overflow-auto p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryImages[activeIndex]}
              alt={productName}
              style={{ transform: `scale(${lightboxScale})` }}
              className="max-h-[75vh] w-auto max-w-full object-contain transition-transform duration-300 rounded-2xl shadow-2xl select-none"
            />
          </div>

          {/* Botões de Navegação Anterior / Próxima no Lightbox */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/30 hover:scale-110 transition-all shadow-xl"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/30 hover:scale-110 transition-all shadow-xl"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Barra Inferior com Miniaturas e Instrução */}
          {galleryImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl flex flex-col items-center gap-2 z-10 pt-2"
            >
              <div className="flex justify-center gap-2 overflow-x-auto p-1 max-w-full scrollbar-none">
                {galleryImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-black/40 p-1 flex items-center justify-center ${
                      i === activeIndex
                        ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg'
                        : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Miniatura ${i + 1}`} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 font-medium text-center">
                Dica: Clique na foto para alternar o zoom • Use as setas do teclado para navegar • Pressione ESC para fechar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

