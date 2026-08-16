const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

export interface CompressedImageResult {
  file: File;
  originalSizeBytes: number;
  finalSizeBytes: number;
  savedPercent: number;
  width: number;
  height: number;
  format: string;
}

/**
 * Comprime e redimensiona uma imagem de produto no navegador antes do
 * upload: máximo 1600x1600, WebP, ~82% de qualidade, nunca faz upscale,
 * sempre preserva proporção.
 */
export async function compressProductImage(file: File): Promise<CompressedImageResult> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const targetWidth = Math.round(bitmap.width * scale);
  const targetHeight = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível processar a imagem neste navegador.');
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Falha ao gerar imagem otimizada.'))),
      'image/webp',
      QUALITY
    );
  });

  const originalSizeBytes = file.size;
  const finalSizeBytes = blob.size;
  const savedPercent = originalSizeBytes > 0
    ? Math.max(0, Math.round(((originalSizeBytes - finalSizeBytes) / originalSizeBytes) * 1000) / 10)
    : 0;

  const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
  const optimizedFile = new File([blob], newName, { type: 'image/webp' });

  return {
    file: optimizedFile,
    originalSizeBytes,
    finalSizeBytes,
    savedPercent,
    width: targetWidth,
    height: targetHeight,
    format: 'webp',
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
