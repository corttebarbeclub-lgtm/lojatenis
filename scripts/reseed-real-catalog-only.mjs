import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmlxhsqfvxjggvqusleu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhoc3FmdnhqZ2d2cXVzbGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg1MTc0NiwiZXhwIjoyMTAyNDI3NzQ2fQ.Gltxl_0sgDT7SGH6H5xM8xFQ1t5y8I-uiF48NUt-txE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REAL_PRODUCTS = [
  // --- NIKE ---
  {
    name: "Nike Air Jordan 4 Retro Military Black",
    brand: "Nike",
    category: "Casual",
    gender: "unissex",
    description: "O clássico Nike Air Jordan 4 Retro Military Black combina cabedal em couro premium branco, sobreposições em camurça cinza e detalhes contrastantes em preto fosco. Conta com amortecimento Air visível no calcanhar e acabamento de alta qualidade com tag metálica exclusiva.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Preto"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.04.jpeg"
    ]
  },
  {
    name: "Nike Air Jordan 4 Retro Sail Off-White",
    brand: "Nike",
    category: "Casual",
    gender: "unissex",
    description: "Visual monocromático atemporal com detalhes translúcidos e couro premium texturizado. Uma edição sofisticada que valoriza qualquer look urbano com máximo conforto e presença.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Off-White Monocromático"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.04 (1).jpeg"
    ]
  },
  {
    name: "Nike Air Jordan 4 Retro Fear Pack Cool Grey",
    brand: "Nike",
    category: "Casual",
    gender: "unissex",
    description: "Colorway marcante com degradê de tons cinza e preto com entressola salpicada (speckled) e detalhes em couro nobuck aveludado de altíssima durabilidade.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Cinza/Preto/Grafite"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.02.jpeg"
    ]
  },
  {
    name: "Nike Air Jordan 4 Retro Taupe Haze Mocha",
    brand: "Nike",
    category: "Casual",
    gender: "unissex",
    description: "Apresenta tonalidade terrosa sofisticada com sobreposições em camurça rústica e entressola sail com amortecimento Air encapsulado.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Sail/Mocha/Caramelo"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.02 (1).jpeg"
    ]
  },
  {
    name: "Nike Air Jordan 1 High OG Pink White",
    brand: "Nike",
    category: "Casual",
    gender: "feminino",
    description: "Clássica silhueta de cano alto do Air Jordan 1 com combinação delicada de branco e rosa claro, colarinho acolchoado e o icônico logotipo Wings estampado na lateral.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Rosa Claro/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.52.jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.55 (1).jpeg"
    ]
  },
  {
    name: "Nike Dunk Low Retro Panda Black White",
    brand: "Nike",
    category: "Casual",
    gender: "unissex",
    description: "O tênis mais desejado do streetwear mundial. Cabedal em couro legítimo preto e branco com perfil baixo e sola de borracha antiderrapante com excelente aderência.",
    priceRetail: 64990,
    priceWholesale: 39000,
    cost: 26000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.48.jpeg"
    ]
  },
  {
    name: "Nike Air Force 1 '07 All White Triple White",
    brand: "Nike",
    category: "Casual",
    gender: "unissex",
    description: "O autêntico e icônico Nike Air Force 1 '07 totalmente branco. Construção em couro de flor integral, entressola macia com amortecimento Nike Air e dubrae metálico AF1 nos cadarços.",
    priceRetail: 59990,
    priceWholesale: 36000,
    cost: 24000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco Total"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.46 (1).jpeg"
    ]
  },
  {
    name: "Nike Air Force 1 '07 All Black Triple Black",
    brand: "Nike",
    category: "Casual",
    gender: "unissex",
    description: "Versão all-black monocromática resistente em couro premium, ideal para compor qualquer visual urbano com elegância e durabilidade.",
    priceRetail: 59990,
    priceWholesale: 36000,
    cost: 24000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto Total"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.47 (1).jpeg"
    ]
  },
  {
    name: "Nike Air Force 1 '07 LV8 Double Swoosh Gum",
    brand: "Nike",
    category: "Casual",
    gender: "unissex",
    description: "Edição especial LV8 com duplo Swoosh bordado sobreposto, cabedal off-white com camurça bege e solado clássico em borracha gum.",
    priceRetail: 62990,
    priceWholesale: 38000,
    cost: 25000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Off-White/Bege Gum"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.45.jpeg"
    ]
  },
  {
    name: "Nike Air Force 1 '07 Low Grey Fog Swoosh Caramelo",
    brand: "Nike",
    category: "Casual",
    gender: "unissex",
    description: "Harmonia perfeita entre tons neutros de cinza claro e o contraste do Swoosh em couro caramelo.",
    priceRetail: 61990,
    priceWholesale: 37500,
    cost: 24500,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Cinza Claro/Caramelo"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.45 (1).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.47.jpeg"
    ]
  },
  {
    name: "Nike Air Force 1 Shadow Colorblock Pastel",
    brand: "Nike",
    category: "Casual",
    gender: "feminino",
    description: "Design lúdico com estética em camadas duplas: 2 ilhoses, 2 proteções contra lama e 2 Swooshes em paleta suave de tons pastel rosa, lilás e verde água.",
    priceRetail: 64990,
    priceWholesale: 39000,
    cost: 26000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Colorblock Pastel (Rosa/Lilás/Verde)"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.46.jpeg"
    ]
  },
  {
    name: "Nike ZoomX Invincible Run 3 Branco e Preto",
    brand: "Nike",
    category: "Corrida",
    gender: "unissex",
    description: "Com o máximo de amortecimento ZoomX e espuma super responsiva, o Invincible Run 3 oferece suporte superior e passadas extremamente suaves para treinos diários e longas distâncias.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Preto"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.41.jpeg"
    ]
  },
  {
    name: "Nike ZoomX Invincible Run 3 Pink Foam Feminino",
    brand: "Nike",
    category: "Corrida",
    gender: "feminino",
    description: "Amortecimento ultra macio com espuma ZoomX em elegante tom Rosa Bebê com cabedal em Flyknit respirável e contraforte reforçado para estabilidade.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Rosa Pink Foam"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.41 (1).jpeg"
    ]
  },
  {
    name: "Nike ZoomX Invincible Run 3 Lilás Purple",
    brand: "Nike",
    category: "Corrida",
    gender: "feminino",
    description: "Tonalidade lilás suave com espuma ZoomX que devolve a energia de cada impacto. Conforto inigualável nos pés.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Lilás Purple Pastel"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.41 (2).jpeg"
    ]
  },
  {
    name: "Nike ZoomX Invincible Run 3 Guava Ice Off-White",
    brand: "Nike",
    category: "Corrida",
    gender: "unissex",
    description: "Estética limpa em tom off-white suave com detalhes em bronze/dourado e base robusta com alta absorção de choque.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Guava Ice Off-White"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.42.jpeg"
    ]
  },
  {
    name: "Nike ZoomX Invincible Run 3 Marrom Terracota",
    brand: "Nike",
    category: "Corrida",
    gender: "unissex",
    description: "Edição especial com tons terrosos quentes e sola de borracha waffle tracionada de longa durabilidade.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Marrom Terracota"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.42 (1).jpeg"
    ]
  },
  {
    name: "Nike ZoomX Invincible Run 3 Branco e Dourado Metallic",
    brand: "Nike",
    category: "Corrida",
    gender: "feminino",
    description: "Combinação sofisticada de branco neve e swoosh em dourado metálico sobre a icônica entressola ZoomX.",
    priceRetail: 81990,
    priceWholesale: 49000,
    cost: 33000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Branco/Dourado Metálico"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.42 (2).jpeg"
    ]
  },
  {
    name: "Nike ZoomX Invincible Run 3 All White Gum Sole",
    brand: "Nike",
    category: "Corrida",
    gender: "unissex",
    description: "Cabedal branco total combinado com solado em borracha natural Gum. Versatilidade para corridas de alta quilometragem ou uso casual moderno.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Solado Gum"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.43.jpeg"
    ]
  },
  {
    name: "Nike ZoomX Invincible Run 3 Nude Rosê Feminino",
    brand: "Nike",
    category: "Corrida",
    gender: "feminino",
    description: "Visual feminino delicado em bege e rosê com trama Flyknit elástica e acolchoamento extra no calcanhar.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Bege/Rosê"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.43 (1).jpeg"
    ]
  },
  {
    name: "Nike Motiva Flyknit Feminino Multicolor",
    brand: "Nike",
    category: "Caminhada",
    gender: "feminino",
    description: "Projetado com formato rocker curvado para impulsionar caminhadas e corridas leves sem esforço. Cores energéticas em rosa e lilás.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Rosa/Lilás/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.44.jpeg"
    ]
  },
  {
    name: "Nike Motiva / Pegasus Flyknit Preto Mescla",
    brand: "Nike",
    category: "Caminhada",
    gender: "unissex",
    description: "Cabedal em knit respirável mesclado com entressola tratorada ultramacia que absorve qualquer irregularidade do solo.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Preto/Cinza Mescla"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.40.jpeg"
    ]
  },
  {
    name: "Nike Air Zoom Pegasus 40 Feminino Salmão e Azul",
    brand: "Nike",
    category: "Corrida",
    gender: "feminino",
    description: "O tênis de corrida mais clássico da Nike em sua 40ª geração. Unidade Zoom Air dupla no antepé e calcanhar para resposta imediata.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Salmão/Azul Claro"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.44 (1).jpeg"
    ]
  },
  {
    name: "Nike Air Zoom Pegasus 40 Branco com Swoosh Pink",
    brand: "Nike",
    category: "Corrida",
    gender: "feminino",
    description: "Design esportivo clean com destaque para o swoosh em pink vibrante e malha de engenharia respirável.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Branco/Swoosh Pink"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.44 (2).jpeg"
    ]
  },
  {
    name: "Nike Air Zoom Pegasus 40 Branco e Verde Água",
    brand: "Nike",
    category: "Corrida",
    gender: "feminino",
    description: "Visual refrescante com tons de verde água e espuma React responsiva para treinos de corrida diários.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Branco/Verde Água"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.44 (3).jpeg"
    ]
  },
  {
    name: "Nike Air Zoom Pegasus 40 Preto e Branco",
    brand: "Nike",
    category: "Corrida",
    gender: "masculino",
    description: "Versão clássica preta com swoosh branco contrastante. A escolha definitiva para atletas e praticantes de corrida.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.44 (4).jpeg"
    ]
  },
  {
    name: "Nike Air Zoom Pegasus 40 Branco e Prata Metálico",
    brand: "Nike",
    category: "Corrida",
    gender: "unissex",
    description: "Acabamento prateado brilhante sobre cabedal branco leve. Elegância e alta performance técnica em cada passada.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco/Prata"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.44 (5).jpeg"
    ]
  },

  // --- ADIDAS ---
  {
    name: "Adidas Samba OG Core Black Clássico",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "O maior ícone da cultura sneaker atual. Cabedal em couro macio preto, biqueira em T em camurça e solado de borracha natural gum com o clássico Trefoil na língua.",
    priceRetail: 59990,
    priceWholesale: 36000,
    cost: 24000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco/Sola Gum"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.23 (2).jpeg"
    ]
  },
  {
    name: "Adidas Samba OG Cloud White Clássico",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "O clássico branco com as 3 listras pretas e biqueira em camurça cinza claro com solado tradicional gum.",
    priceRetail: 59990,
    priceWholesale: 36000,
    cost: 24000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Preto/Sola Gum"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.23 (5).jpeg"
    ]
  },
  {
    name: "Adidas Samba OG Marrom Dark Brown Suede",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Edição premium em camurça marrom café com listras brancas e solado caramelo gum de visual refinado.",
    priceRetail: 62990,
    priceWholesale: 38000,
    cost: 25000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Marrom Café/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.23.jpeg"
    ]
  },
  {
    name: "Adidas Samba OG Off-White Silver Stripes",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Cabedal em couro off-white suave com 3 listras prateadas metalizadas brilhantes.",
    priceRetail: 62990,
    priceWholesale: 38000,
    cost: 25000,
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42"],
    colors: ["Off-White/Prata Silver"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.23 (1).jpeg"
    ]
  },
  {
    name: "Adidas Samba OG Branco com Detalhes Ouro Dourado",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Estilo luxuoso com inscrição Samba em foil dourado e detalhes nas 3 listras em tom champagne.",
    priceRetail: 62990,
    priceWholesale: 38000,
    cost: 25000,
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42"],
    colors: ["Branco/Dourado Gold"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.23 (3).jpeg"
    ]
  },
  {
    name: "Adidas Samba OG Branco e Nude Sola Gum",
    brand: "Adidas",
    category: "Casual",
    gender: "feminino",
    description: "Tons claros neutros que combinam perfeitamente com alfaiataria ou jeans para composições casuais elegantes.",
    priceRetail: 59990,
    priceWholesale: 36000,
    cost: 24000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Branco/Nude Bege"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.23 (4).jpeg"
    ]
  },
  {
    name: "Adidas Sambae Preto Plataforma Solado Gum",
    brand: "Adidas",
    category: "Casual",
    gender: "feminino",
    description: "A releitura ousada do Samba com solado plataforma elevado em borracha gum semitranslúcida e cabedal em couro nobre preto com bordado denso.",
    priceRetail: 64990,
    priceWholesale: 39000,
    cost: 26000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Preto Plataforma/Gum"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.19.jpeg"
    ]
  },
  {
    name: "Adidas Campus 00s Core Black Suede",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Inspirado no estilo do skate dos anos 2000, com formato chunky acolchoado, camurça preta nobre, cadarços extralargos e solado de borracha gum tratorada.",
    priceRetail: 59990,
    priceWholesale: 36000,
    cost: 24000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto Camurça/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (10).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.35 (2).jpeg"
    ]
  },
  {
    name: "Adidas Campus 00s Dark Brown Camurça",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Visual retrô em camurça aveludada marrom escuro com listras grossas brancas e sola gum caramelo.",
    priceRetail: 61990,
    priceWholesale: 37500,
    cost: 24500,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Marrom Dark Brown"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (3).jpeg"
    ]
  },
  {
    name: "Adidas Campus 00s Grey Suede Cinza Claro",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Camurça cinza clara aveludada com as três listras brancas encorpadas e forro interno superacolchoado.",
    priceRetail: 59990,
    priceWholesale: 36000,
    cost: 24000,
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Cinza Claro Suede"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.34 (1).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.36 (1).jpeg"
    ]
  },
  {
    name: "Adidas Campus 00s Baby Blue Azul Bebê Suede",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Camurça nobre em azul bebê suave com as 3 listras grossas e solado de borracha natural gum.",
    priceRetail: 62990,
    priceWholesale: 38000,
    cost: 25000,
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42"],
    colors: ["Azul Bebê Baby Blue"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.36.jpeg"
    ]
  },
  {
    name: "Adidas Campus 00s Sand Bege com Cadarço Azul",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Combinação descolada de camurça bege areia com cadarços extralargos em azul celeste contrastante.",
    priceRetail: 62990,
    priceWholesale: 38000,
    cost: 25000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Bege Areia/Azul Celeste"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.36 (2).jpeg"
    ]
  },
  {
    name: "Adidas Campus 00s Branco com Listras Rosa e Pingente Trefoil",
    brand: "Adidas",
    category: "Casual",
    gender: "feminino",
    description: "Edição especial com pingente Trefoil metálico nos cadarços e 3 listras em rosa chiclete sobre couro premium branco.",
    priceRetail: 64990,
    priceWholesale: 39000,
    cost: 26000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Branco/Rosa com Pingente"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.35.jpeg"
    ]
  },
  {
    name: "Adidas Campus 00s Branco e Preto com Medalha Trefoil",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Acompanha medalha metálica Trefoil colecionável, cabedal em couro branco e as icônicas listras pretas.",
    priceRetail: 64990,
    priceWholesale: 39000,
    cost: 26000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco/Preto com Medalha"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.35 (1).jpeg"
    ]
  },
  {
    name: "Adidas Campus 00s All White Branco Chunky",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Monocromático branco total com visual robusto característico dos anos 2000.",
    priceRetail: 59990,
    priceWholesale: 36000,
    cost: 24000,
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco Total"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.35 (3).jpeg"
    ]
  },
  {
    name: "Adidas Superstar Clássico Shell Toe Branco e Preto",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "A icônica biqueira em concha (shell toe) em borracha que atravessou décadas das quadras de basquete às ruas de todo o planeta.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Preto"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (4).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.36 (3).jpeg"
    ]
  },
  {
    name: "Adidas Superstar Slip-On Triple Black",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Praticidade absoluta sem cadarços com faixas elásticas cruzadas sobre cabedal em neoprene e biqueira shell toe.",
    priceRetail: 49990,
    priceWholesale: 30000,
    cost: 20000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Preto Total Triple Black"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.23 (6).jpeg"
    ]
  },
  {
    name: "Adidas Adizero Adios Pro 3 Pink Lightstrike Pro",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "O tênis mais veloz de maratonas da Adidas. Duas camadas de espuma resiliente Lightstrike Pro e hastes EnergyRods 2.0 infundidas com carbono para propulsão incomparável.",
    priceRetail: 99990,
    priceWholesale: 62000,
    cost: 45000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Pink/Laranja Solar Lightstrike Pro"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.25.jpeg"
    ]
  },
  {
    name: "Adidas Adizero Boston 12 Branco e Verde Limão",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Construído para treinos de média e longa distância, com amortecimento ultraleve Lightstrike Pro no topo e Lightstrike 2.0 na base para transições dinâmicas.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Verde Limão/Lilás"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.38.jpeg"
    ]
  },
  {
    name: "Adidas Adizero Boston 12 Feminino Rosa Pastel",
    brand: "Adidas",
    category: "Corrida",
    gender: "feminino",
    description: "Versão feminina em rosa delicado com hastes de fibra de vidro EnergyRods para corridas com ritmo e propulsão.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Rosa Pastel"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.38 (3).jpeg"
    ]
  },
  {
    name: "Adidas Adizero Boston 12 Terracota Laranja Queimado",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Colorway marcante terracota com solado em borracha Continental de máxima tração em pisos secos e molhados.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Terracota/Caramelo"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (1).jpeg"
    ]
  },
  {
    name: "Adidas Adizero Evo SL Lightstrike Branco e Preto",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Inspirado no recordista Evo 1, o Evo SL traz a engenharia de alta performance com amortecimento Lightstrike Pro por toda a extensão.",
    priceRetail: 74990,
    priceWholesale: 45000,
    cost: 30000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Preto Lightstrike"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (5).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (13).jpeg"
    ]
  },
  {
    name: "Adidas Adizero Evo SL Lightstrike Preto e Branco",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Silhueta veloz com cabedal em malha translúcida preta e entressola branca com retorno de energia extraordinário.",
    priceRetail: 74990,
    priceWholesale: 45000,
    cost: 30000,
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Preto/Branco Lightstrike"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (8).jpeg"
    ]
  },
  {
    name: "Adidas Adizero Evo SL Off-White Silver",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Tons neutros off-white com detalhes prateados refletivos para treinos e corridas em qualquer horário.",
    priceRetail: 74990,
    priceWholesale: 45000,
    cost: 30000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Off-White/Prata"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (9).jpeg"
    ]
  },
  {
    name: "Adidas Adizero SL Running Triple Black Continental",
    brand: "Adidas",
    category: "Corrida",
    gender: "masculino",
    description: "Amortecimento Lightstrike com inserção de Lightstrike Pro no antepé e sola Continental todo em preto.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Triple Black Continental"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40.jpeg"
    ]
  },
  {
    name: "Adidas Adizero SL Branco / Verde Limão / Rosa",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Cores vibrantes para corredores que buscam ritmo e leveza no dia a dia com excelente custo-benefício.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco/Limão/Rosa"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24.jpeg"
    ]
  },
  {
    name: "Adidas Adizero SL Bege Nude Trefoil",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Tons clean de bege e creme com detalhe Trefoil clássico e tecnologia de corrida Adizero.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    colors: ["Bege Creme/Nude"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (3).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (7).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (2).jpeg"
    ]
  },
  {
    name: "Adidas Adizero SL Cinza Prata Trefoil",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Cinza moderno com acabamento prateado e entressola responsiva Lightstrike.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Cinza/Prata"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (8).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (12).jpeg"
    ]
  },
  {
    name: "Adidas Adizero SL Preto com Rosa",
    brand: "Adidas",
    category: "Corrida",
    gender: "feminino",
    description: "Preto clássico com detalhes em pink nas listras para treinos femininos de alta performance.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Preto/Pink"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (1).jpeg"
    ]
  },
  {
    name: "Adidas Adizero SL Preto com Azul Celeste",
    brand: "Adidas",
    category: "Corrida",
    gender: "masculino",
    description: "Combinação atlética de preto e azul celeste sobre entressola responsiva.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Azul Celeste"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (2).jpeg"
    ]
  },
  {
    name: "Adidas Adizero SL Branco e Prata",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Branco luminoso com as três listras prateadas metalizadas.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco/Prata"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (4).jpeg"
    ]
  },
  {
    name: "Adidas Adizero SL Azul Claro e Branco",
    brand: "Adidas",
    category: "Corrida",
    gender: "unissex",
    description: "Visual leve em azul piscina com listras brancas e cabedal ultrarrespirável.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    colors: ["Azul Claro/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (5).jpeg"
    ]
  },
  {
    name: "Adidas Adizero SL Azul Lilás Pastel",
    brand: "Adidas",
    category: "Corrida",
    gender: "feminino",
    description: "Tons suaves em lilás azulado com máxima leveza.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Azul Lilás Pastel"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (6).jpeg"
    ]
  },
  {
    name: "Adidas Ultraboost 33Y Feminino Rosa",
    brand: "Adidas",
    category: "Corrida",
    gender: "feminino",
    description: "O conforto supremo do amortecimento BOOST 100% em cápsulas em elegante tom rosa com solado Continental de aderência impecável.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Rosa Pastel BOOST"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.23 (7).jpeg"
    ]
  },
  {
    name: "Adidas Questar 2.0 Branco e Rosa",
    brand: "Adidas",
    category: "Caminhada",
    gender: "feminino",
    description: "Entressola Bounce com amortecimento suave e acolchoamento Geofit para suporte ideal nos treinos diários.",
    priceRetail: 39990,
    priceWholesale: 24000,
    cost: 16000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Branco/Rosa"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (9).jpeg"
    ]
  },
  {
    name: "Adidas Neo Daily 3.0 Preto Listras Brancas",
    brand: "Adidas",
    category: "Casual",
    gender: "unissex",
    description: "Estilo casual de skate em lona reforçada com solado vulcanizado de borracha e palmilha OrthoLite macia.",
    priceRetail: 34990,
    priceWholesale: 21000,
    cost: 14000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Preto/Branco Vulcanizado"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (10).jpeg"
    ]
  },
  {
    name: "Adidas Lite Racer 3.0 Preto Sola Branca",
    brand: "Adidas",
    category: "Caminhada",
    gender: "masculino",
    description: "Extremamente leve com entressola Cloudfoam que garante sensação de pisar em nuvens no dia a dia.",
    priceRetail: 32990,
    priceWholesale: 19500,
    cost: 13000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Sola Branca Cloudfoam"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.24 (11).jpeg"
    ]
  },

  // --- VANS ---
  {
    name: "Vans Knu Skool Preto e Branco 90s Chunky",
    brand: "Vans",
    category: "Casual",
    gender: "unissex",
    description: "A reinterpretação moderna dos anos 90 do clássico Old Skool. Língua e colarinho extra volumosos, Sidestripe 3D moldada em diamante e puxadores no calcanhar com sola waffle.",
    priceRetail: 49990,
    priceWholesale: 30000,
    cost: 20000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco Chunky"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.50.jpeg"
    ]
  },
  {
    name: "Vans Knu Skool Triple Black All Black Chunky",
    brand: "Vans",
    category: "Casual",
    gender: "unissex",
    description: "Versão monocromática all-black do Knu Skool com camurça preta nobre, Sidestripe tridimensional volumosa e solado de borracha vulcanizada preta.",
    priceRetail: 49990,
    priceWholesale: 30000,
    cost: 20000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto Total Triple Black"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.51.jpeg"
    ]
  },
  {
    name: "Vans Old Skool Core Classic Preto e Branco",
    brand: "Vans",
    category: "Casual",
    gender: "unissex",
    description: "O primeiro tênis de skate da Vans a ostentar a famosa listra lateral Sidestripe. Cabedal resistente em lona e camurça com solado original Waffle em borracha.",
    priceRetail: 39990,
    priceWholesale: 24000,
    cost: 16000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco Clássico"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.51 (1).jpeg"
    ]
  },
  {
    name: "Vans Old Skool Skate All Black Solado Gum Waffle",
    brand: "Vans",
    category: "Casual",
    gender: "unissex",
    description: "Camurça preta resistente com detalhes reforçados DURACAP e o tradicional solado waffle caramelo em borracha natural.",
    priceRetail: 41990,
    priceWholesale: 25000,
    cost: 17000,
    sizes: ["37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Solado Gum"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.51 (2).jpeg"
    ]
  },
  {
    name: "Vans Ultrarange EXO Camurça Marrom Caramelo",
    brand: "Vans",
    category: "Aventura",
    gender: "unissex",
    description: "Desenvolvido para encarar qualquer terreno e aventura urbana. Entressola co-moldada UltraCush Lite, esqueleto EXO de suporte interno e solado tratorado antiderrapante.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Marrom Caramelo/Off-White"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.48 (1).jpeg"
    ]
  },
  {
    name: "Vans Ultrarange EXO Preto e Branco",
    brand: "Vans",
    category: "Aventura",
    gender: "unissex",
    description: "A clássica combinação preto e branco no modelo de maior conforto da Vans. Leveza absoluta e excelente respirabilidade.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.48 (2).jpeg"
    ]
  },
  {
    name: "Vans Ultrarange EXO Preto com Listra Off-White e Sola Gum",
    brand: "Vans",
    category: "Aventura",
    gender: "unissex",
    description: "Visual esportivo aventureiro com base em mesh reforçado preto, listra bege off-white e cravos tratorados em borracha natural gum.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Preto/Listra Bege/Sola Gum"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.49.jpeg"
    ]
  },
  {
    name: "Vans Ultrarange EXO Black White Sole",
    brand: "Vans",
    category: "Aventura",
    gender: "unissex",
    description: "Cabedal todo em preto com entressola UltraCush branca e cravos tratorados invertidos de alta tração.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Preto com Sola Branca"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.49 (1).jpeg"
    ]
  },
  {
    name: "Vans Ultrarange EXO Bege Areia e Café",
    brand: "Vans",
    category: "Aventura",
    gender: "unissex",
    description: "Tons de bege areia combinados com camurça marrom café. Um tênis versátil, confortável e moderno.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42"],
    colors: ["Bege Areia/Café"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.49 (2).jpeg"
    ]
  },
  {
    name: "Vans Ultrarange Rapidweld Cinza Chumbo",
    brand: "Vans",
    category: "Casual",
    gender: "unissex",
    description: "Construção sem costura Rapidweld com forro LuxLiner ajustado como uma meia para conforto sem atrito.",
    priceRetail: 49990,
    priceWholesale: 30000,
    cost: 20000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Cinza Chumbo/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.50 (2).jpeg"
    ]
  },
  {
    name: "Vans Wayvee Skate Preto e Branco",
    brand: "Vans",
    category: "Casual",
    gender: "unissex",
    description: "Criado especificamente para skate de alto nível, unindo cabedal em camurça reforçada e painéis em mesh translúcido com solado WAFFLECUP.",
    priceRetail: 52990,
    priceWholesale: 32000,
    cost: 21000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Preto/Branco WAFFLECUP"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.50 (1).jpeg"
    ]
  },
  {
    name: "Vans Wayvee Skate Branco e Cinza Listra Azul",
    brand: "Vans",
    category: "Casual",
    gender: "unissex",
    description: "Edição clara do Wayvee em tons de branco e cinza claro com a listra lateral Sidestripe em azul celeste.",
    priceRetail: 52990,
    priceWholesale: 32000,
    cost: 21000,
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42"],
    colors: ["Branco/Cinza/Azul Claro"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.51 (3).jpeg"
    ]
  },

  // --- CONVERSE ---
  {
    name: "Converse All Star Chuck Taylor Branco Lona Cano Baixo",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "O calçado mais vendido do mundo. Lona 100% algodão branca respirável com listras vermelha e azul na vira de borracha e palmilha anatômica em Gel Comfort para amortecimento superior.",
    priceRetail: 29990,
    priceWholesale: 18000,
    cost: 12000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco Clássico Lona"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.53.jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor Preto Lona Cano Baixo",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "O lendário All Star preto em lona de algodão com costuras brancas reforçadas e solado de borracha vulcanizada antiderrapante.",
    priceRetail: 29990,
    priceWholesale: 18000,
    cost: 12000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto Clássico Lona"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.53 (2).jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor Vermelho Lona Cano Baixo",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "Vermelho vibrante clássico em lona premium com vira de borracha branca e vira lateral com listra preta.",
    priceRetail: 29990,
    priceWholesale: 18000,
    cost: 12000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Vermelho Clássico"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.53 (1).jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor Amarelo Mostarda Cano Baixo",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "Tom amarelo mostarda/ouro cheio de personalidade com palmilha em gel e costuras contrastantes.",
    priceRetail: 29990,
    priceWholesale: 18000,
    cost: 12000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42"],
    colors: ["Amarelo Mostarda"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.52 (2).jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor All Black Monocromático",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "Versão monocromática totalmente preta em lona, cadarços, ilhoses e sola de borracha 100% preta.",
    priceRetail: 29990,
    priceWholesale: 18000,
    cost: 12000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto Total Monocromático"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.53 (3).jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor Cano Alto Hi-Top Preto Lona",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "A lendária silhueta de cano alto Hi-Top com o emblemático patch All Star Chuck Taylor no tornozelo e lona encorpada.",
    priceRetail: 32990,
    priceWholesale: 19500,
    cost: 13000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto Cano Alto"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.55.jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor Cano Alto Hi-Top Branco Lona",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "Cano alto Hi-Top clássico em lona branca pura com patch circular no tornozelo e palmilha em gel.",
    priceRetail: 32990,
    priceWholesale: 19500,
    cost: 13000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco Cano Alto"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.55 (2).jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor Couro Sintético Branco Rose Gold",
    brand: "Converse",
    category: "Casual",
    gender: "feminino",
    description: "Confeccionado em material sintético resistente de fácil limpeza, com ilhoses em acabamento rosé gold metálico e friso rosa.",
    priceRetail: 34990,
    priceWholesale: 21000,
    cost: 14000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Branco/Rosé Gold"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.54.jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor Couro Sintético Caramelo",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "Visual nobre em couro sintético marrom caramelo com cadarços e costuras tonais e solado branco vulcanizado.",
    priceRetail: 34990,
    priceWholesale: 21000,
    cost: 14000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42"],
    colors: ["Marrom Caramelo Couro"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.54 (1).jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor Couro Sintético All White",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "Branco total em couro sintético macio e impermeabilizado, fácil de higienizar e extremamente durável.",
    priceRetail: 34990,
    priceWholesale: 21000,
    cost: 14000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco Total Couro"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.54 (2).jpeg"
    ]
  },
  {
    name: "Converse All Star Chuck Taylor Couro Sintético Preto Solado Branco",
    brand: "Converse",
    category: "Casual",
    gender: "unissex",
    description: "Couro sintético preto premium com biqueira e solado em borracha branca vulcanizada de alta resistência.",
    priceRetail: 34990,
    priceWholesale: 21000,
    cost: 14000,
    sizes: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Preto Couro/Solado Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.54 (3).jpeg"
    ]
  },

  // --- NEW BALANCE ---
  {
    name: "New Balance 9060 White Silver Grey",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "O modelo sensação da New Balance com design futurista dos anos 2000. Entressola de dupla densidade com amortecimento ABZORB e SBS com logotipo N prateado refletivo e sobreposições em camurça.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Prata/Cinza"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.09.jpeg"
    ]
  },
  {
    name: "New Balance 9060 Dark Brown Chocolate Suede",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "Tons de marrom café e chocolate em camurça premium aveludada com pingente exclusivo NB metálico nos cadarços.",
    priceRetail: 82990,
    priceWholesale: 49500,
    cost: 33000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Marrom Chocolate Suede"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.09 (1).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.31 (3).jpeg"
    ]
  },
  {
    name: "New Balance 9060 Sea Salt Off-White Silver",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "Colorway clean e cobiçada Sea Salt em tons off-white e creme com pingente metálico e cápsulas onduladas ABZORB.",
    priceRetail: 82990,
    priceWholesale: 49500,
    cost: 33000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Sea Salt Off-White"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.10.jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.31 (2).jpeg"
    ]
  },
  {
    name: "New Balance 9060 Off-White e Lilás Pastel",
    brand: "New Balance",
    category: "Casual",
    gender: "feminino",
    description: "Edição com detalhes delicados em lilás translúcido no calcanhar e cabedal em camurça e mesh respirável.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Off-White/Lilás Pastel"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.31.jpeg"
    ]
  },
  {
    name: "New Balance 9060 Black Castlerock White",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "Combinação contrastante de preto em camurça nobre e entressola esculpida branca com logotipo N estilizado bordado.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco Castlerock"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.31 (1).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.32 (1).jpeg"
    ]
  },
  {
    name: "New Balance 9060 Couro Branco e Preto",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "Versão refinada em couro branco com sobreposições pretas e sola diamantada de estabilidade e tração.",
    priceRetail: 79990,
    priceWholesale: 48000,
    cost: 32000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco/Preto Couro"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.32.jpeg"
    ]
  },
  {
    name: "New Balance 247 White Tan com Sola Gum",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "Silhueta clássica 247 em couro perfurado branco com detalhe em couro caramelo no calcanhar, entressola leve REVlite e sola gum.",
    priceRetail: 44990,
    priceWholesale: 27000,
    cost: 18000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco/Caramelo Gum"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.32 (2).jpeg"
    ]
  },
  {
    name: "New Balance 247 Black White Sport",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "Preto clássico com logotipo N contornado em branco e amortecimento ultraleve REVlite para caminhada e rotina diária.",
    priceRetail: 44990,
    priceWholesale: 27000,
    cost: 18000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco REVlite"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.32 (3).jpeg"
    ]
  },
  {
    name: "New Balance 247 Branco e Preto Couro Perfurado",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "Construção em material sintético perfurado de alta ventilação com N preto em alto relevo e cadarços encorpados.",
    priceRetail: 44990,
    priceWholesale: 27000,
    cost: 18000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco/Preto"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.33.jpeg"
    ]
  },
  {
    name: "New Balance 997H Bege Areia com Laranja Solar",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "O modelo 997H moderniza o clássico de corrida dos anos 90 com entressola de espuma ENCAP leve e detalhes em laranja solar.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Bege Incense/Laranja Solar"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.33 (1).jpeg"
    ]
  },
  {
    name: "New Balance 997H White Black Tan",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "Paleta elegante com base branca, biqueira e calcanhar em camurça preta, detalhes cinzas e inserção caramelo na entressola.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Preto/Caramelo"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.33 (2).jpeg"
    ]
  },
  {
    name: "New Balance 997H Black Magnet Preto e Cinza",
    brand: "New Balance",
    category: "Casual",
    gender: "masculino",
    description: "Tons escuros de camurça preta e cinza com N reflexivo para um estilo sóbrio e imponente.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Cinza Black Magnet"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (6).jpeg"
    ]
  },
  {
    name: "New Balance 997H White Black Total",
    brand: "New Balance",
    category: "Casual",
    gender: "unissex",
    description: "Branco puro com contraste cirúrgico do logotipo N em preto fosco.",
    priceRetail: 54990,
    priceWholesale: 33000,
    cost: 22000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco Total/N Preto"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (7).jpeg"
    ]
  },

  // --- ON RUNNING ---
  {
    name: "On Running Cloudmonster 2 Bege Ondulado",
    brand: "On Running",
    category: "Corrida",
    gender: "unissex",
    description: "Amortecimento monstruoso com a maior tecnologia CloudTec da On. Speedboard em nylon para máximo retorno de energia e passada ultradinâmica.",
    priceRetail: 119990,
    priceWholesale: 75000,
    cost: 52000,
    sizes: ["37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Bege Areia/Off-White CloudTec"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.33 (3).jpeg"
    ]
  },
  {
    name: "On Running Cloudmonster 2 Preto e Branco",
    brand: "On Running",
    category: "Corrida",
    gender: "unissex",
    description: "Versão em preto e branco do aclamado Cloudmonster 2 com amortecimento gigante e propulsão extrema em cada passada.",
    priceRetail: 119990,
    priceWholesale: 75000,
    cost: 52000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco CloudTec"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.34.jpeg"
    ]
  },
  {
    name: "On Running Cloudtilt Loewe x On Branco e Cinza",
    brand: "On Running",
    category: "Casual",
    gender: "unissex",
    description: "Colaboração de luxo Loewe x On com entressola computadorizada CloudTec Phase em espuma Helion supermacia e cadarços rápidos Speed-Lacing.",
    priceRetail: 129990,
    priceWholesale: 79000,
    cost: 55000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco/Cinza Loewe x On"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.32 (3).jpeg"
    ]
  },
  {
    name: "On Running Cloudtilt Bege Areia Nude",
    brand: "On Running",
    category: "Caminhada",
    gender: "unissex",
    description: "Visual clean e sofisticado em bege areia. Projetado para quem passa muitas horas em pé e não abre mão de conforto absoluto.",
    priceRetail: 109990,
    priceWholesale: 68000,
    cost: 48000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Bege Areia/Nude"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.38 (1).jpeg"
    ]
  },
  {
    name: "On Running Cloudtilt Off-White e Rosa Pastel",
    brand: "On Running",
    category: "Caminhada",
    gender: "feminino",
    description: "Amortecimento suave com espuma Helion ultraleve e detalhes femininos em rosa pastel.",
    priceRetail: 109990,
    priceWholesale: 68000,
    cost: 48000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Off-White/Rosa Pastel"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.33.jpeg"
    ]
  },
  {
    name: "On Running Cloudtilt Off-White e Azul Céu",
    brand: "On Running",
    category: "Caminhada",
    gender: "unissex",
    description: "Harmonia moderna em off-white com detalhes em azul céu claro sobre a entressola CloudTec Phase.",
    priceRetail: 109990,
    priceWholesale: 68000,
    cost: 48000,
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    colors: ["Off-White/Azul Céu"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.33 (1).jpeg"
    ]
  },
  {
    name: "On Running Cloudtilt All White Monocromático",
    brand: "On Running",
    category: "Caminhada",
    gender: "unissex",
    description: "Estética minimalista total white com máxima absorção de impacto nos pés.",
    priceRetail: 109990,
    priceWholesale: 68000,
    cost: 48000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco Total Monocromático"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.33 (2).jpeg"
    ]
  },
  {
    name: "On Running Cloud 5 Branco e Preto",
    brand: "On Running",
    category: "Caminhada",
    gender: "unissex",
    description: "O modelo favorito para viagens e caminhadas diárias. Sistema de amarração rápida elástica e cápsulas Zero-Gravity CloudTec.",
    priceRetail: 89990,
    priceWholesale: 55000,
    cost: 38000,
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    colors: ["Branco/Preto Cloud 5"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.32.jpeg"
    ]
  },
  {
    name: "On Running Cloud 5 Preto e Rosa",
    brand: "On Running",
    category: "Caminhada",
    gender: "feminino",
    description: "Versão feminina com cabedal preto respirável e cápsulas CloudTec com toques em rosa.",
    priceRetail: 89990,
    priceWholesale: 55000,
    cost: 38000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Preto/Rosa Pink"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.32 (1).jpeg"
    ]
  },
  {
    name: "On Running Cloud 5 Preto com Sola Gum",
    brand: "On Running",
    category: "Caminhada",
    gender: "unissex",
    description: "Cabedal preto elegante e cápsulas CloudTec com inserções em borracha gum antiderrapante.",
    priceRetail: 89990,
    priceWholesale: 55000,
    cost: 38000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Preto/Sola Gum"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.32 (2).jpeg"
    ]
  },
  {
    name: "On Running Cloudnova Caramelo e Bronze",
    brand: "On Running",
    category: "Casual",
    gender: "unissex",
    description: "Conecta tecnologia de performance de corrida com estilo streetwear premium com cano médio acolchoado e CloudTec conectada.",
    priceRetail: 99990,
    priceWholesale: 62000,
    cost: 44000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Caramelo/Bronze"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.38 (2).jpeg"
    ]
  },

  // --- MIZUNO ---
  {
    name: "Mizuno Wave Prophecy Beta Camurça Cinza e Bege",
    brand: "Mizuno",
    category: "Casual",
    gender: "unissex",
    description: "O topo da linha Mizuno Sportstyle. Placa Infinity Wave vazada de alta engenharia combinada com cabedal trabalhado em camurça nobre e mesh texturizado.",
    priceRetail: 129990,
    priceWholesale: 79000,
    cost: 55000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Cinza/Bege Camurça"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.06.jpeg"
    ]
  },
  {
    name: "Mizuno Wave Prophecy Beta Bege Areia Dourado",
    brand: "Mizuno",
    category: "Casual",
    gender: "unissex",
    description: "Edição monocromática luxuosa em bege areia e dourado com amortecimento mecânico Infinity Wave duplo.",
    priceRetail: 129990,
    priceWholesale: 79000,
    cost: 55000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Bege Areia/Dourado"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.07.jpeg"
    ]
  },
  {
    name: "Mizuno Wave Neo Vista Knit Preto Furta-Cor",
    brand: "Mizuno",
    category: "Corrida",
    gender: "unissex",
    description: "Revolução em conforto e responsividade. Cabedal em peça única Knit elástica que se ajusta perfeitamente aos pés, entressola Enerzy NXT superamortecida e logotipo Runbird furta-cor holográfico.",
    priceRetail: 89990,
    priceWholesale: 55000,
    cost: 38000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Furta-Cor Holográfico"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.50.40 (1).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.08 (1).jpeg"
    ]
  },
  {
    name: "Mizuno Wave Neo Vista Knit Branco e Preto",
    brand: "Mizuno",
    category: "Corrida",
    gender: "unissex",
    description: "Cabedal em Knit branco puro com logotipo Runbird em preto contrastante e entressola Enerzy de retorno elástico contínuo.",
    priceRetail: 89990,
    priceWholesale: 55000,
    cost: 38000,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco/Preto Knit"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.50.40 (2).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.08.jpeg"
    ]
  },
  {
    name: "Mizuno Wave Neo Vista Knit Pink Feminino",
    brand: "Mizuno",
    category: "Corrida",
    gender: "feminino",
    description: "Tonalidade rosa vibrante com malha knit respirável de alta elasticidade e máximo conforto em corridas e esteira.",
    priceRetail: 89990,
    priceWholesale: 55000,
    cost: 38000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Pink/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.50.40 (3).jpeg"
    ]
  },
  {
    name: "Mizuno Wave Neo Vista Knit Verde Limão Fluor",
    brand: "Mizuno",
    category: "Corrida",
    gender: "unissex",
    description: "Verde limão fluor marcante para quem quer visibilidade e desempenho de elite nos treinos.",
    priceRetail: 89990,
    priceWholesale: 55000,
    cost: 38000,
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Verde Limão Fluor"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.54.07 (1).jpeg"
    ]
  },

  // --- OLYMPIKUS ---
  {
    name: "Olympikus Corre 3 Laranja Solar",
    brand: "Olympikus",
    category: "Corrida",
    gender: "unissex",
    description: "O tênis de corrida mais premiado do Brasil. Desenvolvido com tecnologia Eleva Pro para máxima resposta, tecnologia Oxitec no cabedal para ventilação extrema e borracha Gripper antiderrapante.",
    priceRetail: 49990,
    priceWholesale: 30000,
    cost: 20000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Laranja Solar/Azul"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.50.40.jpeg"
    ]
  },

  // --- ASICS ---
  {
    name: "Asics Gel-Excite Preto e Pink",
    brand: "Asics",
    category: "Corrida",
    gender: "feminino",
    description: "Amortecimento em GEL no calcanhar combinado com entressola AmpliFoam macia para conforto diário em treinos, caminhadas e academia.",
    priceRetail: 39990,
    priceWholesale: 24000,
    cost: 16000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Preto/Pink GEL"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.52 (3).jpeg"
    ]
  },

  // --- EVERLAST ---
  {
    name: "Bota de Treino Everlast Forceknit Feminina Preto e Pink",
    brand: "Everlast",
    category: "Treino",
    gender: "feminino",
    description: "Bota de cano alto para treino de musculação, boxe e artes marciais. Cabedal em tecido mesh respirável Forceknit, sola reta emborrachada de alta estabilidade e tração nos treinos pesados.",
    priceRetail: 34990,
    priceWholesale: 21000,
    cost: 14000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Preto/Pink Forceknit"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.53.52 (1).jpeg"
    ]
  },

  // --- LOUIS VUITTON ---
  {
    name: "Louis Vuitton LV Skate Sneaker Monogram Preto e Branco",
    brand: "Louis Vuitton",
    category: "Casual",
    gender: "unissex",
    description: "Inspirado na estética do skate dos anos 90, confeccionado com rica mistura de materiais, detalhes em flores do Monogram estilizadas e solado técnico bicolor.",
    priceRetail: 149990,
    priceWholesale: 89000,
    cost: 62000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Branco Monogram"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.52.30.jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.52.30 (2).jpeg"
    ]
  },
  {
    name: "Louis Vuitton LV Skate Sneaker Monogram All White",
    brand: "Louis Vuitton",
    category: "Casual",
    gender: "unissex",
    description: "Versão monocromática totalmente branca com relevos Monogram Flower e acabamento artesanal de alto padrão.",
    priceRetail: 149990,
    priceWholesale: 89000,
    cost: 62000,
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Branco Total Monogram"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.52.30 (1).jpeg"
    ]
  },
  {
    name: "Louis Vuitton LV Skate Sneaker Monogram Cinza e Branco",
    brand: "Louis Vuitton",
    category: "Casual",
    gender: "unissex",
    description: "Tons de cinza e branco sobrepostos com gola acolchoada e cadarços duplos volumosos.",
    priceRetail: 149990,
    priceWholesale: 89000,
    cost: 62000,
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: ["Cinza/Branco Monogram"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.52.30 (3).jpeg"
    ]
  },

  // --- CATERPILLAR ---
  {
    name: "Bota Adventure Caterpillar Nobuck Couro Preto",
    brand: "Caterpillar",
    category: "Botas",
    gender: "masculino",
    description: "A clássica bota adventure em couro nobuck legítimo preto com solado tratorado costurado de altíssima resistência, palmilha anatômica e colarinho acolchoado para máxima proteção e conforto.",
    priceRetail: 44990,
    priceWholesale: 27000,
    cost: 18000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto Nobuck Tratorado"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.52.31.jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.52.31 (1).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.52.31 (2).jpeg"
    ]
  },

  // --- ALO YOGA ---
  {
    name: "Alo Yoga 01 Classic Plataforma Preto e Branco",
    brand: "Alo Yoga",
    category: "Casual",
    gender: "feminino",
    description: "Sneaker luxuoso da marca californiana Alo Yoga com solado plataforma estruturado, cabedal em couro de alta qualidade e palmilha de recuperação de energia.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Preto/Branco"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.25 (1).jpeg"
    ]
  },
  {
    name: "Alo Yoga 01 Classic Plataforma Off-White e Marrom",
    brand: "Alo Yoga",
    category: "Casual",
    gender: "feminino",
    description: "Elegante combinação off-white com detalhes marrom café e solado plataforma que une moda wellness e streetwear.",
    priceRetail: 69990,
    priceWholesale: 42000,
    cost: 28000,
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Off-White/Marrom Café"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.25 (2).jpeg"
    ]
  },

  // --- AVILLA SOCIAL ---
  {
    name: "Sapato Mocassim Drive Avilla Couro Genuíno Camel",
    brand: "Avilla",
    category: "Casual",
    gender: "masculino",
    description: "Mocassim drive clássico confeccionado em couro legítimo aveludado cor camel/caramelo, com costuras manuais e solado emborrachado com cravos drive para máximo conforto e elegância.",
    priceRetail: 39990,
    priceWholesale: 24000,
    cost: 16000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Camel Caramelo Couro"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (11).jpeg",
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (15).jpeg"
    ]
  },
  {
    name: "Sapato Mocassim Drive Avilla Couro Genuíno Preto",
    brand: "Avilla",
    category: "Casual",
    gender: "masculino",
    description: "Mocassim drive social em couro preto legítimo com palmilha macia acolchoada e acabamento premium.",
    priceRetail: 39990,
    priceWholesale: 24000,
    cost: 16000,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto Couro Genuíno"],
    images: [
      "/products/real/WhatsApp Image 2026-08-19 at 03.51.40 (14).jpeg"
    ]
  }
];

