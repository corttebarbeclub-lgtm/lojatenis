export interface UploadImageParams {
  tenantId: string;
  productId: string;
  file: File;
}

export interface UploadImageResult {
  storagePath: string;
  url: string;
}

/**
 * Interface de armazenamento de imagem — implementação atual usa Supabase
 * Storage como solução transicional (sem conta ImageKit ainda). Trocar
 * para ImageKit exige apenas uma nova implementação desta interface,
 * sem alterar nenhum código de produtos/variações.
 */
export interface ImageProvider {
  upload(params: UploadImageParams): Promise<UploadImageResult>;
  remove(storagePath: string): Promise<void>;
}
