import { readFileSync } from 'fs';

let token = '';
try {
  token = readFileSync('C:\\Users\\phabr\\.supabase\\access-token', 'utf-8').trim();
} catch (e) {
  console.error('Could not read token:', e.message);
  process.exit(1);
}

const PROJECT_REF = 'jmlxhsqfvxjggvqusleu';
const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function runSQL(sql) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  return JSON.parse(text);
}

// 5 Ângulos em Alta Resolução por Marca e Categoria
const BRAND_IMAGE_SETS = {
  Nike: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85', // Lateral
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85', // Frontal 3/4
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85', // Superior / Cadarço
    'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1200&auto=format&fit=crop&q=85', // Traseira / Sola
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85', // No pé / Lifestyle
  ],
  Adidas: [
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1520256862855-398228c41684?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&auto=format&fit=crop&q=85',
  ],
  Puma: [
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=1200&auto=format&fit=crop&q=85',
  ],
  'New Balance': [
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
  ],
  Asics: [
    'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
  ],
  Vans: [
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&auto=format&fit=crop&q=85',
  ],
  Mizuno: [
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=1200&auto=format&fit=crop&q=85',
  ],
  Olympikus: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&auto=format&fit=crop&q=85',
  ],
  Fila: [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1520256862855-398228c41684?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1200&auto=format&fit=crop&q=85',
  ],
  Reebok: [
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1200&auto=format&fit=crop&q=85',
  ]
};

async function seedImages() {
  console.log('📸 Atualizando 5 fotos em alta resolução por produto...');

  // 1. Obter todos os produtos e suas marcas
  const products = await runSQL(`
    select p.id, p.name, b.name as brand_name, p.tenant_id
    from products p
    left join brands b on b.id = p.brand_id
    join tenants t on t.id = p.tenant_id
    where t.slug = 'tenisstore' and p.is_active = true;
  `);

  console.log(`Encontrados ${products.length} produtos.`);

  let sqlBatch = 'do $$ begin ';

  for (const prod of products) {
    const brandName = prod.brand_name || 'Nike';
    const photos = BRAND_IMAGE_SETS[brandName] || BRAND_IMAGE_SETS['Nike'];

    // Limpar imagens anteriores do produto
    sqlBatch += `delete from product_images where product_id = '${prod.id}'; `;

    for (let pos = 0; pos < photos.length; pos++) {
      const isPrimary = pos === 0;
      const imgUrl = photos[pos];
      sqlBatch += `
        insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
        values ('${prod.tenant_id}', '${prod.id}', 'products/${prod.id}/photo_${pos}.jpg', '${imgUrl}', ${pos}, ${isPrimary});
      `;
    }
  }

  sqlBatch += ' end $$;';

  console.log(`Enviando atualização de imagens em lote para o Supabase...`);
  await runSQL(sqlBatch);
  console.log(`🎉 Sucesso! Cada um dos ${products.length} calçados agora possui 5 fotos em alta definição com suporte a Zoom!`);
}

seedImages().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
