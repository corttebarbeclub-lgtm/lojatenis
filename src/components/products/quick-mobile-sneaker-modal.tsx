'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PackagePlus,
  Layers,
  Camera,
  ImageIcon,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SNEAKER_BRANDS = [
  // Hype & Principais
  'Nike',
  'Adidas',
  'Jordan',
  'Yeezy',
  'New Balance',
  'Puma',
  'Vans',
  'Converse All Star',
  'Asics',
  'Mizuno',
  'Oakley',
  'Reebok',
  'Fila',
  'Under Armour',
  'On Running',
  'Hoka One One',
  'Timberland',
  'DC Shoes',
  'ÖUS',
  'Hocks',
  'Qix',

  // Esportivas & Nacionais
  'Olympikus',
  'Skechers',
  'Rainha',
  'Topper',
  'Penalty',
  'Umbro',
  'Kappa',
  'Diadora',
  'Mormaii',
  'Everlast',

  // Grifes & Streetwear Fashion
  'Lacoste',
  'Tommy Hilfiger',
  'Calvin Klein',
  'Reserva',
  'Vert / Veja',
  'Redley',
  'Coca-Cola Shoes',
  'John John',
  'Cavalera',
  'Off-White',
  'Balenciaga',
  'Alexander McQueen',
  'Gucci',
  'Louis Vuitton',
  'Armani Exchange',
  'Diesel',

  // Feminino & Casual
  'Farm Rio',
  'Vizzano',
  'Moleca',
  'Beira Rio',
  'Schutz',
  'Arezzo',
  'Anacapri',
  'Via Marte',
  'Dakota',
  'Kolosh',
  'Ramarim',
  'Usaflex',
  'Modare',
  'Piccadilly',

  // Sandálias, Chinelos & Botas
  'Kenner',
  'Crocs',
  'Havaianas',
  'Rider',
  'Cartago',
  'Ipanema',
  'Kildare',
  'Democrata',
  'Ferracini',
  'Pegada',

  // Opção para digitar
  '+ Outra Marca...',
];

const DEFAULT_SIZES = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

