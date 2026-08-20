import { readdirSync } from 'fs';

const sourceDir = 'D:\\Downloads\\WhatsApp Unknown 2026-08-19 at 04.08.22';
const files = readdirSync(sourceDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

// Agrupar por timestamp base do arquivo WhatsApp (ex: "2026-08-19 at 03.50.40")
const groups = {};

files.forEach(f => {
  const match = f.match(/WhatsApp Image (\d{4}-\d{2}-\d{2} at \d{2}\.\d{2}\.\d{2})/);
  const key = match ? match[1] : 'outros';
  if (!groups[key]) groups[key] = [];
  groups[key].push(f);
});

console.log(`Total de grupos/sessões de fotos de tênis: ${Object.keys(groups).length}`);
for (const [key, list] of Object.entries(groups)) {
  console.log(`- Sessão [${key}]: ${list.length} fotos -> ${list.join(', ')}`);
}
