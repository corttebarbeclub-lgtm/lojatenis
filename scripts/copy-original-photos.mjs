import { readdirSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const sourceDir = 'D:\\Downloads\\WhatsApp Unknown 2026-08-19 at 04.08.22';
const targetDir = 'd:\\Lojatenis\\public\\products\\real';

if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

const files = readdirSync(sourceDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

files.forEach(f => {
  const src = path.join(sourceDir, f);
  const dest = path.join(targetDir, f);
  copyFileSync(src, dest);
});

console.log(`Copiadas ${files.length} fotos originais para ${targetDir}`);
