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

// 50 Modelos de Tênis Reais com preços pesquisados no mercado brasileiro (2025/2026)
const SNEAKERS = [
  // NIKE (10 modelos)
  {
    name: 'Nike Dunk Low Retro',
    brand: 'Nike',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 89999, // R$ 899,99
    wholesalePrice: 58000, // R$ 580,00
    wholesaleMinQty: 5,
    colors: ['Branco/Preto (Panda)', 'Azul Vintage', 'Verde Oliva'],
    sizes: ['38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&auto=format&fit=crop&q=80',
    description: 'Ícone das quadras de basquete dos anos 80, o Dunk Low retorna com sobreposições clássicas e bloco de cores nostálgico. Conforto premium em couro genuíno.'
  },
  {
    name: 'Nike Air Force 1 07',
    brand: 'Nike',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 79999,
    wholesalePrice: 51000,
    wholesaleMinQty: 6,
    colors: ['Triple White', 'Triple Black', 'Branco/Swoosh Vermelho'],
    sizes: ['37', '38', '39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    description: 'O brilho perdura no Air Force 1 07, o clássico do basquete que dá um toque novo no que você já conhece: sobreposições costuradas e amortecimento Nike Air.'
  },
  {
    name: 'Nike Air Max 90',
    brand: 'Nike',
    category: 'Casual',
    gender: 'masculino',
    retailPrice: 89999,
    wholesalePrice: 57000,
    wholesaleMinQty: 4,
    colors: ['Infrared / Branco', 'Preto Total', 'Cinza / Volt'],
    sizes: ['39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    description: 'Nada tão leve, tão confortável e tão consagrado. O Air Max 90 mantém-se fiel às raízes do atletismo com a sola waffle icônica e amortecimento Air visível.'
  },
  {
    name: 'Nike Air Zoom Pegasus 41',
    brand: 'Nike',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 99999,
    wholesalePrice: 65000,
    wholesaleMinQty: 4,
    colors: ['Volt / Preto', 'Azul Royal', 'Branco / Laranja'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    description: 'O cavalo de batalha com asas está de volta com espuma ReactX energizada e cápsulas duplas Zoom Air para passadas responsivas e macias em qualquer distância.'
  },
  {
    name: 'Nike Vaporfly 3',
    brand: 'Nike',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 189999,
    wholesalePrice: 125000,
    wholesaleMinQty: 3,
    colors: ['Proto White', 'Rosa Hyper Pink', 'Verde Neon'],
    sizes: ['39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80',
    description: 'O rei das maratonas. Placa de fibra de carbono Flyplate de comprimento total e espuma ZoomX ultra responsiva projetada para quebrar recordes pessoais.'
  },
  {
    name: 'Nike Invincible 3',
    brand: 'Nike',
    category: 'Corrida',
    gender: 'feminino',
    retailPrice: 129999,
    wholesalePrice: 85000,
    wholesaleMinQty: 4,
    colors: ['Branco / Lilás', 'Preto / Dourado', 'Azul Glaciar'],
    sizes: ['34', '35', '36', '37', '38', '39'],
    image: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop&q=80',
    description: 'Amortecimento máximo para corridas de recuperação. Camada espessa de ZoomX que absorve todo o impacto e protege suas articulações.'
  },
  {
    name: 'Nike SB Dunk Low Pro',
    brand: 'Nike',
    category: 'Skateboard',
    gender: 'unissex',
    retailPrice: 84999,
    wholesalePrice: 55000,
    wholesaleMinQty: 5,
    colors: ['Bege / Marrom', 'Preto Gum', 'Azul Marinho'],
    sizes: ['38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
    description: 'Língua acolchoada e palmilha Zoom Air no calcanhar para manobras de skate de alto impacto e estilo urbano impecável.'
  },
  {
    name: 'Nike Metcon 9',
    brand: 'Nike',
    category: 'Training & Academia',
    gender: 'masculino',
    retailPrice: 99999,
    wholesalePrice: 65000,
    wholesaleMinQty: 4,
    colors: ['Preto / Vermelho', 'Cinza / Laranja', 'Verde Militar'],
    sizes: ['39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
    description: 'O padrão ouro do Cross Training. Placa Hyperlift maior no calcanhar para estabilidade extrema em levantamentos de peso pesados.'
  },
  {
    name: 'Nike Court Vision Low',
    brand: 'Nike',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 49999,
    wholesalePrice: 32000,
    wholesaleMinQty: 8,
    colors: ['Branco / Preto', 'Total White', 'Branco / Azul'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&auto=format&fit=crop&q=80',
    description: 'Estilo retrô do basquete dos anos 80 a um excelente custo-benefício. Cabedal em material sintético durável com perfurações respiráveis.'
  },
  {
    name: 'Nike Revolution 7',
    brand: 'Nike',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 39999,
    wholesalePrice: 25000,
    wholesaleMinQty: 10,
    colors: ['Preto / Branco', 'Cinza Chumbo', 'Azul Marinho'],
    sizes: ['37', '38', '39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&auto=format&fit=crop&q=80',
    description: 'Tênis de entrada para caminhadas e corridas leves com entressola em espuma macia e design moderno clean.'
  },

  // ADIDAS (9 modelos)
  {
    name: 'Adidas Samba OG',
    brand: 'Adidas',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 79999,
    wholesalePrice: 52000,
    wholesaleMinQty: 6,
    colors: ['Branco / Três Listras Pretas', 'Preto / Branco', 'Verde Floresta'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&auto=format&fit=crop&q=80',
    description: 'Nascido no futebol de salão, elevado à lenda da moda mundial. Cabedal em couro com ponteira em T de camurça e sola de borracha gum.'
  },
  {
    name: 'Adidas Gazelle Indoor',
    brand: 'Adidas',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 79999,
    wholesalePrice: 52000,
    wholesaleMinQty: 6,
    colors: ['Azul Royal / Amarelo', 'Verde Menta', 'Bordô / Branco'],
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    image: 'https://images.unsplash.com/photo-1520256862855-398228c41684?w=800&auto=format&fit=crop&q=80',
    description: 'Camurça premium suntuosa e sola de borracha translúcida que envolve o cabedal. Um dos modelos mais desejados do streetwear atual.'
  },
  {
    name: 'Adidas Ultraboost Light',
    brand: 'Adidas',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 119999,
    wholesalePrice: 78000,
    wholesaleMinQty: 4,
    colors: ['Core Black', 'Cloud White', 'Laranja Solar'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80',
    description: 'Experimente a energia épica do novo Ultraboost Light, nosso Ultraboost mais leve de todos os tempos, com 30% menos peso no material Boost.'
  },
  {
    name: 'Adidas Forum Low Classic',
    brand: 'Adidas',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 69999,
    wholesalePrice: 45000,
    wholesaleMinQty: 5,
    colors: ['Branco / Azul Clássico', 'Total White', 'Branco / Bege'],
    sizes: ['37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&auto=format&fit=crop&q=80',
    description: 'Mais que um tênis, uma afirmação de estilo. O Forum Low traz o clássico design de tornozelo em X e visual robusto dos anos 80.'
  },
  {
    name: 'Adidas SL 72 OG',
    brand: 'Adidas',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 69999,
    wholesalePrice: 46000,
    wholesaleMinQty: 6,
    colors: ['Azul / Branco / Vermelho', 'Amarelo / Preto', 'Verde Retrô'],
    sizes: ['37', '38', '39', '40', '41', '42'],
    image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&auto=format&fit=crop&q=80',
    description: 'O ícone retrô-running de 1972 está de volta com perfil super fino, cabedal em nylon respirável e sobreposições em camurça genuína.'
  },
  {
    name: 'Adidas Adizero Adios Pro 3',
    brand: 'Adidas',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 199999,
    wholesalePrice: 135000,
    wholesaleMinQty: 3,
    colors: ['Strata Solar Red', 'White Spark', 'Preto / Ciano'],
    sizes: ['39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&auto=format&fit=crop&q=80',
    description: 'O topo da tecnologia de maratona da Adidas. Varetas de carbono EnergyRods 2.0 e duas camadas de espuma resiliente Lightstrike Pro.'
  },
  {
    name: 'Adidas Grand Court 2.0',
    brand: 'Adidas',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 39999,
    wholesalePrice: 24000,
    wholesaleMinQty: 10,
    colors: ['Cloud White / Black', 'All Black', 'Branco / Dourado'],
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80',
    description: 'Tênis clássico inspirado nas quadras de tênis dos anos 70, com amortecimento Cloudfoam macio para o dia a dia.'
  },
  {
    name: 'Adidas Runfalcon 3.0',
    brand: 'Adidas',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 34999,
    wholesalePrice: 21000,
    wholesaleMinQty: 10,
    colors: ['Preto / Branco', 'Cinza / Laranja', 'Azul Marinho'],
    sizes: ['37', '38', '39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop&q=80',
    description: 'Ideal para caminhadas e treinos leves na esteira. Entressola Cloudfoam macia e solado de borracha aderente.'
  },
  {
    name: 'Adidas Dropset 2 Trainer',
    brand: 'Adidas',
    category: 'Training & Academia',
    gender: 'masculino',
    retailPrice: 89999,
    wholesalePrice: 58000,
    wholesaleMinQty: 4,
    colors: ['Preto / Verde Limão', 'Branco / Cinza'],
    sizes: ['39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
    description: 'Projetado para força e estabilidade em treinos de musculação pesados, com drop zero e suporte no mediopé.'
  },

  // PUMA (6 modelos)
  {
    name: 'Puma Suede Classic XXI',
    brand: 'Puma',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 49999,
    wholesalePrice: 32000,
    wholesaleMinQty: 6,
    colors: ['Preto / Branco', 'Azul Clássico', 'Vermelho'],
    sizes: ['37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
    description: 'Lançado em 1968 e amado por lendas do hip-hop e breakdance. Cabedal totalmente em camurça macia com a clássica Formstrip Puma.'
  },
  {
    name: 'Puma Palermo Special',
    brand: 'Puma',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 59999,
    wholesalePrice: 39000,
    wholesaleMinQty: 6,
    colors: ['Verde / Rosa Retro', 'Azul Marinho / Branco', 'Amarelo Ocre'],
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    description: 'Direto dos arquivos do futebol dos anos 80 na Itália. O Palermo apresenta construção clássica em T-toe e sola de borracha gum.'
  },
  {
    name: 'Puma Velocity Nitro 3',
    brand: 'Puma',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 89999,
    wholesalePrice: 57000,
    wholesaleMinQty: 4,
    colors: ['Sun Stream / Sunset Glow', 'Preto / Prata', 'Azul Elétrico'],
    sizes: ['38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&auto=format&fit=crop&q=80',
    description: 'Espuma NITRO injetada com gás nitrogênio que oferece responsividade superior e amortecimento ultraleve com solado PUMAGRIP lendário.'
  },
  {
    name: 'Puma Deviate Nitro Elite 3',
    brand: 'Puma',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 179999,
    wholesalePrice: 119000,
    wholesaleMinQty: 3,
    colors: ['Fireglow / Neon Green', 'Branco / Ciano'],
    sizes: ['39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    description: 'Tênis de competição com placa de carbono INNOPLATE e espuma NITRO ELITE para máxima velocidade no asfalto.'
  },
  {
    name: 'Puma Caven 2.0',
    brand: 'Puma',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 37999,
    wholesalePrice: 23000,
    wholesaleMinQty: 8,
    colors: ['Branco / Preto', 'Triple White', 'Branco / Verde'],
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
    description: 'Silhueta nostálgica dos anos 80 inspirada no basquete colegial com palmilha SoftFoam+ de conforto imediato.'
  },
  {
    name: 'Puma Fuse 3.0 Training',
    brand: 'Puma',
    category: 'Training & Academia',
    gender: 'masculino',
    retailPrice: 79999,
    wholesalePrice: 51000,
    wholesaleMinQty: 4,
    colors: ['Preto / Laranja', 'Cinza / Amarelo'],
    sizes: ['39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&auto=format&fit=crop&q=80',
    description: 'Desenvolvido com atletas de CrossFit para resistência extrema, tração multidirecional e base ultra estável.'
  },

  // NEW BALANCE (6 modelos)
  {
    name: 'New Balance 550',
    brand: 'New Balance',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 89999,
    wholesalePrice: 58000,
    wholesaleMinQty: 5,
    colors: ['Branco / Verde Vintage', 'Branco / Cinza Neutro', 'Branco / Azul Céu'],
    sizes: ['37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
    description: 'O tributo aos profissionais do basquete de 1989. Visual autêntico em couro macio que se tornou o maior fenômeno de moda da marca.'
  },
  {
    name: 'New Balance 574 Core',
    brand: 'New Balance',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 59999,
    wholesalePrice: 38000,
    wholesaleMinQty: 6,
    colors: ['Cinza Clássico (Grey)', 'Azul Marinho', 'Preto / Branco'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&auto=format&fit=crop&q=80',
    description: 'O tênis mais New Balance de todos os tempos. Combinação infalível de camurça e mesh com tecnologia ENCAP na entressola.'
  },
  {
    name: 'New Balance 9060',
    brand: 'New Balance',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 129999,
    wholesalePrice: 85000,
    wholesaleMinQty: 4,
    colors: ['Sea Salt / Rain Cloud', 'Castlerock Grey', 'Triple Black'],
    sizes: ['38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&auto=format&fit=crop&q=80',
    description: 'Design futurista e arrojado que reinterpreta os elementos clássicos da série 99X com visual ondulado e amortecimento ABZORB.'
  },
  {
    name: 'New Balance Fresh Foam X 1080v13',
    brand: 'New Balance',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 139999,
    wholesalePrice: 92000,
    wholesaleMinQty: 4,
    colors: ['Branco / Azul Claro', 'Preto / Prata', 'Verde Sage'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80',
    description: 'Se a New Balance fizesse apenas um tênis de corrida, seria o 1080. Amortecimento Fresh Foam X ultra fofo para rodagens longas prazerosas.'
  },
  {
    name: 'New Balance 327 Vintage',
    brand: 'New Balance',
    category: 'Casual',
    gender: 'feminino',
    retailPrice: 69999,
    wholesalePrice: 45000,
    wholesaleMinQty: 5,
    colors: ['Bege / Bege Claro', 'Branco / Laranja Sunset', 'Rosa Pastel'],
    sizes: ['34', '35', '36', '37', '38', '39'],
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    description: 'Inspirado nos corredores dos anos 70, o 327 traz o logotipo N oversized assimétrico e sola com cravos envolventes de trilha.'
  },
  {
    name: 'New Balance FuelCell Rebel v4',
    brand: 'New Balance',
    category: 'Corrida',
    gender: 'masculino',
    retailPrice: 109999,
    wholesalePrice: 72000,
    wholesaleMinQty: 4,
    colors: ['Cyber Jade / Amarelo', 'Branco / Preto'],
    sizes: ['39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    description: 'Super leve e elástico. Entressola FuelCell com mistura de PEBA para treinos de ritmo e tiros rápidos com sensação de propulsão.'
  },

  // ASICS (5 modelos)
  {
    name: 'Asics Gel-Nimbus 26',
    brand: 'Asics',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 119999,
    wholesalePrice: 79000,
    wholesaleMinQty: 4,
    colors: ['Black / Pure Silver', 'French Blue', 'Branco / Laranja'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop&q=80',
    description: 'Eleito repetidamente o tênis de corrida mais confortável do mundo. Tecnologia PureGEL no calcanhar e amortecimento FF BLAST PLUS ECO.'
  },
  {
    name: 'Asics Gel-Kayano 30',
    brand: 'Asics',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 129999,
    wholesalePrice: 85000,
    wholesaleMinQty: 4,
    colors: ['Mantra Red / Black', 'White / Deep Ocean', 'Total Black'],
    sizes: ['39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    description: '30 anos de estabilidade lendária para corredores pronadores, agora com o inovador 4D GUIDANCE SYSTEM que se adapta a cada passada.'
  },
  {
    name: 'Asics Novablast 4',
    brand: 'Asics',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 99999,
    wholesalePrice: 66000,
    wholesaleMinQty: 4,
    colors: ['Illusion Blue / Glow Yellow', 'Black / White', 'Verde Menta'],
    sizes: ['38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    description: 'Efeito trampolim energizante com entressola geométrica FF BLAST PLUS ECO para passadas dinâmicas e divertidas.'
  },
  {
    name: 'Asics Gel-1130 Retro',
    brand: 'Asics',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 69999,
    wholesalePrice: 46000,
    wholesaleMinQty: 6,
    colors: ['White / Pure Silver', 'Branco / Verde Vintage', 'Black / Smoke Grey'],
    sizes: ['37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&auto=format&fit=crop&q=80',
    description: 'A estética Y2K da corrida dos anos 2000 em seu ápice. Mesh aberto respirável, detalhes metálicos e amortecimento GEL visível.'
  },
  {
    name: 'Asics Japan S',
    brand: 'Asics',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 44999,
    wholesalePrice: 28000,
    wholesaleMinQty: 8,
    colors: ['Branco / Preto', 'Total White', 'Branco / Azul Marinho'],
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42'],
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    description: 'Herança das quadras de basquete de 1981 com cupsole clássico e listras icônicas da Asics Tiger.'
  },

  // VANS (4 modelos)
  {
    name: 'Vans Old Skool Classic',
    brand: 'Vans',
    category: 'Skateboard',
    gender: 'unissex',
    retailPrice: 39999,
    wholesalePrice: 25000,
    wholesaleMinQty: 8,
    colors: ['Black / White (Sidestripe)', 'Total Black', 'Azul Marinho / Branco'],
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
    description: 'O primeiro a exibir a famosa sidestripe da Vans. Cabedal durável em lona e camurça com a autêntica sola waffle de borracha vulcanizada.'
  },
  {
    name: 'Vans Sk8-Hi',
    brand: 'Vans',
    category: 'Skateboard',
    gender: 'unissex',
    retailPrice: 47999,
    wholesalePrice: 31000,
    wholesaleMinQty: 6,
    colors: ['Black / White', 'Total Black', 'Xadrez Checkerboard'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    description: 'Cano alto lendário com cano acolchoado para suporte aos tornozelos dos skatistas e biqueiras reforçadas para suportar o desgaste.'
  },
  {
    name: 'Vans Authentic',
    brand: 'Vans',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 34999,
    wholesalePrice: 22000,
    wholesaleMinQty: 10,
    colors: ['Black', 'True White', 'Red / Branco', 'Navy'],
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42'],
    image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&auto=format&fit=crop&q=80',
    description: 'O modelo original da Vans nascido em Anaheim, Califórnia, em 1966. Silhueta simples e perfeita com cadarço e cabedal de lona reforçada.'
  },
  {
    name: 'Vans Knu Skool Chunky',
    brand: 'Vans',
    category: 'Skateboard',
    gender: 'unissex',
    retailPrice: 54999,
    wholesalePrice: 35000,
    wholesaleMinQty: 6,
    colors: ['Black / White 3D', 'Navy / White', 'Brown / Gum'],
    sizes: ['37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
    description: 'Reedição inflada dos anos 90 com língua super acolchoada, sidestripe 3D diamantada e cadarços grossos característicos.'
  },

  // MIZUNO (3 modelos)
  {
    name: 'Mizuno Wave Prophecy 12',
    brand: 'Mizuno',
    category: 'Corrida',
    gender: 'masculino',
    retailPrice: 179999,
    wholesalePrice: 118000,
    wholesaleMinQty: 3,
    colors: ['Preto / Dourado Ouro', 'Grafite / Azul Neon', 'Prata / Vermelho'],
    sizes: ['39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
    description: 'O ícone supremo do amortecimento mecânico Infinity Wave. Máxima absorção de impacto com visual imponente inconfundível.'
  },
  {
    name: 'Mizuno Wave Rider 27',
    brand: 'Mizuno',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 89999,
    wholesalePrice: 58000,
    wholesaleMinQty: 4,
    colors: ['Azul Marinho / Amarelo', 'Preto / Branco', 'Cinza / Laranja'],
    sizes: ['38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    description: 'A lenda japonesa do amortecimento equilibrado com tecnologia Mizuno ENERZY e placa Wave de base vegetal sustentável.'
  },
  {
    name: 'Mizuno Wave Mirai 5',
    brand: 'Mizuno',
    category: 'Esportivo',
    gender: 'unissex',
    retailPrice: 44999,
    wholesalePrice: 28000,
    wholesaleMinQty: 8,
    colors: ['Preto / Laranja', 'Azul Petróleo', 'Chumbo / Verde'],
    sizes: ['37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&auto=format&fit=crop&q=80',
    description: 'Excelente opção para caminhadas e academia com placa Wave no calcanhar que garante passadas suaves e estáveis.'
  },

  // OLYMPIKUS (3 modelos)
  {
    name: 'Olympikus Corre 3',
    brand: 'Olympikus',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 49999,
    wholesalePrice: 32000,
    wholesaleMinQty: 6,
    colors: ['Preto / Amarelo Neon', 'Branco / Azul', 'Laranja Solar'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    description: 'Desenvolvido e testado por maratonistas brasileiros. Pesa apenas 210g com tecnologia Eleva Pro e solado de borracha Gripper antiderrapante.'
  },
  {
    name: 'Olympikus Corre Grafeno 2',
    brand: 'Olympikus',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 79999,
    wholesalePrice: 52000,
    wholesaleMinQty: 4,
    colors: ['Branco / Verde Lima', 'Preto / Ciano'],
    sizes: ['38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop&q=80',
    description: 'O primeiro tênis do mundo com placa de grafeno, proporcionando propulsão incomparável e retorno de energia comprovado.'
  },
  {
    name: 'Olympikus Veloz 2',
    brand: 'Olympikus',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 29999,
    wholesalePrice: 19000,
    wholesaleMinQty: 10,
    colors: ['Preto / Vermelho', 'Azul Marinho', 'Cinza / Coral'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop&q=80',
    description: 'Conforto imbatível e leveza para as atividades do dia a dia com cabedal monofilamento respirável.'
  },

  // FILA (2 modelos)
  {
    name: 'Fila Disruptor II Premium',
    brand: 'Fila',
    category: 'Casual',
    gender: 'feminino',
    retailPrice: 49999,
    wholesalePrice: 32000,
    wholesaleMinQty: 6,
    colors: ['Triple White', 'Branco / Marinho / Vermelho', 'Total Black'],
    sizes: ['34', '35', '36', '37', '38', '39'],
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
    description: 'O rei dos chunky sneakers com sola tratorada marcante, couro premium acolchoado e atitude autêntica dos anos 90.'
  },
  {
    name: 'Fila Float Elite',
    brand: 'Fila',
    category: 'Corrida',
    gender: 'unissex',
    retailPrice: 69999,
    wholesalePrice: 45000,
    wholesaleMinQty: 5,
    colors: ['Branco / Laranja Neon', 'Preto / Prata'],
    sizes: ['38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&auto=format&fit=crop&q=80',
    description: 'Tecnologia Float de amortecimento com retorno de energia contínuo para treinos diários e provas de rua.'
  },

  // REEBOK (2 modelos)
  {
    name: 'Reebok Club C 85 Vintage',
    brand: 'Reebok',
    category: 'Casual',
    gender: 'unissex',
    retailPrice: 59999,
    wholesalePrice: 38000,
    wholesaleMinQty: 6,
    colors: ['Chalk / Glen Green', 'Chalk / Paperwhite', 'White / Royal'],
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
    description: 'Minimalismo britânico e elegância atemporal inspirada nas quadras de grama dos torneios de tênis de 1985.'
  },
  {
    name: 'Reebok Nano X4 Training',
    brand: 'Reebok',
    category: 'Training & Academia',
    gender: 'masculino',
    retailPrice: 99999,
    wholesalePrice: 65000,
    wholesaleMinQty: 4,
    colors: ['Core Black / Gum', 'White / Red', 'Army Green'],
    sizes: ['39', '40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&auto=format&fit=crop&q=80',
    description: 'O tênis oficial do treino de alta intensidade com chassi L.A.R. (Lift and Run) e amortecimento Floatride Energy Foam.'
  }
];

async function seed() {
  console.log(`🚀 Iniciando população de ${SNEAKERS.length} modelos de tênis no banco de dados Supabase...`);

  // 1. Get Tenant and Store
  const tenantRes = await runSQL(`
    select id from tenants where slug = 'tenisstore' limit 1;
  `);
  let tenantId = tenantRes[0]?.id;

  if (!tenantId) {
    const tInsert = await runSQL(`
      insert into tenants (name, slug, whatsapp_number, description)
      values ('Tênis Store Manaus', 'tenisstore', '5592981883786', 'A maior loja de calçados do Amazonas. Envio expresso para Manaus (R$ 1,00) e Interior do AM (Barco R$ 100,00).')
      returning id;
    `);
    tenantId = tInsert[0].id;
  } else {
    await runSQL(`
      update tenants
      set whatsapp_number = '5592981883786',
          name = 'Tênis Store Manaus',
          description = 'A maior loja de calçados do Amazonas. Envio expresso para Manaus (R$ 1,00) e Interior do AM (Barco R$ 100,00).'
      where id = '${tenantId}';
    `);
  }

  const storeRes = await runSQL(`
    select id from stores where tenant_id = '${tenantId}' limit 1;
  `);
  let storeId = storeRes[0]?.id;
  if (!storeId) {
    const sInsert = await runSQL(`
      insert into stores (tenant_id, name, is_main)
      values ('${tenantId}', 'Loja Principal Manaus', true)
      returning id;
    `);
    storeId = sInsert[0].id;
  }

  console.log(`✅ Tenant ID: ${tenantId} | Store ID: ${storeId}`);

  // 2. Loop through all 50 sneakers and upsert them
  let insertedCount = 0;
  let totalVariants = 0;
  let totalStockUnits = 0;

  for (let sIndex = 0; sIndex < SNEAKERS.length; sIndex++) {
    const s = SNEAKERS[sIndex];
    // Brand
    const bRes = await runSQL(`
      insert into brands (tenant_id, name) values ('${tenantId}', '${s.brand.replace(/'/g, "''")}')
      on conflict (tenant_id, name) do update set name = excluded.name
      returning id;
    `);
    const brandId = bRes[0].id;

    // Category
    const cRes = await runSQL(`
      insert into categories (tenant_id, name) values ('${tenantId}', '${s.category.replace(/'/g, "''")}')
      on conflict (tenant_id, name) do update set name = excluded.name
      returning id;
    `);
    const categoryId = cRes[0].id;

    // Product
    const pRes = await runSQL(`
      insert into products (tenant_id, name, brand_id, category_id, description, gender, is_active)
      values (
        '${tenantId}',
        '${s.name.replace(/'/g, "''")}',
        '${brandId}',
        '${categoryId}',
        '${s.description.replace(/'/g, "''")}',
        '${s.gender}',
        true
      )
      on conflict do nothing
      returning id;
    `);

    let productId = pRes[0]?.id;
    if (!productId) {
      const existing = await runSQL(`
        select id from products where tenant_id = '${tenantId}' and name = '${s.name.replace(/'/g, "''")}' limit 1;
      `);
      productId = existing[0]?.id;
    }

    if (!productId) continue;
    insertedCount++;

    // Insert product image into product_images
    await runSQL(`
      insert into product_images (tenant_id, product_id, storage_path, url, position, is_primary)
      values ('${tenantId}', '${productId}', 'products/${productId}/primary.jpg', '${s.image}', 0, true)
      on conflict do nothing;
    `);

    // Variants for each color and size
    for (const color of s.colors) {
      for (const size of s.sizes) {
        const colorCode = color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
        const sku = `${s.brand.slice(0, 3).toUpperCase()}-M${sIndex + 1}-${colorCode}-${size}`;

        const vRes = await runSQL(`
          insert into product_variants (
            tenant_id,
            product_id,
            sku,
            color,
            size,
            price_cents,
            wholesale_price_cents,
            wholesale_min_qty,
            is_active
          )
          values (
            '${tenantId}',
            '${productId}',
            '${sku}',
            '${color.replace(/'/g, "''")}',
            '${size}',
            ${s.retailPrice},
            ${s.wholesalePrice},
            ${s.wholesaleMinQty},
            true
          )
          on conflict (product_id, color, size) do update set
            sku = excluded.sku,
            price_cents = excluded.price_cents,
            wholesale_price_cents = excluded.wholesale_price_cents,
            wholesale_min_qty = excluded.wholesale_min_qty
          returning id;
        `);

        const variantId = vRes[0]?.id;
        if (variantId) {
          totalVariants++;
          // Unified Inventory stock: 8 to 25 units per variant
          const stockQty = Math.floor(Math.random() * 18) + 8;
          totalStockUnits += stockQty;

          await runSQL(`
            insert into inventory (tenant_id, variant_id, quantity, min_quantity)
            values ('${tenantId}', '${variantId}', ${stockQty}, 2)
            on conflict (variant_id) do update set
              quantity = ${stockQty};
          `);
        }
      }
    }

    process.stdout.write(`👟 [${insertedCount}/50] ${s.name} (${s.brand}) — OK\n`);
  }

  console.log(`\n🎉 SUCESSO TOTAL!`);
  console.log(`• Modelos inseridos: ${insertedCount}`);
  console.log(`• Variações de cor e tamanho geradas: ${totalVariants}`);
  console.log(`• Saldo total em estoque único integrado: ${totalStockUnits} unidades`);
  console.log(`• WhatsApp de atendimento configurado: +55 (92) 98188-3786`);
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
