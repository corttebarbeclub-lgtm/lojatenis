'use client';

import { useRef, useState } from 'react';
import { Star, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { createSupabaseImageProvider } from '@/lib/providers/supabase-image-provider';
import { compressProductImage, formatBytes } from '@/lib/image/compress';
import { addProductImage, removeProductImage, setPrimaryImage } from '@/app/dashboard/produtos/actions';
import { Button } from '@/components/ui/button';
import type { ProductImage } from '@/types/database';

export function ProductImageUploader({
  productId,
  tenantId,
  images,
}: {
  productId: string;
  tenantId: string;
  images: ProductImage[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const supabase = createClient();
    const imageProvider = createSupabaseImageProvider(supabase);

    for (const file of Array.from(files)) {
      try {
        const compressed = await compressProductImage(file);
        const economyPct = compressed.savedPercent;

        const { storagePath, url } = await imageProvider.upload({
          tenantId,
          productId,
          file: compressed.file,
        });

        const result = await addProductImage(productId, storagePath, url, {
          width: compressed.width,
          height: compressed.height,
          sizeBytes: compressed.finalSizeBytes,
          format: compressed.format,
        });

        if (result.error) {
          toast.error(result.error);
          await imageProvider.remove(storagePath).catch(() => {});
          continue;
        }

        toast.success(
          `${file.name}: ${formatBytes(compressed.originalSizeBytes)} → ${formatBytes(compressed.finalSizeBytes)} (${economyPct.toFixed(1)}% menor)`
        );
      } catch {
        toast.error(`Falha ao processar ${file.name}.`);
      }
    }

    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleRemove(imageId: string) {
    const result = await removeProductImage(imageId);
    if (result.error) toast.error(result.error);
  }

  async function handleSetPrimary(imageId: string) {
    const result = await setPrimaryImage(imageId, productId);
    if (result.error) toast.error(result.error);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="h-full w-full object-cover" />
            {image.is_primary && (
              <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                Principal
              </span>
            )}
            <div className="absolute inset-0 flex items-end justify-end gap-1 bg-black/0 p-1 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
              {!image.is_primary && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  onClick={() => handleSetPrimary(image.id)}
                  title="Definir como principal"
                >
                  <Star className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-7 w-7"
                onClick={() => handleRemove(image.id)}
                title="Remover imagem"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:bg-accent disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs">{isUploading ? 'Enviando...' : 'Adicionar'}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