async function main() {
  console.log('🔄 Iniciando limpeza dos dados fictícios e cadastro exclusivo do catálogo 100% real...');

  // 1. Obter tenant tenisstore
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .eq('slug', 'tenisstore')
    .single();

  if (tenantErr || !tenant) {
    console.error('❌ Erro ao buscar tenant tenisstore:', tenantErr);
    process.exit(1);
  }

  const tenantId = tenant.id;
  console.log(`✅ Tenant encontrado: ${tenant.name} (${tenantId})`);

  // 2. Deletar vendas e movimentações de testes anteriores vinculadas aos produtos antigos
  console.log('🗑️ Removendo vendas de teste e movimentações vinculadas...');
  await supabase.from('sale_items').delete().eq('tenant_id', tenantId);
  await supabase.from('sales').delete().eq('tenant_id', tenantId);
  await supabase.from('wholesale_order_items').delete().eq('tenant_id', tenantId);
  await supabase.from('wholesale_orders').delete().eq('tenant_id', tenantId);
  await supabase.from('inventory_movements').delete().eq('tenant_id', tenantId);
  await supabase.from('inventory').delete().eq('tenant_id', tenantId);

  console.log('🗑️ Removendo produtos antigos e fictícios...');
  const { error: delErr } = await supabase
    .from('products')
    .delete()
    .eq('tenant_id', tenantId);

  if (delErr) {
    console.error('❌ Erro ao deletar produtos antigos:', delErr);
    process.exit(1);
  }
  console.log('✅ Produtos antigos removidos com sucesso!');

  // 3. Cadastrar/Garantir marcas
  const brandsSet = [...new Set(REAL_PRODUCTS.map(p => p.brand))];
  const brandMap = {};
  for (const bName of brandsSet) {
    let { data: b } = await supabase
      .from('brands')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('name', bName)
      .maybeSingle();

    if (!b) {
      const { data: newB, error: bErr } = await supabase
        .from('brands')
        .insert({ tenant_id: tenantId, name: bName })
        .select('id')
        .single();
      if (bErr) console.error(`Erro ao criar marca ${bName}:`, bErr);
      brandMap[bName] = newB?.id;
    } else {
      brandMap[bName] = b.id;
    }
  }
  console.log(`✅ ${Object.keys(brandMap).length} Marcas prontas.`);

  // 4. Cadastrar/Garantir categorias
  const catsSet = [...new Set(REAL_PRODUCTS.map(p => p.category))];
  const catMap = {};
  for (const cName of catsSet) {
    let { data: c } = await supabase
      .from('categories')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('name', cName)
      .maybeSingle();

    if (!c) {
      const { data: newC, error: cErr } = await supabase
        .from('categories')
        .insert({ tenant_id: tenantId, name: cName })
        .select('id')
        .single();
      if (cErr) console.error(`Erro ao criar categoria ${cName}:`, cErr);
      catMap[cName] = newC?.id;
    } else {
      catMap[cName] = c.id;
    }
  }
  console.log(`✅ ${Object.keys(catMap).length} Categorias prontas.`);

  // 5. Inserir cada produto real com variantes, fotos e estoque
  let totalInserted = 0;
  for (let i = 0; i < REAL_PRODUCTS.length; i++) {
    const item = REAL_PRODUCTS[i];
    const brandId = brandMap[item.brand] || null;
    const catId = catMap[item.category] || null;

    // Inserir produto
    const { data: prod, error: prodErr } = await supabase
      .from('products')
      .insert({
        tenant_id: tenantId,
        name: item.name,
        brand_id: brandId,
        category_id: catId,
        gender: item.gender,
        description: item.description,
        is_active: true
      })
      .select('id')
      .single();

    if (prodErr || !prod) {
      console.error(`❌ Erro ao inserir produto ${item.name}:`, prodErr);
      continue;
    }

    const productId = prod.id;

    // Inserir imagens
    const imageInserts = item.images.map((imgUrl, idx) => ({
      tenant_id: tenantId,
      product_id: productId,
      storage_path: `real/${idx}`,
      url: imgUrl,
      position: idx,
      is_primary: idx === 0
    }));

    await supabase.from('product_images').insert(imageInserts);

    // Inserir variantes e estoque
    for (const color of item.colors) {
      for (const size of item.sizes) {
        const sku = `${item.brand.substring(0, 3).toUpperCase()}-${productId.substring(0, 4)}-${color.substring(0, 3).toUpperCase()}-${size}`;
        const { data: variant, error: varErr } = await supabase
          .from('product_variants')
          .insert({
            tenant_id: tenantId,
            product_id: productId,
            color: color,
            size: size,
            sku: sku,
            price_cents: item.priceRetail,
            cost_cents: item.cost,
            is_active: true
          })
          .select('id')
          .single();

        if (variant) {
          // Cadastrar estoque inicial de 10 unidades por variação
          await supabase.from('inventory').insert({
            tenant_id: tenantId,
            variant_id: variant.id,
            quantity: 10
          });
        }
      }
    }

    totalInserted++;
  }

  console.log(`🎉 Sucesso total! ${totalInserted} modelos REAIS catalogados e cadastrados no Supabase com fotos, estoque e variantes!`);
}

main().catch(err => {
  console.error('Erro fatal no script:', err);
  process.exit(1);
});
