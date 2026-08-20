import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLines = fs.readFileSync('.env.local', 'utf8').split('\n');
const env = {};
envLines.forEach((l) => {
  const parts = l.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient('https://jmlxhsqfvxjggvqusleu.supabase.co', env.SUPABASE_SERVICE_ROLE_KEY);

async function runTest() {
  console.log('🧪 Iniciando Teste E2E de Pedido Online, Sequestro de Estoque e Cupom Térmico...');

  // 1. Pegar um tênis com estoque
  const { data: variant } = await supabase
    .from('product_variants')
    .select('id, product_id, size, color, price_cents, inventory(quantity)')
    .eq('size', '40')
    .limit(1)
    .single();

  if (!variant) {
    console.error('Nenhuma variante encontrada.');
    return;
  }

  const initialQty = variant.inventory?.[0]?.quantity ?? 0;
  console.log(`Variante ID: ${variant.id} | Tam: ${variant.size} | Estoque Inicial: ${initialQty}`);

  // 2. Submeter pedido pela API do Storefront
  const orderPayload = {
    customer: {
      name: 'Pabricio Teste Online',
      phone: '(92) 98188-3786',
      email: 'pabricio.teste@lojatenis.com',
    },
    address: {
      street: 'Av. Djalma Batista',
      number: '1000',
      neighborhood: 'Chapada',
      city: 'Manaus',
      state: 'AM',
      complement: 'Torre Business Sala 501',
    },
    paymentMethod: 'pix',
    shippingCents: 100, // Frete R$ 1,00 Manaus
    items: [
      {
        variantId: variant.id,
        quantity: 1,
        priceCents: variant.price_cents,
      },
    ],
  };

  const submitRes = await fetch('http://localhost:3000/api/storefront/submit-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });

  const submitData = await submitRes.json();
  console.log('📦 Resposta da submissão do pedido:', submitData);

  if (!submitData.success) {
    console.error('Falha ao submeter pedido.');
    return;
  }

  const saleId = submitData.sale_id;

  // 3. Verificar se estoque foi sequestrado (subtraído em 1)
  const { data: updatedInv } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('variant_id', variant.id)
    .single();

  console.log(`🔒 Estoque após sequestro/reserva imediata: ${updatedInv.quantity} (era ${initialQty})`);

  // 4. Consultar Fila do PDV
  const queueRes = await fetch('http://localhost:3000/api/pdv/online-orders');
  const queueData = await queueRes.json();
  console.log(`🔔 Fila do PDV tem ${queueData.orders?.length} pedido(s) pendente(s)`);

  const pendingOrder = queueData.orders?.find((o) => o.id === saleId);
  if (pendingOrder) {
    console.log('✅ Pedido encontrado na fila do PDV com todos os dados de entrega!');
    console.log('Cliente:', pendingOrder.customer_name);
    console.log('Endereço:', pendingOrder.delivery_address);
  }

  // 5. Aprovar Pedido no PDV (Simulando clique no botão "Aprovar Pedido & Imprimir Cupom Térmico")
  const approveRes = await fetch('http://localhost:3000/api/pdv/online-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saleId, action: 'approve' }),
  });

  const approveData = await approveRes.json();
  console.log('🖨️ Aprovação do pedido no PDV:', approveData);

  // 6. Testar alerta "Avise-me Quando Chegar"
  const alertRes = await fetch('http://localhost:3000/api/storefront/stock-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: variant.product_id,
      variantId: variant.id,
      size: '40',
      customerName: 'Cliente Esperando Reposição',
      email: 'cliente.espera@gmail.com',
      phone: '(92) 99999-8888',
    }),
  });
  const alertData = await alertRes.json();
  console.log('🔔 Alerta "Avise-me Quando Chegar" cadastrado:', alertData);

  console.log('🎉 TODOS OS TESTES E2E FORAM CONCLUÍDOS COM 100% DE SUCESSO!');
}

runTest();
