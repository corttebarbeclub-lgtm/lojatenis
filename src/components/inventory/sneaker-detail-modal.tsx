'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Sparkles,
  Plus,
  Trash2,
  Lock,
  KeyRound,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Boxes,
  Star,
} from 'lucide-react';

interface VariantStockItem {
  variantId: string;
  size: string;
  quantity: number;
}

interface SneakerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  tenantId?: string;
  onSavedSuccess?: () => void;
}

export function SneakerDetailModal({
  open,
  onOpenChange,
  productId,
  tenantId,
  onSavedSuccess,
}: SneakerDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados dos dados do Tênis
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [color, setColor] = useState('');
  const [salePrice, setSalePrice] = useState('579,90');
  const [costPrice, setCostPrice] = useState('280,00');
  const [wholesalePrice, setWholesalePrice] = useState('320,00');

  // Galeria de Fotos
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Grade de Estoque por Tamanho (34 ao 44)
  const [variantsStock, setVariantsStock] = useState<VariantStockItem[]>([]);

  // Senha Mestra do Dono
  const [adminPin, setAdminPin] = useState('');

  // Carregar dados completos do produto
  useEffect(() => {
    if (!open || !productId) return;

    async function loadProductDetails() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/admin/products/full-edit?product_id=${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          const p = data.product;
          setName(p.name || '');
          setBrandName(p.brand?.name || '');
          setSalePrice(((p.sale_price_cents || 0) / 100).toFixed(2).replace('.', ','));
          setCostPrice(((p.cost_price_cents || 0) / 100).toFixed(2).replace('.', ','));
          setWholesalePrice(((p.wholesale_price_cents || 0) / 100).toFixed(2).replace('.', ','));

          // Fotos
          const imgs = (p.product_images || [])
            .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
            .map((img: { image_url: string }) => img.image_url);
          setImages(imgs);

          // Variantes e Estoque
          const vars = (p.product_variants || []).map((v: { id: string; size: string; color: string; inventory?: { quantity: number }[] }) => {
            if (v.color) setColor(v.color);
            const qty = v.inventory?.[0]?.quantity ?? 0;
            return {
              variantId: v.id,
              size: v.size,
              quantity: qty,
            };
          });

          // Ordenar por numeração
          vars.sort((a: VariantStockItem, b: VariantStockItem) => parseInt(a.size) - parseInt(b.size));
          setVariantsStock(vars);
        } else {
          setErrorMsg(data.error || 'Erro ao carregar detalhes do produto.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro de conexão.';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }

    loadProductDetails();
  }, [open, productId]);

  // Manipular Fotos
  function addImage() {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function setAsCoverImage(index: number) {
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
    toast.success('Foto definida como capa principal!');
  }

  // Manipular Estoque por Tamanho
  function updateVariantQty(size: string, delta: number) {
    setVariantsStock((prev) =>
      prev.map((item) => {
        if (item.size !== size) return item;
        const nextQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: nextQty };
      })
    );
  }

  function setVariantExactQty(size: string, qtyStr: string) {
    const val = parseInt(qtyStr) || 0;
    setVariantsStock((prev) =>
      prev.map((item) => (item.size === size ? { ...item, quantity: Math.max(0, val) } : item))
    );
  }

  // Atalho: Zerar Todo o Estoque
  function handleZeroAllStock() {
    if (!confirm('Deseja realmente ZERAR o saldo de estoque de todos os tamanhos deste tênis?')) return;
    setVariantsStock((prev) => prev.map((item) => ({ ...item, quantity: 0 })));
    toast.info('Estoque zerado no formulário. Informe a senha mestra e clique em Salvar.');
  }

  // Atalho: Definir Quantidade em Todos
  function handleFillAllStock(targetQty: number) {
    setVariantsStock((prev) => prev.map((item) => ({ ...item, quantity: targetQty })));
    toast.success(`Definido ${targetQty} pares em todas as numerações.`);
  }

  // Salvar Alterações com Senha Mestra
  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('O nome do tênis é obrigatório.');
      return;
    }

    if (!adminPin.trim()) {
      setErrorMsg('A Senha Mestra de Admin do Dono é obrigatória para salvar alterações e mexer no estoque.');
      return;
    }

    setSaving(true);
    try {
      const saleCents = Math.round((parseFloat(salePrice.replace(',', '.')) || 0) * 100);
      const costCents = Math.round((parseFloat(costPrice.replace(',', '.')) || 0) * 100);
      const wholesaleCents = Math.round((parseFloat(wholesalePrice.replace(',', '.')) || 0) * 100);

      const res = await fetch('/api/admin/products/full-edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          tenantId,
          name: name.trim(),
          brandName: brandName.trim(),
          color: color.trim(),
          priceCents: saleCents,
          costCents: costCents,
          wholesalePriceCents: wholesaleCents,
          images,
          variantsStock,
          adminPin: adminPin.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Erro ao salvar alterações.');
      } else {
        setSuccessMsg(data.message || 'Tênis e estoque atualizados com sucesso!');
        setAdminPin('');
        if (onSavedSuccess) onSavedSuccess();

        setTimeout(() => {
          onOpenChange(false);
          setSuccessMsg(null);
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro de conexão ao salvar.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  const totalPairs = variantsStock.reduce((sum, v) => sum + v.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-black text-gray-900">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Configurações & Gestão Completa do Tênis
            </DialogTitle>
            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-bold text-xs">
              Efeito Imediato
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Edite fotos, preços, cores e altere ou zere as quantidades de estoque com sua senha mestra.
          </p>
        </DialogHeader>

        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-500">
            Carregando dados do tênis e estoque central...
          </div>
        ) : (
          <form onSubmit={handleSaveChanges} className="space-y-5 pt-1">
            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2 border border-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SEÇÃO 1: GALERIA DE FOTOS */}
            <div className="space-y-2 rounded-2xl bg-zinc-50 p-4 border border-zinc-200">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-amber-600" />
                  Galeria de Fotos ({images.length} fotos)
                </Label>
                <span className="text-[11px] text-gray-500">A 1ª foto é a Capa Principal</span>
              </div>

              {/* Grid de Fotos Existentes */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border-2 bg-white aspect-square group transition-all ${
                      idx === 0 ? 'border-amber-500 ring-2 ring-amber-300' : 'border-gray-200'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />

                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                        CAPA
                      </span>
                    )}

                    {/* Ações ao passar o mouse */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsCoverImage(idx)}
                          title="Definir como foto de capa"
                          className="h-7 w-7 rounded-lg bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400"
                        >
                          <Star className="h-3.5 w-3.5 fill-black" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title="Remover foto"
                        className="h-7 w-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adicionar Nova Foto */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Cole o link ou caminho da foto (ex: /products/real/foto.jpg ou URL)..."
                  className="flex-1 rounded-xl border border-gray-300 p-2 text-xs bg-white focus:border-black focus:outline-none"
                />
                <Button
                  type="button"
                  onClick={addImage}
                  disabled={!newImageUrl.trim()}
                  className="h-9 px-3 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-black flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Foto
                </Button>
              </div>
            </div>

            {/* SEÇÃO 2: DADOS DO PRODUTO & PREÇOS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-bold text-gray-700">Nome do Tênis / Modelo *</Label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Nike Dunk Low Retro Panda"
                  className="rounded-xl border-gray-300 text-xs font-black"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Marca</Label>
                <Input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Nike, Adidas, Jordan..."
                  className="rounded-xl border-gray-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Cor Principal</Label>
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Ex: Preto e Branco"
                  className="rounded-xl border-gray-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-black text-gray-900">Preço Varejo (R$)</Label>
                <Input
                  type="text"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="579,90"
                  className="rounded-xl border-gray-300 text-xs font-black font-mono text-black"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Preço Custo (R$)</Label>
                <Input
                  type="text"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="280,00"
                  className="rounded-xl border-gray-300 text-xs font-mono text-gray-600"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Preço Atacado (R$)</Label>
                <Input
                  type="text"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  placeholder="320,00"
                  className="rounded-xl border-gray-300 text-xs font-mono text-amber-700 font-bold"
                />
              </div>
            </div>

            {/* SEÇÃO 3: GRADE DE ESTOQUE POR TAMANHO (34 AO 44) */}
            <div className="space-y-2.5 rounded-2xl bg-amber-50/50 p-4 border border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Label className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                    <Boxes className="h-4 w-4 text-amber-600" />
                    Grade de Estoque por Tamanho ({totalPairs} pares no total)
                  </Label>
                  <p className="text-[11px] text-gray-500">
                    Ajuste o saldo de cada numeração individualmente ou use os botões rápidos.
                  </p>
                </div>

                {/* Atalhos Rápidos de Estoque */}
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFillAllStock(5)}
                    className="h-7 text-[11px] font-bold rounded-lg border-amber-300 text-amber-900 bg-white hover:bg-amber-100"
                  >
                    +5 em Todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleZeroAllStock}
                    className="h-7 text-[11px] font-black rounded-lg border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    🚨 Zerar Estoque
                  </Button>
                </div>
              </div>

              {/* Grid das Numerações 34 ao 44 */}
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-11 gap-2 pt-1">
                {variantsStock.map((v) => (
                  <div
                    key={v.size}
                    className={`rounded-xl border p-2 flex flex-col items-center justify-between gap-1 transition-all ${
                      v.quantity === 0
                        ? 'bg-red-50/60 border-red-200'
                        : v.quantity <= 2
                        ? 'bg-amber-100/60 border-amber-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <span className="text-xs font-black text-gray-900">Tam {v.size}</span>

                    <input
                      type="number"
                      min="0"
                      value={v.quantity}
                      onChange={(e) => setVariantExactQty(v.size, e.target.value)}
                      className="w-full text-center font-black text-sm font-mono border rounded-lg p-1 bg-white focus:outline-none focus:border-amber-500"
                    />

                    <div className="flex items-center gap-1 w-full justify-center">
                      <button
                        type="button"
                        onClick={() => updateVariantQty(v.size, -1)}
                        className="h-6 w-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-black"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => updateVariantQty(v.size, 1)}
                        className="h-6 w-6 rounded bg-black text-white hover:bg-zinc-800 flex items-center justify-center text-xs font-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO 4: SENHA MESTRA DE ADMIN DO DONO (OBRIGATÓRIA) */}
            <div className="space-y-1.5 rounded-2xl bg-zinc-900 text-white p-4 border border-zinc-800">
              <Label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-amber-400" />
                Senha Mestra de Admin do Dono * (Obrigatória para Salvar e Mexer no Estoque)
              </Label>
              <div className="relative">
                <Input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Digite sua senha mestra (ex: 123456)..."
                  className="rounded-xl border-amber-400/80 bg-zinc-800 text-white font-black text-xs pl-9 focus:border-amber-400"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
              </div>
              <p className="text-[11px] text-zinc-400">
                * As alterações entrarão em vigor no mesmo instante no PDV, estoque e catálogo.
              </p>
            </div>

            {/* BOTÃO DE GRAVAÇÃO COM EFEITO IMEDIATO */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-500 text-black hover:bg-amber-400 py-6 text-sm font-black shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {saving ? 'Gravando Alterações no Servidor...' : 'Salvar Todas as Alterações com Efeito Imediato'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
