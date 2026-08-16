import type { SupabaseClient } from '@supabase/supabase-js';
import type { ImageProvider, UploadImageParams, UploadImageResult } from './image-provider';

const BUCKET = 'product-images';

export function createSupabaseImageProvider(supabase: SupabaseClient): ImageProvider {
  return {
    async upload({ tenantId, productId, file }: UploadImageParams): Promise<UploadImageResult> {
      const path = `${tenantId}/products/${productId}/${crypto.randomUUID()}-${file.name}`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

      return { storagePath: path, url: data.publicUrl };
    },

    async remove(storagePath: string): Promise<void> {
      const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
      if (error) throw error;
    },
  };
}
