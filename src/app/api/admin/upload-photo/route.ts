import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getCurrentAppUser } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentAppUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'products', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || '.jpg';
      const cleanFileName = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadDir, cleanFileName);

      await writeFile(filePath, buffer);
      urls.push(`/products/uploads/${cleanFileName}`);
    }

    return NextResponse.json({
      success: true,
      urls,
      url: urls[0],
      message: `${urls.length} foto(s) enviada(s) com sucesso!`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro no upload';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
