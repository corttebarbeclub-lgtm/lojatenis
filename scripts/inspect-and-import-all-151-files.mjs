import { readdirSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const sourceDir = 'D:\\Downloads\\WhatsApp Unknown 2026-08-19 at 04.08.22';
const targetDir = 'd:\\Lojatenis\\public\\products\\real';

if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

const files = readdirSync(sourceDir);
console.log(`Encontrados ${files.length} arquivos na pasta de origem.`);

let copied = 0;
files.forEach((f) => {
  const src = path.join(sourceDir, f);
  const dest = path.join(targetDir, f);
  copyFileSync(src, dest);
  copied++;
});

console.log(`Copiados com sucesso ${copied} arquivos para public/products/real/!`);
console.log('Listagem completa dos arquivos:', JSON.stringify(files, null, 2));
