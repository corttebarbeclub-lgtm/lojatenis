'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Flame,
  Truck,
  Percent,
  Star,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowRight,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ProductOption {
  id: string;
  name: string;
  brandName: string;
  primaryImage: string | null;
  allImages: string[];
  totalStock: number;
  minPriceCents: number;
}

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  tag: string;
  badge_type: 'promo' | 'shipping' | 'drop' | 'exclusive' | string;
  discount_badge_text: string | null;
  product_id: string | null;
  custom_image_url: string | null;
  bg_theme: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  position: number;
  product?: {
    id: string;
    name: string;
    brand?: { id: string; name: string };
    product_images?: { id: string; url: string; is_primary: boolean }[];
  };
}

const THEME_OPTIONS = [
  { id: 'gold_amber', name: 'Ouro & Âmbar (Clássico)', gradient: 'from-amber-600/30 via-zinc-950 to-black', border: 'border-amber-500/30', accent: 'bg-amber-400 text-black' },
  { id: 'crimson_red', name: 'Vermelho Fogo (Hype)', gradient: 'from-red-600/30 via-zinc-950 to-black', border: 'border-red-500/30', accent: 'bg-red-500 text-white' },
  { id: 'cyber_cyan', name: 'Azul Ciano (Moderno)', gradient: 'from-cyan-600/30 via-zinc-950 to-black', border: 'border-cyan-500/30', accent: 'bg-cyan-400 text-black' },
  { id: 'emerald_green', name: 'Verde Esmeralda (Varejo)', gradient: 'from-emerald-600/30 via-zinc-950 to-black', border: 'border-emerald-500/30', accent: 'bg-emerald-400 text-black' },
  { id: 'dark_purple', name: 'Roxo Noturno (Exclusivo)', gradient: 'from-purple-600/30 via-zinc-950 to-black', border: 'border-purple-500/30', accent: 'bg-purple-400 text-black' },
];

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function HeroManagerClient({ tenantId }: { tenantId?: string }) {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado do formulário de edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('🔥 DESTAQUE EM ESTOQUE');
  const [badgeType, setBadgeType] = useState<'promo' | 'shipping' | 'drop' | 'exclusive'>('shipping');
  const [discountBadgeText, setDiscountBadgeText] = useState('FRETE R$ 1,00 MANAUS');
  const [bgTheme, setBgTheme] = useState('gold_amber');
  const [ctaText, setCtaText] = useState('Comprar Agora • Ver Tamanhos');
  const [ctaLink, setCtaLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/hero-banners?tenant_id=${tenantId || ''}`);
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners || []);
        setProducts(data.products || []);

        if (data.banners?.length > 0) {
          const firstBanner = data.banners[0];
          setEditingId(firstBanner.id);
          setSelectedProductId(firstBanner.product_id || '');
          setTitle(firstBanner.title);
          setSubtitle(firstBanner.subtitle || '');
          setTag(firstBanner.tag || '🔥 DESTAQUE EM ESTOQUE');
          setBadgeType((firstBanner.badge_type as 'promo' | 'shipping' | 'drop' | 'exclusive') || 'shipping');
          setDiscountBadgeText(firstBanner.discount_badge_text || '');
          setBgTheme(firstBanner.bg_theme || 'gold_amber');
          setCtaText(firstBanner.cta_text || 'Comprar Agora • Ver Tamanhos');
          setCtaLink(firstBanner.cta_link || '');
          setImageUrl(firstBanner.custom_image_url || '');
          setIsActive(firstBanner.is_active);
        } else if (data.products?.length > 0) {
          const firstProd = data.products[0];
          setSelectedProductId(firstProd.id);
          setTitle(firstProd.name);
          setImageUrl(firstProd.primaryImage || '');
          setCtaLink(`/loja/tenisstore/produto/${firstProd.id}`);
          setSubtitle(`Disponível do 34 ao 44 com pronta entrega em Manaus. Garanta o seu com desconto especial!`);
        }
      }
    } catch {
      toast.error('Erro ao carregar banners da Hero.');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function fillFormWithBanner(banner: HeroBanner) {
    setEditingId(banner.id);
    setSelectedProductId(banner.product_id || '');
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setTag(banner.tag || '🔥 DESTAQUE EM ESTOQUE');
    setBadgeType((banner.badge_type as 'promo' | 'shipping' | 'drop' | 'exclusive') || 'shipping');
    setDiscountBadgeText(banner.discount_badge_text || '');
    setBgTheme(banner.bg_theme || 'gold_amber');
    setCtaText(banner.cta_text || 'Comprar Agora • Ver Tamanhos');
    setCtaLink(banner.cta_link || '');
    setImageUrl(banner.custom_image_url || '');
    setIsActive(banner.is_active);
  }

  function handleSelectProduct(prodId: string, currentProducts = products) {
    setSelectedProductId(prodId);
    const prod = currentProducts.find((p) => p.id === prodId);
    if (prod) {
      setTitle(prod.name);
      setImageUrl(prod.primaryImage || '');
      setCtaLink(`/loja/tenisstore/produto/${prod.id}`);
      setSubtitle(`Disponível do 34 ao 44 com pronta entrega em Manaus. Garanta o seu com desconto especial!`);
    }
  }

  function handleBadgeTypeChange(type: 'promo' | 'shipping' | 'drop' | 'exclusive') {
    setBadgeType(type);
    if (type === 'promo') {
      setTag('⚡ PROMOÇÃO RELÂMPAGO');
      setDiscountBadgeText('ATÉ 30% OFF');
      setBgTheme('crimson_red');
    } else if (type === 'shipping') {
      setTag('🚀 PROMOÇÃO ESPECIAL AMAZONAS');
      setDiscountBadgeText('FRETE R$ 1,00 MANAUS');
      setBgTheme('gold_amber');
    } else if (type === 'drop') {
      setTag('🔥 DROP EXCLUSIVO SNEAKERHEAD');
      setDiscountBadgeText('COLEÇÃO 2026');
      setBgTheme('cyber_cyan');
    } else {
      setTag('⭐ DESTAQUE EXCLUSIVO HB');
      setDiscountBadgeText('PRONTA ENTREGA');
      setBgTheme('emerald_green');
    }
  }

  function handleNewBanner() {
    setEditingId(null);
    if (products.length > 0) {
      handleSelectProduct(products[0].id);
    } else {
      setTitle('Novo Tênis em Destaque');
      setSubtitle('Disponível com entrega imediata em Manaus.');
    }
  }

  async function handleSaveBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Informe o título do banner.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/hero-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || undefined,
          tenantId,
          title,
          subtitle,
          tag,
          badgeType,
          discountBadgeText,
          productId: selectedProductId || null,
          customImageUrl: imageUrl || null,
          bgTheme,
          ctaText,
          ctaLink,
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('🎉 Hero Banner salvo e atualizado com sucesso na vitrine!');
        loadData();
      } else {
        toast.error(data.error || 'Erro ao salvar banner.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBanner(id: string) {
    if (!confirm('Deseja realmente remover este banner da Hero?')) return;
    try {
      const res = await fetch(`/api/admin/hero-banners?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.info('Banner removido.');
        loadData();
      } else {
        toast.error(data.error || 'Erro ao excluir banner.');
      }
    } catch {
      toast.error('Erro de conexão.');
    }
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const activeTheme = THEME_OPTIONS.find((t) => t.id === bgTheme) || THEME_OPTIONS[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Personalização da Hero (Vitrine Principal)
            </h1>
            {loading && (
              <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-50 border-amber-200 animate-pulse">
                Carregando Estoque...
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Escolha qualquer tênis do estoque para brilhar na capa da loja virtual, configure promoções e ofertas de frete.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleNewBanner}
            variant="outline"
            className="text-xs font-bold border-gray-300"
          >
            <Plus className="h-4 w-4 mr-1" />
            Criar Novo Slide
          </Button>

          <a
            href="/loja/tenisstore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white text-xs font-black hover:bg-zinc-800 transition-all shadow-sm"
          >
            <Eye className="h-4 w-4 text-amber-400" />
            Ver Loja ao Vivo
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Grid Principal: Formulário à Esquerda + Live Preview à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Formulário de Configuração */}
        <div className="lg:col-span-6 space-y-6 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Edit className="h-4 w-4 text-amber-600" />
              {editingId ? 'Editando Banner Selecionado' : 'Configurar Novo Banner da Hero'}
            </h2>
            <Badge variant="outline" className="text-[11px] font-bold">
              {editingId ? 'Banner Salvo' : 'Rascunho'}
            </Badge>
          </div>

          <form onSubmit={handleSaveBanner} className="space-y-4">
            
            {/* 1. Escolher Tênis do Estoque */}
            <div>
              <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5">
                👟 1. Selecionar Tênis do Estoque Central
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs font-bold focus:border-black focus:outline-none bg-white shadow-xs"
              >
                <option value="">-- Selecione um Tênis Cadastrado --</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.brandName}) • Estoque: {prod.totalStock} un • {formatPrice(prod.minPriceCents)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Ao selecionar o calçado, o sistema puxa automaticamente a foto oficial e o link de compra direta.
              </p>
            </div>

            {/* 2. Tipo de Destaque / Modalidade */}
            <div>
              <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5">
                🏷️ 2. Tipo de Destaque / Promoção
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleBadgeTypeChange('shipping')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-black transition-all flex flex-col items-center gap-1 ${
                    badgeType === 'shipping'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Truck className="h-4 w-4 text-amber-600" />
                  <span>Frete Manaus</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBadgeTypeChange('promo')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-black transition-all flex flex-col items-center gap-1 ${
                    badgeType === 'promo'
                      ? 'border-red-500 bg-red-50 text-red-950 ring-2 ring-red-400'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Percent className="h-4 w-4 text-red-600" />
                  <span>Promoção %</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBadgeTypeChange('drop')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-black transition-all flex flex-col items-center gap-1 ${
                    badgeType === 'drop'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-950 ring-2 ring-cyan-400'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Flame className="h-4 w-4 text-cyan-600" />
                  <span>Drop / Hype</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBadgeTypeChange('exclusive')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-black transition-all flex flex-col items-center gap-1 ${
                    badgeType === 'exclusive'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Star className="h-4 w-4 text-emerald-600" />
                  <span>Exclusivo</span>
                </button>
              </div>
            </div>

            {/* 3. Textos Principais do Banner */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tag Superior (Badge Chamativa)
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Ex: 🔥 DESTAQUE EM ESTOQUE"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-bold focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título Principal da Hero *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: ADIDAS CAMPUS 00S CORE BLACK"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-black focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subtítulo / Descrição de Impacto
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Grade do 34 ao 44 disponível a pronta entrega em Manaus..."
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Badge de Oferta / Selo
                  </label>
                  <input
                    type="text"
                    value={discountBadgeText}
                    onChange={(e) => setDiscountBadgeText(e.target.value)}
                    placeholder="Ex: FRETE R$ 1,00"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-bold focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Texto do Botão (CTA)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Ex: Comprar Agora"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-bold focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Escolha do Tema de Cores / Gradiente */}
            <div>
              <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5">
                🎨 3. Tema Visual / Gradiente Dark Streetwear
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {THEME_OPTIONS.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setBgTheme(theme.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                      bgTheme === theme.id
                        ? 'border-black bg-zinc-900 text-white shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{theme.name}</span>
                    <div className={`h-4 w-4 rounded-full ${theme.accent}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-3">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-black text-white hover:bg-zinc-800 py-4 text-xs font-black shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4 text-amber-400" />
                <span>{saving ? 'Gravando na Vitrine...' : 'Salvar Alterações e Ativar na Hero'}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview Ao Vivo à Direita */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white">
                <Eye className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-black tracking-wider uppercase">
                  Pré-visualização Ao Vivo da Loja Virtual
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">Dimensão Hero 100% Responsiva</span>
            </div>

            {/* Renderização Exata da Hero */}
            <div className={`relative overflow-hidden rounded-2xl bg-zinc-950 text-white shadow-2xl border ${activeTheme.border}`}>
              <div className={`relative min-h-[360px] flex items-center bg-gradient-to-r ${activeTheme.gradient} p-6 sm:p-8`}>
                
                {/* Imagem de Fundo Desfocada */}
                {imageUrl && (
                  <div className="absolute inset-0 opacity-20 filter blur-xl scale-125">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}

                {/* Foto do Tênis Flutuante à Direita */}
                <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-5/12 h-[220px] flex items-center justify-center pointer-events-none z-10">
                  {imageUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Tênis Selecionado"
                        className="max-h-full max-w-full object-contain filter contrast-105"
                      />
                      {discountBadgeText && (
                        <div className="absolute -bottom-1 bg-black/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-400/40 text-[9px] font-black text-amber-400 flex items-center gap-1 shadow-lg">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                          <span>{discountBadgeText}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-zinc-600 text-xs font-bold text-center">
                      Selecione um tênis do estoque para carregar a foto
                    </div>
                  )}
                </div>

                {/* Conteúdo de Texto */}
                <div className="relative z-20 max-w-[58%] space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md">
                    <Flame className="h-3 w-3 fill-black" />
                    {tag || '🔥 DESTAQUE EM ESTOQUE'}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black italic tracking-tighter leading-none text-white drop-shadow-md">
                    {title || 'Nome do Tênis em Destaque'}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-zinc-300 font-medium leading-relaxed line-clamp-2">
                    {subtitle || 'Descrição do calçado e vantagens da entrega expressa em Manaus.'}
                  </p>

                  {selectedProduct && (
                    <div className="pt-1">
                      <span className="text-xl font-black text-white">
                        {formatPrice(selectedProduct.minPriceCents)}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold ml-2">
                        ou 3x de {formatPrice(Math.round(selectedProduct.minPriceCents / 3))}
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-black shadow-md"
                    >
                      <span>{ctaText || 'Comprar Agora'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Banners Salvos */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              Banners Ativos na Hero ({banners.length})
            </h3>

            {banners.length === 0 ? (
              <p className="text-xs text-gray-400 py-3">Nenhum banner cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      editingId === b.id
                        ? 'border-amber-400 bg-amber-50/50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {b.custom_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.custom_image_url}
                          alt=""
                          className="h-10 w-10 object-contain rounded-lg bg-black/10 p-0.5"
                        />
                      )}
                      <div>
                        <p className="font-black text-xs text-gray-900 line-clamp-1">{b.title}</p>
                        <p className="text-[10px] text-gray-500">{b.tag} • {b.discount_badge_text || 'Sem badge'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fillFormWithBanner(b)}
                        className="h-7 px-2 text-[11px] font-bold"
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteBanner(b.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
