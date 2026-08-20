async function testSneakerModalFlow() {
  console.log('🧪 Testando API de Configurações do Tênis e Controle de Estoque com Senha Mestra...');

  // 1. Buscar primeiro tênis
  const resGet = await fetch('http://localhost:3000/api/admin/products/full-edit?product_id=e7f31b84-a359-4685-8399-4d42e7d397d9');
  const dataGet = await resGet.json();
  console.log('Tênis Carregado:', dataGet.product?.name, '| Fotos:', dataGet.product?.product_images?.length, '| Variantes:', dataGet.product?.product_variants?.length);

  // 2. Testar salvar estoque com Senha Mestra Errada
  const resWrong = await fetch('http://localhost:3000/api/admin/products/full-edit', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'e7f31b84-a359-4685-8399-4d42e7d397d9',
      tenantId: 'e58226f2-9806-41ef-82bb-c987565e9824',
      name: 'Nike Dunk Low Retro Panda',
      variantsStock: [{ variantId: dataGet.product?.product_variants?.[0]?.id, size: '34', quantity: 5 }],
      adminPin: 'senha_errada_000',
    }),
  });
  const dataWrong = await resWrong.json();
  console.log('Resultado com Senha Errada:', dataWrong);

  // 3. Testar salvar estoque com Senha Mestra Correta (123456)
  const resRight = await fetch('http://localhost:3000/api/admin/products/full-edit', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'e7f31b84-a359-4685-8399-4d42e7d397d9',
      tenantId: 'e58226f2-9806-41ef-82bb-c987565e9824',
      name: 'Nike Dunk Low Retro Panda',
      variantsStock: [{ variantId: dataGet.product?.product_variants?.[0]?.id, size: '34', quantity: 5 }],
      adminPin: '123456',
    }),
  });
  const dataRight = await resRight.json();
  console.log('Resultado com Senha Mestra Correta:', dataRight);

  if (dataWrong.success === false && dataRight.success === true) {
    console.log('🎉 SISTEMA DE EDIÇÃO DE TÊNIS E CONTROLE DE ESTOQUE VALIDADO COM 100% DE SUCESSO!');
  }
}

testSneakerModalFlow();
