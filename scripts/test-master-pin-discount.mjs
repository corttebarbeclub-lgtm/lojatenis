async function testDiscountMasterPin() {
  console.log('🧪 Testando sistema de Desconto com Senha Mestra do Dono...');

  // 1. Teste com Senha Incorreta
  const resWrong = await fetch('http://localhost:3000/api/pdv/authorize-discount', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'verify_pin',
      tenantId: 'e58226f2-9806-41ef-82bb-c987565e9824',
      pin: 'senha_errada_999',
    }),
  });
  const dataWrong = await resWrong.json();
  console.log('Resultado com Senha Errada:', dataWrong);

  // 2. Teste com Senha Mestra Correta
  const resRight = await fetch('http://localhost:3000/api/pdv/authorize-discount', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'verify_pin',
      tenantId: 'e58226f2-9806-41ef-82bb-c987565e9824',
      pin: '123456',
    }),
  });
  const dataRight = await resRight.json();
  console.log('Resultado com Senha Mestra Correta (123456):', dataRight);

  if (dataWrong.success === false && dataRight.success === true) {
    console.log('🎉 SISTEMA DE DESCONTO COM SENHA MESTRA VALIDADO COM 100% DE SUCESSO!');
  } else {
    console.error('❌ Falha na validação do PIN.');
  }
}

testDiscountMasterPin();
