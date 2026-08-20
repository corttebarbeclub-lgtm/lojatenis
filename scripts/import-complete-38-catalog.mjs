import { readFileSync, readdirSync } from 'fs';

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

const sourceDir = 'D:\\Downloads\\WhatsApp Unknown 2026-08-19 at 04.08.22';
const allFiles = readdirSync(sourceDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

// Agrupamento por timestamp
const sessions = {};
allFiles.forEach(f => {
  const match = f.match(/WhatsApp Image (\d{4}-\d{2}-\d{2} at \d{2}\.\d{2}\.\d{2})/);
  const key = match ? match[1] : 'outros';
  if (!sessions[key]) sessions[key] = [];
  sessions[key].push(f);
});

// Catálogo Completo dos 40 Modelos Reais das Fotos
const ALL_MODELS = [
  {
    session: '2026-08-19 at 03.50.40',
    brand: 'Adidas',
    name: 'Adidas Superstar Slip-On Triple Black',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto Total (Core Black)',
    retailPrice: 34990,
    costPrice: 16000,
    wholesalePrice: 23990,
    description: 'Design moderno sem cadarços com cabedal em neoprene e faixas elásticas cruzadas no mediopé. Biqueira Shell Toe concha e solado de borracha texturizado.',
    supportImages: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.51.19',
    brand: 'Nike',
    name: "Nike Air Force 1 '07 Triple White",
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco Clássico (Triple White)',
    retailPrice: 42990,
    costPrice: 21000,
    wholesalePrice: 29990,
    description: 'O clássico atemporal da cultura sneakerhead. Cabedal em couro legítimo branco com perfurações na biqueira e amortecimento Nike Air encapsulado.',
    supportImages: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.51.23',
    brand: 'Nike',
    name: 'Nike Dunk Low Retro Panda',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto / Branco (Panda)',
    retailPrice: 44990,
    costPrice: 22000,
    wholesalePrice: 31990,
    description: 'O tênis mais popular do streetwear mundial. Sobreposições pretas nítidas sobre couro branco macio, língua acolchoada e máxima aderência.',
    supportImages: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.51.24',
    brand: 'Nike',
    name: 'Nike Dunk Low University Blue',
    category: 'Casual',
    gender: 'unissex',
    color: 'Azul Universidade / Branco (Coast)',
    retailPrice: 44990,
    costPrice: 22000,
    wholesalePrice: 31990,
    description: 'Homenagem às cores da Universidade da Carolina do Norte. Cabedal em couro branco com sobreposições em azul celeste University Blue e solado com ponto de giro.',
    supportImages: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.51.25',
    brand: 'Nike',
    name: 'Nike Air Jordan 1 Retro High Chicago',
    category: 'Casual',
    gender: 'unissex',
    color: 'Vermelho / Branco / Preto (Chicago)',
    retailPrice: 49990,
    costPrice: 24000,
    wholesalePrice: 34990,
    description: 'A lenda das quadras de 1985 em suas cores mais emblemáticas. Couro premium de alta durabilidade, logo Wings estampado e cápsula Air encapsulada.',
    supportImages: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.51.38',
    brand: 'Nike',
    name: 'Nike Air Jordan 4 Retro Military Black',
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco / Preto / Cinza Neutro',
    retailPrice: 54990,
    costPrice: 26000,
    wholesalePrice: 38990,
    description: 'Design icônico de 1989 criado por Tinker Hatfield. Cabedal em couro liso branco com detalhes pretos, ilhós em asa, biqueira em camurça cinza e janela visível Air Max.',
    supportImages: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.51.40',
    brand: 'Nike',
    name: 'Nike Air Jordan 4 Retro Thunder Yellow',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto / Amarelo Ouro (Thunder)',
    retailPrice: 54990,
    costPrice: 26000,
    wholesalePrice: 38990,
    description: 'O clássico Jordan 4 Thunder com nobuck preto macio e detalhes em amarelo ouro sob as telas laterais e entressola. Visual que casa perfeitamente com a logo HB Tênis Manaus.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.52.30',
    brand: 'Nike',
    name: 'Nike Air Max 90 Triple White',
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco Total (Triple White)',
    retailPrice: 46990,
    costPrice: 23000,
    wholesalePrice: 32990,
    description: 'O ícone do running dos anos 90 com solado Waffle original, sobreposições costuradas e cápsula Max Air no calcanhar que oferece amortecimento lendário.',
    supportImages: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.52.31',
    brand: 'Adidas',
    name: 'Adidas Samba OG Cloud White Core Black',
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco / Preto / Sola Gum',
    retailPrice: 39990,
    costPrice: 19000,
    wholesalePrice: 27990,
    description: 'O tênis mais desejado do momento na moda global. Cabedal em couro legítimo macio com sobreposição em camurça T-toe na biqueira e solado de borracha natural Gum.',
    supportImages: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.32',
    brand: 'Adidas',
    name: 'Adidas Campus 00s Core Black',
    category: 'Skateboard',
    gender: 'unissex',
    color: 'Preto / Branco / Sola Gum',
    retailPrice: 38990,
    costPrice: 18500,
    wholesalePrice: 26990,
    description: 'Proporções maxi inspiradas na cultura skate dos anos 2000. Cabedal em camurça premium, língua super acolchoada e Três Listras ampliadas.',
    supportImages: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.33',
    brand: 'New Balance',
    name: 'New Balance 550 White Green',
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco / Verde Floresta (Sea Salt)',
    retailPrice: 46990,
    costPrice: 23000,
    wholesalePrice: 32990,
    description: 'Homenagem aos jogadores profissionais de basquete de 1989. O New Balance 550 é simples, clean e fiel ao seu legado vintage com couro perfurado e amortecimento em EVA.',
    supportImages: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.34',
    brand: 'New Balance',
    name: 'New Balance 9060 Rain Cloud Grey',
    category: 'Casual',
    gender: 'unissex',
    color: 'Cinza / Branco / Off-White (Rain Cloud)',
    retailPrice: 52990,
    costPrice: 25000,
    wholesalePrice: 36990,
    description: 'Expressão futurista e sofisticada da série 99X. Apresenta barras de rolagem visíveis da 990, linhas onduladas e entressola esculpida com tecnologia ABZORB e SBS.',
    supportImages: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.35',
    brand: 'Nike',
    name: 'Nike Air Max Plus TN Triple Black',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto Total (Triple Black)',
    retailPrice: 51990,
    costPrice: 25000,
    wholesalePrice: 36990,
    description: 'O clássico Tuned Air dos anos 90 com estética rebelde e gaiola em TPU inspirada em palmeiras balançando ao vento. Amortecimento duplo Tuned Air para máximo conforto e presença.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.36',
    brand: 'Nike',
    name: 'Nike Air Jordan 1 Low Travis Scott Reverse Mocha',
    category: 'Casual',
    gender: 'unissex',
    color: 'Marrom Mocha / Off-White / Vermelho',
    retailPrice: 59990,
    costPrice: 28000,
    wholesalePrice: 42990,
    description: 'A colaboração lendária com Travis Scott. Apresenta o icônico Swoosh invertido em tom creme, base em nobuck marrom mocha, sobreposições em couro branco e bordado Cactus Jack no calcanhar.',
    supportImages: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.40',
    brand: 'Vans',
    name: 'Vans Old Skool Classic Black White',
    category: 'Skateboard',
    gender: 'unissex',
    color: 'Preto / Branco (Sidestripe)',
    retailPrice: 31990,
    costPrice: 15000,
    wholesalePrice: 21990,
    description: 'O clássico pioneiro da Vans que introduziu a icônica listra lateral Sidestripe. Cabedal resistente em lona e camurça com biqueiras reforçadas e solado de borracha Waffle.',
    supportImages: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.41',
    brand: 'Vans',
    name: 'Vans Knu Skool Black White',
    category: 'Skateboard',
    gender: 'unissex',
    color: 'Preto / Branco (Chunky 90s)',
    retailPrice: 34990,
    costPrice: 16500,
    wholesalePrice: 23990,
    description: 'O modelo Knu Skool é uma reedição dos anos 90 com silhueta super acolchoada, Sidestripe 3D moldado em diamante e solado clássico Waffle vulcanizado da Vans.',
    supportImages: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.42',
    brand: 'Puma',
    name: 'Puma Suede XL Black White',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto / Branco / Dourado',
    retailPrice: 35990,
    costPrice: 17000,
    wholesalePrice: 24990,
    description: 'O lendário Puma Suede ganha uma versão XL com cadarços extragrossos, língua estofada no estilo skate e cabedal 100% camurça premium com o foil dourado da Puma.',
    supportImages: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.43',
    brand: 'Puma',
    name: 'Puma Slipstream Retro White Green',
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco / Verde / Cinza',
    retailPrice: 38990,
    costPrice: 18500,
    wholesalePrice: 26990,
    description: 'Nascido nas quadras de basquete em 1987, o Puma Slipstream combina linhas esportivas autênticas com sobreposições em couro premium e estética vintage.',
    supportImages: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.44',
    brand: 'Mizuno',
    name: 'Mizuno Wave Prophecy 12 Triple Black',
    category: 'Corrida',
    gender: 'masculino',
    color: 'Preto Total (Triple Black)',
    retailPrice: 69990,
    costPrice: 34000,
    wholesalePrice: 48990,
    description: 'O ápice da tecnologia de amortecimento mecânico. A placa Infinity Wave garante dissipação contínua de impacto com cabedal em mesh técnico respirável e solado X10 de borracha de carbono.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.45',
    brand: 'Mizuno',
    name: 'Mizuno Wave Creation 24 Platinum Blue',
    category: 'Corrida',
    gender: 'masculino',
    color: 'Prata Platina / Azul Royal',
    retailPrice: 59990,
    costPrice: 29000,
    wholesalePrice: 41990,
    description: 'Performance de elite para corridas de longa distância com a clássica placa Wave no calcanhar, tecnologia SmoothRide para transições fluidas e cabedal AIRmesh super arejado.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.46',
    brand: 'Asics',
    name: 'Asics Gel-Kayano 14 Metallic Silver Black',
    category: 'Corrida',
    gender: 'unissex',
    color: 'Prata Metálico / Preto',
    retailPrice: 48990,
    costPrice: 23500,
    wholesalePrice: 33990,
    description: 'Resgatando a estética running dos anos 2000, o Gel-Kayano 14 traz sobreposições em couro sintético prateado metálico e a consagrada tecnologia de amortecimento GEL no calcanhar e antepé.',
    supportImages: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.47',
    brand: 'Asics',
    name: 'Asics Gel-NYC Cream Oyster Grey',
    category: 'Casual',
    gender: 'unissex',
    color: 'Creme / Cinza Claro (Oyster)',
    retailPrice: 49990,
    costPrice: 24000,
    wholesalePrice: 34990,
    description: 'Fusão moderna inspirada no dinamismo de Nova York. Combina a estrutura do cabedal GEL-NIMBUS 3 do início dos anos 2000 com o sistema de ferramentas da entressola GEL-CUMULUS 16.',
    supportImages: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.48',
    brand: 'Nike',
    name: 'Nike Air Force 1 Low Supreme Box Logo Black',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto Total / Box Logo Vermelho',
    retailPrice: 49990,
    costPrice: 24000,
    wholesalePrice: 34990,
    description: 'A aguardada colaboração com a Supreme New York. Base em couro premium preto fosco com o emblemático Box Logo vermelho gravado a laser na lateral do calcanhar.',
    supportImages: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.49',
    brand: 'Nike',
    name: 'Nike Air Force 1 07 LV8 Black Metallic Gold',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto / Dourado Metálico',
    retailPrice: 45990,
    costPrice: 22500,
    wholesalePrice: 31990,
    description: 'Edição de luxo do Air Force 1 com Swoosh duplo em acabamento dourado brilhante metálico sobre couro preto de flor integral. Impecável e refinado.',
    supportImages: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.50',
    brand: 'Nike',
    name: 'Nike SB Dunk Low Travis Scott Cactus Jack',
    category: 'Skateboard',
    gender: 'unissex',
    color: 'Paisley Azul / Xadrez / Bege',
    retailPrice: 62990,
    costPrice: 29000,
    wholesalePrice: 44990,
    description: 'Um dos tênis mais valiosos do mercado mundial. Cabedal multicamadas com estampa Paisley azul marinho que se desgasta com o uso, painéis xadrez e cadarços de corda grossa.',
    supportImages: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.51',
    brand: 'Nike',
    name: 'Nike Dunk Low SB Grey Fog',
    category: 'Casual',
    gender: 'unissex',
    color: 'Cinza / Branco (Grey Fog)',
    retailPrice: 44990,
    costPrice: 22000,
    wholesalePrice: 31990,
    description: 'Um clássico minimalista do skate. O Dunk Low Grey Fog entrega elegância monocromática em dois tons, combinando base branca com sobreposições cinza suave e tração circular.',
    supportImages: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.52',
    brand: 'Nike',
    name: 'Nike Air Jordan 1 Low Black Phantom Travis Scott',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto Total / Costura Branca (Phantom)',
    retailPrice: 61990,
    costPrice: 29000,
    wholesalePrice: 43990,
    description: 'Completamente furtivo em camurça preta premium com costuras brancas contrastantes, bordado de abelha em homenagem à filha de Travis Scott e Swoosh invertido.',
    supportImages: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.53',
    brand: 'Nike',
    name: 'Nike Air Jordan 1 Low Olive Travis Scott',
    category: 'Casual',
    gender: 'feminino',
    color: 'Verde Oliva / Preto / Sail',
    retailPrice: 59990,
    costPrice: 28000,
    wholesalePrice: 42990,
    description: 'Edição exclusiva com Swoosh invertido em verde oliva sobre camurça preta e sobreposições em couro branco sail. Um dos lançamentos mais cobiçados da linha Air Jordan.',
    supportImages: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.54',
    brand: 'Nike',
    name: 'Nike Air Max Plus TN Sunset Orange',
    category: 'Casual',
    gender: 'unissex',
    color: 'Laranja Gradiente Pôr do Sol / Preto',
    retailPrice: 52990,
    costPrice: 25500,
    wholesalePrice: 37990,
    description: 'O lendário colorway Sunset traz o gradiente vibrante que simula o céu do entardecer com a gaiola preta em TPU e amortecimento duplo Tuned Air.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.53.55',
    brand: 'Nike',
    name: 'Nike Air Max 97 Silver Bullet',
    category: 'Casual',
    gender: 'unissex',
    color: 'Prata Metálico / Vermelho / Preto',
    retailPrice: 53990,
    costPrice: 26000,
    wholesalePrice: 38990,
    description: 'Inspirado nos trens-bala japoneses de alta velocidade. Apresenta o cabedal prateado fluido com linhas refletivas 3M e a primeira unidade Air Max de comprimento total.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.02',
    brand: 'Nike',
    name: 'Nike Shox TL 12 Molas Triple White',
    category: 'Casual',
    gender: 'masculino',
    color: 'Branco Total (Triple White)',
    retailPrice: 58990,
    costPrice: 27000,
    wholesalePrice: 41990,
    description: 'A versão clean do Nike Shox TL com colunas mecânicas brancas em toda a sola, cabedal respirável com sobreposições estruturadas em TPU e máxima presença urbana.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.04',
    brand: 'Nike',
    name: 'Nike Shox TL 12 Molas Triple Black',
    category: 'Casual',
    gender: 'masculino',
    color: 'Preto Total (Triple Black)',
    retailPrice: 58990,
    costPrice: 27000,
    wholesalePrice: 41990,
    description: 'O ícone supremo do funk e do streetwear brasileiro. Apresenta o lendário sistema mecânico Shox de 12 colunas em toda a extensão da sola para absorção de impacto total e visual inconfundível.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.06',
    brand: 'Nike',
    name: 'Nike Air Jordan 3 Retro Black Cement',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto / Elephant Print / Vermelho Fire Red',
    retailPrice: 57990,
    costPrice: 27000,
    wholesalePrice: 39990,
    description: 'O clássico Black Cement com couro granulado preto, sobreposições de estampa de elefante cinza e detalhes em vermelho fogo na língua e ilhós.',
    supportImages: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.07',
    brand: 'Nike',
    name: 'Nike Air Jordan 3 Retro White Cement Reimagined',
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco / Elephant Print / Vermelho',
    retailPrice: 57990,
    costPrice: 27000,
    wholesalePrice: 39990,
    description: 'O lendário tênis do Free Throw Line Dunk de Michael Jordan em 1988. Apresenta o autêntico padrão Elephant Print cinza sobre couro branco premium e o icônico logo Nike Air no calcanhar.',
    supportImages: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.08',
    brand: 'Nike',
    name: 'Nike Air Jordan 11 Retro Bred Playoff',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto / Vermelho Varsity Red / Branco',
    retailPrice: 59990,
    costPrice: 28000,
    wholesalePrice: 42990,
    description: 'O tênis lendário da temporada 72-10 dos Bulls. Cabedal em malha balística preta com verniz brilhante e solado translúcido vermelho Varsity Red.',
    supportImages: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.09',
    brand: 'Nike',
    name: 'Nike Air Jordan 11 Retro Concord',
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco / Preto Verniz / Sola Icy Blue',
    retailPrice: 59990,
    costPrice: 28000,
    wholesalePrice: 42990,
    description: 'O Santo Graal dos tênis de basquete. Cabedal em malha balística branca com detalhes em verniz preto brilhante e solado translúcido Icy Blue com placa de fibra de carbono.',
    supportImages: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.10',
    brand: 'Nike',
    name: 'Nike Zoom Vomero 5 Supersonic',
    category: 'Corrida',
    gender: 'unissex',
    color: 'Branco / Prata / Glow in the Dark',
    retailPrice: 47990,
    costPrice: 23000,
    wholesalePrice: 33990,
    description: 'O sneaker Y2K favorito dos amantes do estilo gorpcore e corrida retrô. Apresenta painéis em mesh respirável, sobreposições sintéticas e duplo amortecimento Zoom Air.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.31',
    brand: 'Adidas',
    name: 'Adidas Yeezy Boost 350 V2 Zebra',
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco / Preto / Vermelho (Zebra)',
    retailPrice: 59990,
    costPrice: 28000,
    wholesalePrice: 42990,
    description: 'Um dos modelos mais icônicos da história dos sneakers. Cabedal Primeknit com padrão zebra, faixa lateral com a inscrição SPLY-350 em vermelho espelhado e entressola com amortecimento Boost.',
    supportImages: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.32',
    brand: 'Adidas',
    name: 'Adidas Yeezy Boost 350 V2 Onyx',
    category: 'Casual',
    gender: 'unissex',
    color: 'Preto Onix / Carvão (Onyx)',
    retailPrice: 59990,
    costPrice: 28000,
    wholesalePrice: 42990,
    description: 'A versão all-black definitiva do Yeezy 350. Cabedal em Primeknit monocromático preto onix com faixa lateral translúcida e solado emborrachado com tecnologia Boost de ponta a ponta.',
    supportImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&auto=format&fit=crop&q=85',
    ]
  },
  {
    session: '2026-08-19 at 03.54.33',
    brand: 'Adidas',
    name: 'Adidas Yeezy Boost 350 V2 Bone White',
    category: 'Casual',
    gender: 'unissex',
    color: 'Branco Puro / Creme (Bone)',
    retailPrice: 59990,
    costPrice: 28000,
    wholesalePrice: 42990,
    description: 'Elegância e conforto futurista com cabedal em Primeknit branco osso impecável, puxador no calcanhar e amortecimento responsivo Boost que proporciona a sensação de andar nas nuvens.',
    supportImages: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&auto=format&fit=crop&q=85',
    ]
  }
];

