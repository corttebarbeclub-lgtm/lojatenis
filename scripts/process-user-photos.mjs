import { readdirSync, statSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const sourceDir = 'D:\\Downloads\\WhatsApp Unknown 2026-08-19 at 04.08.22';
const targetDir = 'd:\\Lojatenis\\public\\products\\real';

if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

const files = readdirSync(sourceDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

console.log(`Total de fotos encontradas: ${files.length}`);

// Copiar todos os arquivos com nomes limpos e sequenciais para visualização e catálogo
const fileMap = [];
files.forEach((file, index) => {
  const src = path.join(sourceDir, file);
  const ext = path.extname(file);
  const cleanName = `shoe-${String(index + 1).padStart(3, '0')}${ext}`;
  const dest = path.join(targetDir, cleanName);
  copyFileSync(src, dest);
  fileMap.push({ original: file, clean: cleanName, url: `/products/real/${cleanName}`, index: index + 1 });
});

console.log(`Copiadas ${fileMap.length} fotos para ${targetDir}`);
console.log('Primeiras 10 fotos:', fileMap.slice(0, 10));
