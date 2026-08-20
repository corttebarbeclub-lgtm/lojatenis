import { readdirSync } from 'fs';

const sourceDir = 'D:\\Downloads\\WhatsApp Unknown 2026-08-19 at 04.08.22';
const allFiles = readdirSync(sourceDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

const sessions = {};
allFiles.forEach(f => {
  const match = f.match(/WhatsApp Image (\d{4}-\d{2}-\d{2} at \d{2}\.\d{2}\.\d{2})/);
  const key = match ? match[1] : 'outros';
  if (!sessions[key]) sessions[key] = [];
  sessions[key].push(f);
});

console.log(`Analisando ${Object.keys(sessions).length} conjuntos de fotos encontrados na pasta:`);

const list = Object.entries(sessions).map(([time, files], idx) => ({
  index: idx + 1,
  session: time,
  count: files.length,
  firstFile: files[0],
  allFiles: files
}));

console.log(JSON.stringify(list, null, 2));