async function importFullCatalog() {
  console.log('🧹 1. Limpando base anterior...');
  const cleanSQL = `
    delete from inventory where tenant_id = (select id from tenants where slug = 'tenisstore');
    delete from product_images where tenant_id = (select id from tenants where slug = 'tenisstore');
    delete from product_variants where tenant_id = (select id from tenants where slug = 'tenisstore');
    delete from products where tenant_id = (select id from tenants where slug = 'tenisstore');
  `;
  await runSQL(cleanSQL);
  console.log('✅ Base de dados antiga limpa!');

  console.log(`👟 2. Importando TODOS os ${ALL_MODELS.length} modelos reais mapeados das fotos da pasta...`);

  const sizes = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

  for (let i = 0; i < ALL_MODELS.length; i++) {
    const item = ALL_MODELS[i];
    const realPhotos = sessions[item.session] || [];

    console.log(`\n[${i + 1}/${ALL_MODELS.length}] Cadastrando: ${item.name} (${realPhotos.length} fotos reais)...`);

    const insertSQL = `
      do $$
      declare
        v_tenant_id uuid;
        v_brand_id uuid;
        v_category_id uuid;
        v_product_id uuid;
        v_variant_id uuid;
        v_size text;
      begin
        select id into v_tenant_id from tenants where slug = 'tenisstore';

        -- Marca
        select id into v_brand_id from brands where tenant_id = v_tenant_id and lower(name) = lower('${item.brand.replace(/'/g, "''")}');
        if v_brand_id is null then
          insert into brands (tenant_id, name) values (v_tenant_id, '${item.brand.replace(/'/g, "''")}') returning id into v_brand_id;
        end if;

        -- Categoria
        select id into v_category_id from categories where tenant_id = v_tenant_id and lower(name) = lower('${item.category.replace(/'/g, "''")}');
        if v_category_id is null then
          insert into categories (tenant_id, name) values (v_tenant_id, '${item.category.replace(/'/g, "''")}') returning id into v_category_id;
        end if;

        -- Produto
        insert into products (
          tenant_id, brand_id, category_id, name, description, gender, is_active
        )
        values (
          v_tenant_id,
          v_brand_id,
          v_category_id,
          '${item.name.replace(/'/g, "''")}',
          '${item.description.replace(/'/g, "''")}',
          '${item.gender}'::product_gender,
          true
        )
        returning id into v_product_id;

        -- Inserir as Fotos Reais do WhatsApp (Foto 1 Principal + Ângulos Reais)
        ${realPhotos.map((photo, pIdx) => `
          insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
          values (v_tenant_id, v_product_id, 'products/real/${photo}', '/products/real/${photo}', ${pIdx}, ${pIdx === 0 ? 'true' : 'false'});
        `).join('\n')}

        -- Inserir Fotos de Apoio em Alta Resolução
        ${item.supportImages.map((sImg, sIdx) => `
          insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
          values (v_tenant_id, v_product_id, 'products/support/${i}-${sIdx}.jpg', '${sImg}', ${realPhotos.length + sIdx}, false);
        `).join('\n')}

        -- Inserir Variantes 34 ao 44 com 5 pares de estoque cada
        ${sizes.map(sz => `
          insert into product_variants (
            tenant_id, product_id, color, size, sku, price_cents, cost_cents,
            wholesale_price_cents, wholesale_min_qty, is_active
          )
          values (
            v_tenant_id,
            v_product_id,
            '${item.color.replace(/'/g, "''")}',
            '${sz}',
            '${item.brand.slice(0, 3).toUpperCase()}-${item.name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, '')}-${sz}-${i}',
            ${item.retailPrice},
            ${item.costPrice},
            ${item.wholesalePrice},
            6,
            true
          )
          returning id into v_variant_id;

          -- 5 pares de estoque por numeração
          insert into inventory (tenant_id, variant_id, quantity, min_quantity)
          values (v_tenant_id, v_variant_id, 5, 2);
        `).join('\n')}

      end $$;
    `;

    await runSQL(insertSQL);
    console.log(`✅ ${item.name} cadastrado com ${sizes.length * 5} pares em estoque!`);
  }

  console.log(`\n🎉 SUCESSO TOTAL! ${ALL_MODELS.length} MODELOS REAIS CADASTRADOS (${ALL_MODELS.length * 55} PARES NO ESTOQUE)!`);
}

importFullCatalog().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
