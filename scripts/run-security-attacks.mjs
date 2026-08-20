import { readFileSync } from 'fs';

let token = readFileSync('C:\\Users\\phabr\\.supabase\\access-token', 'utf-8').trim();
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
  return JSON.parse(await resp.text());
}

async function runSecurityAuditTests() {
  console.log('🛡️ === INICIANDO TESTES DE SEGURANÇA E TENTATIVAS DE ATAQUE ===\n');

  // 1. Obter um tenant e uma variante real com estoque
  const tenantRes = await runSQL(`select id from tenants where slug = 'tenisstore' limit 1;`);
  const tenantId = tenantRes[0]?.id;

  const variantRes = await runSQL(`
    select pv.id, pv.price_cents, pv.size, pv.color, p.name, inv.quantity
    from product_variants pv
    join products p on p.id = pv.product_id
    join inventory inv on inv.variant_id = pv.id
    where pv.tenant_id = '${tenantId}' and inv.quantity > 0 and pv.price_cents > 10000
    limit 1;
  `);

  if (!variantRes || variantRes.length === 0) {
    console.error('Nenhuma variante encontrada para teste.');
    return;
  }

  const testVariant = variantRes[0];
  console.log(`📌 Produto Alvo do Teste: ${testVariant.name} (${testVariant.color} - Tam ${testVariant.size})`);
  console.log(`💰 Preço Real no Banco: R$ ${(testVariant.price_cents / 100).toFixed(2)}`);
  console.log(`📦 Estoque Atual: ${testVariant.quantity} pares\n`);

  // ATAQUE 1: Tentar comprar com preço adulterado para R$ 0,01 (1 centavo)
  console.log('🚨 ATAQUE 1: Tentativa de manipulação de preço no payload (R$ 0,01)...');
  const fakePriceAttack = await fetch('http://localhost:3000/api/storefront/submit-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      customer: { name: 'Hacker Preço Falso', phone: '92999999999', email: 'hacker@test.com' },
      address: { street: 'Rua do Ataque', number: '1' },
      paymentMethod: 'pix',
      shippingCents: 0,
      items: [
        {
          variantId: testVariant.id,
          quantity: 1,
          priceCents: 1, // 1 centavo em vez do preço real!
        }
      ]
    })
  });

  const attack1Res = await fakePriceAttack.json();
  console.log('Resultado Ataque 1:', attack1Res);

  if (attack1Res.success && attack1Res.order?.total_cents === 1) {
    console.log('⚠️ VULNERABILIDADE CONFIRMADA: O pedido foi registrado com R$ 0,01!');
  } else {
    console.log('🛡️ Proteção ativa ou rejeitado.');
  }

  // ATAQUE 2: Tentar comprar com quantidade negativa (-5) para injetar estoque
  console.log('\n🚨 ATAQUE 2: Tentativa de compra com quantidade negativa (-5)...');
  const negativeQtyAttack = await fetch('http://localhost:3000/api/storefront/submit-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      customer: { name: 'Hacker Quantidade Negativa', phone: '92999999999', email: 'hacker@test.com' },
      address: { street: 'Rua do Ataque', number: '1' },
      paymentMethod: 'pix',
      shippingCents: 0,
      items: [
        {
          variantId: testVariant.id,
          quantity: -5,
          priceCents: testVariant.price_cents,
        }
      ]
    })
  });

  const attack2Res = await negativeQtyAttack.json();
  console.log('Resultado Ataque 2:', attack2Res);

  // ATAQUE 3: Tentar aplicar frete negativo para obter desconto ilegal
  console.log('\n🚨 ATAQUE 3: Tentativa de frete negativo (-R$ 500,00)...');
  const negativeShippingAttack = await fetch('http://localhost:3000/api/storefront/submit-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      customer: { name: 'Hacker Frete Negativo', phone: '92999999999', email: 'hacker@test.com' },
      address: { street: 'Rua do Ataque', number: '1' },
      paymentMethod: 'pix',
      shippingCents: -50000,
      items: [
        {
          variantId: testVariant.id,
          quantity: 1,
          priceCents: testVariant.price_cents,
        }
      ]
    })
  });

  const attack3Res = await negativeShippingAttack.json();
  console.log('Resultado Ataque 3:', attack3Res);

  // Limpeza de pedidos de teste criados nos ataques
  await runSQL(`
    delete from sale_items where sale_id in (select id from sales where customer_name like 'Hacker%');
    delete from payments where sale_id in (select id from sales where customer_name like 'Hacker%');
    delete from sales where customer_name like 'Hacker%';
  `);
  console.log('\n🧹 Pedidos de teste de segurança limpos.');
}

runSecurityAuditTests().catch(console.error);
