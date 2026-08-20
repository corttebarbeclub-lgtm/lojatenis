'use client';

import { useState, useRef, MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X, Maximize2, Minimize2 } from 'lucide-react';

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

  // Imagens fallback caso o array tenha menos de 5 fotos
  const galleryImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
  ];

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
      {/* Imagem principal com Lupa de Zoom */}
      <div
        ref={imgContainerRef}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
        className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200/80 shadow-sm cursor-crosshair group"
      >
        {/* Imagem com Zoom Suave por Transformação CSS — Zero falha de tela branca */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={galleryImages[activeIndex]}
          alt={`${productName} — Foto ${activeIndex + 1}`}
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
          }}
          className="h-full w-full object-cover transition-transform duration-100 ease-out will-change-transform pointer-events-none"
        />

        {/* Badge de Zoom */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
          <span>Zoom (Passe o mouse ou toque)</span>
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

        {/* Indicador de fotos (1/5) */}
        <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white">
          {activeIndex + 1} / {galleryImages.length}
        </div>
      </div>

      {/* Carrossel de Miniaturas (Thumbnails com 5 fotos) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
        {galleryImages.map((url, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`relative flex-shrink-0 h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
              i === activeIndex
                ? 'border-gray-950 ring-2 ring-gray-950/20 shadow-md scale-102'
                : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Miniatura ${i + 1} de ${productName}`}
              className="h-full w-full object-cover"
            />
            {i === activeIndex && (
              <div className="absolute inset-0 bg-gray-950/5 pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* MODAL LIGHTBOX FULLSCREEN COM ZOOM ULTRA-HD */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          {/* Barra de Ferramentas Superior */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-50 text-white">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{productName}</span>
              <span className="text-xs text-gray-400">({activeIndex + 1} de {galleryImages.length})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxScale((s) => (s === 1 ? 2 : 1))}
                className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 transition-colors"
              >
                {lightboxScale === 1 ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                {lightboxScale === 1 ? 'Zoom 2x' : 'Redefinir'}
              </button>
              <button
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxScale(1);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Imagem Lightbox */}
          <div
            className="relative max-h-[85vh] max-w-[85vw] overflow-auto flex items-center justify-center cursor-zoom-out"
            onClick={() => setLightboxScale((s) => (s === 1 ? 1.8 : 1))}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryImages[activeIndex]}
              alt={productName}
              style={{ transform: `scale(${lightboxScale})` }}
              className="max-h-[80vh] max-w-[80vw] object-contain transition-transform duration-300 rounded-xl"
            />
          </div>

          {/* Botões de Navegação Lightbox */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Thumbnails inferiores no Lightbox */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-50">
            {galleryImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-14 w-14 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activeIndex ? 'border-white ring-2 ring-white/50 scale-105' : 'border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Miniatura ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
