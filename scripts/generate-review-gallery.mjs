import { readdirSync, writeFileSync } from 'fs';
import path from 'path';

const sourceDir = 'D:\\Downloads\\WhatsApp Unknown 2026-08-19 at 04.08.22';
const files = readdirSync(sourceDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

const groups = {};

files.forEach(f => {
  const match = f.match(/WhatsApp Image (\d{4}-\d{2}-\d{2} at \d{2}\.\d{2}\.\d{2})/);
  const key = match ? match[1] : 'outros';
  if (!groups[key]) groups[key] = [];
  groups[key].push(f);
});

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Galeria de Tênis Reais - HB Tênis Manaus</title>
  <style>
    body { font-family: sans-serif; background: #111; color: #fff; padding: 20px; }
    .group { background: #1c1c1e; border: 1px solid #333; border-radius: 12px; padding: 15px; margin-bottom: 20px; }
    h2 { color: #f59e0b; margin-top: 0; font-size: 16px; }
    .photos { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; }
    .photo-card { flex-shrink: 0; text-align: center; width: 160px; }
    img { width: 160px; height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #444; }
    .name { font-size: 10px; color: #888; word-break: break-all; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Catálogo de Tênis Reais (${Object.keys(groups).length} modelos / 149 fotos)</h1>
`;

let idx = 1;
for (const [time, imgs] of Object.entries(groups)) {
  html += `
  <div class="group" id="mod-${idx}">
    <h2>Modelo #${idx} — Sessão: ${time} (${imgs.length} fotos)</h2>
    <div class="photos">
  `;
  imgs.forEach(img => {
    // A foto copiada para public/products/real
    html += `
      <div class="photo-card">
        <img src="/products/real/${img}" loading="lazy" />
        <div class="name">${img}</div>
      </div>
    `;
  });
  html += `
    </div>
  </div>
  `;
  idx++;
}

html += `</body></html>`;

writeFileSync('d:\\Lojatenis\\public\\catalog-review.html', html, 'utf-8');
console.log('Galeria gerada em d:\\Lojatenis\\public\\catalog-review.html');
