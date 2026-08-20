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

const TOP_BRANDS = [
  // Top Sneakers & Streetwear
  'Nike',
  'Adidas',
  'Jordan',
  'Yeezy',
  'New Balance',
  'Puma',
  'Vans',
  'Converse All Star',
  'Asics',
  'Mizuno',
  'Oakley',
  'Reebok',
  'Fila',
  'Under Armour',
  'On Running',
  'Hoka One One',
  'Timberland',
  'DC Shoes',
  'ÖUS',
  'Hocks',
  'Qix',
  'Vans Skate',
  
  // Nacionais & Performance Esportiva
  'Olympikus',
  'Rainha',
  'Topper',
  'Penalty',
  'Umbro',
  'Kappa',
  'Diadora',
  'Skechers',
  'Mormaii',
  'Everlast',
  
  // Grifes, Casual & Streetwear Fashion
  'Lacoste',
  'Tommy Hilfiger',
  'Calvin Klein',
  'Reserva',
  'Vert / Veja',
  'Redley',
  'Coca-Cola Shoes',
  'John John',
  'Cavalera',
  'Off-White',
  'Balenciaga',
  'Alexander McQueen',
  'Gucci',
  'Louis Vuitton',
  'Armani Exchange',
  'Diesel',
  
  // Feminino & Casual Urbano
  'Farm Rio',
  'Vizzano',
  'Moleca',
  'Beira Rio',
  'Schutz',
  'Arezzo',
  'Anacapri',
  'Via Marte',
  'Dakota',
  'Kolosh',
  'Ramarim',
  'Usaflex',
  'Modare',
  'Piccadilly',
  
  // Sandálias & Slides Urbanos
  'Kenner',
  'Crocs',
  'Havaianas',
  'Rider',
  'Cartago',
  'Ipanema',
  'Kildare',
  'Democrata',
  'Ferracini',
  'Pegada'
];

async function seedBrands() {
  console.log(`🚀 Cadastrando ${TOP_BRANDS.length} marcas mais vendidas no banco de dados...`);

  const sql = `
    do $$
    declare
      v_tenant_id uuid;
      v_brand text;
    begin
      select id into v_tenant_id from tenants where slug = 'tenisstore';

      foreach v_brand in array array[${TOP_BRANDS.map(b => `'${b.replace(/'/g, "''")}'`).join(', ')}]
      loop
        if not exists (select 1 from brands where tenant_id = v_tenant_id and lower(name) = lower(v_brand)) then
          insert into brands (tenant_id, name) values (v_tenant_id, v_brand);
        end if;
      end loop;
    end $$;
  `;

  await runSQL(sql);
  console.log(`✅ Todas as ${TOP_BRANDS.length} marcas foram cadastradas com sucesso no banco de dados!`);
}

seedBrands().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