export function QuickMobileSneakerModal({ onProductCreated }: { onProductCreated?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Campos do Formulário
  const [selectedBrand, setSelectedBrand] = useState('Nike');
  const [customBrandName, setCustomBrandName] = useState('');
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Casual');
  const [gender, setGender] = useState('unissex');
  const [color, setColor] = useState('Preto / Branco');
  const [retailPrice, setRetailPrice] = useState('349,90');
  const [costPrice, setCostPrice] = useState('160,00');
  const [wholesalePrice, setWholesalePrice] = useState('239,90');
  const [description, setDescription] = useState('');

  // Fotos
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Grade de Tamanhos e Quantidades
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({
    '34': 5,
    '35': 5,
    '36': 5,
    '37': 5,
    '38': 5,
    '39': 5,
    '40': 5,
    '41': 5,
    '42': 5,
    '43': 5,
    '44': 5,
  });

  function handleSizeDelta(size: string, delta: number) {
    const current = sizeQuantities[size] || 0;
    const next = Math.max(0, current + delta);
    setSizeQuantities((prev) => ({
      ...prev,
      [size]: next,
    }));
  }

  function parseMoney(val: string) {
    const clean = val.replace(/[^\d,.]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.round(num * 100);
  }

  const totalPairsInGrid = Object.values(sizeQuantities).reduce((sum, q) => sum + q, 0);

  // Upload de fotos
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }

      const res = await fetch('/api/admin/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Erro ao fazer upload das fotos.');
      } else {
        const newUrls = (data.urls || [data.url]) as string[];
        setUploadedPhotos((prev) => [...prev, ...newUrls]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar imagem.';
      setErrorMsg(message);
    } finally {
      setUploadingPhotos(false);
    }
  }

  function removePhoto(indexToRemove: number) {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const finalBrand =
      selectedBrand === '+ Outra Marca...'
        ? customBrandName.trim()
        : selectedBrand;

    if (!finalBrand) {
      setErrorMsg('Informe o nome da marca do calçado.');
      return;
    }

    const sizesGrid = Object.entries(sizeQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([size, quantity]) => ({ size, quantity }));

    if (sizesGrid.length === 0) {
      setErrorMsg('Adicione a quantidade de pelo menos uma numeração na grade.');
      return;
    }

    const allImages = [...uploadedPhotos];
    if (customImageUrl.trim() && !allImages.includes(customImageUrl.trim())) {
      allImages.unshift(customImageUrl.trim());
    }

    if (allImages.length === 0) {
      setErrorMsg('Tire uma foto com a câmera, selecione da galeria ou informe o link da foto do tênis.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/quick-sneaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: finalBrand,
          name,
          categoryName,
          gender,
          color,
          description: description || `Modelo exclusivo ${name} da marca ${finalBrand}. Disponível para pronta entrega.`,
          retailPriceCents: parseMoney(retailPrice),
          costPriceCents: parseMoney(costPrice),
          wholesalePriceCents: parseMoney(wholesalePrice),
          wholesaleMinQty: 6,
          imageUrl: allImages[0],
          images: allImages,
          sizesGrid,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Erro ao cadastrar tênis.');
      } else {
        setSuccessMsg(data.message || 'Tênis cadastrado com sucesso!');
        setTimeout(() => {
          setOpen(false);
          setName('');
          setDescription('');
          setCustomBrandName('');
          setUploadedPhotos([]);
          setCustomImageUrl('');
          setSuccessMsg(null);
          onProductCreated?.();
          router.refresh();
        }, 1500);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de conexão.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-amber-500 text-black hover:bg-amber-400 font-black gap-1.5 shadow-md hover:-translate-y-0.5 transition-all text-xs"
        >
          <PackagePlus className="h-4 w-4" />
          <span>+ Novo Tênis</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-black text-gray-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Lançamento Rápido de Novo Tênis
          </DialogTitle>
          <p className="text-xs text-gray-500">
            Tire foto com a câmera do celular ou suba da galeria para dar entrada imediata no estoque.
          </p>
        </DialogHeader>

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

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* SEÇÃO DE FOTOS: CÂMERA OU GALERIA */}
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-amber-600" />
                Fotos do Calçado (Câmera ou Galeria):
              </label>
              {uploadedPhotos.length > 0 && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {uploadedPhotos.length} foto(s)
                </span>
              )}
            </div>

            {/* Inputs Ocultos de Câmera e Galeria */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              ref={galleryInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />

            {/* Botões de Ação de Foto */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={uploadingPhotos}
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl bg-black text-white p-3 text-xs font-black hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
              >
                <Camera className="h-4 w-4 text-amber-400" />
                <span>Bater Foto (Câmera)</span>
              </button>

              <button
                type="button"
                disabled={uploadingPhotos}
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-gray-300 text-gray-800 p-3 text-xs font-black hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                <ImageIcon className="h-4 w-4 text-amber-600" />
                <span>Escolher da Galeria</span>
              </button>
            </div>

            {/* Loader de Upload */}
            {uploadingPhotos && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-amber-800">
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                <span>Enviando e processando foto(s)...</span>
              </div>
            )}

            {/* Grade de Miniaturas das Fotos Anexadas */}
            {uploadedPhotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
                {uploadedPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-black text-amber-400 text-center py-0.5 uppercase tracking-wider">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Alternativa: Link da Web */}
            <div>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Ou cole uma URL da foto (ex: https://images.unsplash.com/...)"
                className="w-full rounded-xl border border-gray-300 p-2 text-[11px] focus:border-amber-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Marca e Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Marca ({SNEAKER_BRANDS.length - 1} marcas disponíveis) *
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white focus:border-amber-500 focus:outline-none font-bold"
              >
                {SNEAKER_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* Campo para digitar caso escolha "+ Outra Marca..." */}
              {selectedBrand === '+ Outra Marca...' && (
                <input
                  type="text"
                  required
                  value={customBrandName}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  placeholder="Digite o nome da nova marca..."
                  className="mt-1.5 w-full rounded-xl border-2 border-amber-400 p-2 text-xs font-bold bg-amber-50/60 focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Categoria *</label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white focus:border-amber-500 focus:outline-none font-bold"
              >
                <option value="Casual">Casual / Sneakers</option>
                <option value="Corrida">Corrida & Performance</option>
                <option value="Skateboard">Skateboard & Street</option>
                <option value="Treino & Academia">Treino & Academia</option>
                <option value="Chuteiras & Futebol">Futebol & Futsal</option>
                <option value="Basquete">Basquete</option>
                <option value="Chinelos & Slides">Chinelos, Sandálias & Slides</option>
                <option value="Botas & Adventure">Botas & Adventure</option>
              </select>
            </div>
          </div>

          {/* Nome do Tênis */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Modelo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nike Air Jordan 1 Low Travis Scott"
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-amber-500 focus:outline-none font-semibold"
            />
          </div>

          {/* Cor e Gênero */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Cor Principal *</label>
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ex: Preto / Branco / Vermelho"
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Gênero</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white focus:border-amber-500 focus:outline-none"
              >
                <option value="unissex">Unissex</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="infantil">Infantil</option>
              </select>
            </div>
          </div>

          {/* Preços: Varejo, Custo e Atacado */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-amber-50/60 p-3 border border-amber-200">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Preço Varejo (R$)*</label>
              <input
                type="text"
                required
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                placeholder="349,90"
                className="w-full rounded-lg border border-gray-300 p-2 text-xs font-black text-amber-700 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Preço Custo (R$)</label>
              <input
                type="text"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="160,00"
                className="w-full rounded-lg border border-gray-300 p-2 text-xs font-bold text-gray-700 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Preço Atacado (R$)</label>
              <input
                type="text"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="239,90"
                className="w-full rounded-lg border border-gray-300 p-2 text-xs font-bold text-blue-700 bg-white"
              />
            </div>
          </div>

          {/* Grade de Entrada de Estoque (34 ao 44) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-amber-600" />
                Grade de Numeração & Estoque Recebido:
              </label>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {totalPairsInGrid} {totalPairsInGrid === 1 ? 'par' : 'pares'} no total
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {DEFAULT_SIZES.map((size) => {
                const qty = sizeQuantities[size] || 0;
                return (
                  <div
                    key={size}
                    className={`flex items-center justify-between rounded-xl border p-2 ${
                      qty > 0 ? 'border-amber-400 bg-amber-50/70 ring-1 ring-amber-400' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="font-black text-xs text-gray-900">Tam {size}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSizeDelta(size, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center font-black text-xs">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleSizeDelta(size, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded bg-black text-white hover:bg-gray-800"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botão de Gravação */}
          <Button
            type="submit"
            disabled={loading || uploadingPhotos}
            className="w-full bg-black text-white hover:bg-zinc-800 py-3.5 text-xs font-black shadow-lg"
          >
            {loading ? 'Lançando no Estoque...' : `Cadastrar e Lançar ${totalPairsInGrid} Pares no Estoque`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
