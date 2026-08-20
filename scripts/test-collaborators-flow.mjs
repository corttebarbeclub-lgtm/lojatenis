async function testCollaborators() {
  console.log('🧪 Testando API e módulo de Colaboradores e Cadastro Rápido de Clientes...');

  // 1. Testar cadastro rápido de cliente no PDV
  const resCust = await fetch('http://localhost:3000/api/admin/quick-customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId: 'e58226f2-9806-41ef-82bb-c987565e9824',
      fullName: 'Marcos Vinicius Sneakers',
      phone: '92991234567',
      email: 'marcos@gmail.com',
      city: 'Manaus',
    }),
  });
  const dataCust = await resCust.json();
  console.log('Novo Cliente Cadastrado no PDV:', dataCust);

  // 2. Testar cadastro de Colaborador com perfil Restrito
  const resCollab = await fetch('http://localhost:3000/api/admin/collaborators', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId: 'e58226f2-9806-41ef-82bb-c987565e9824',
      name: 'Lucas Vendedor Caixa',
      email: 'lucas.caixa@lojatenis.com',
      phone: '92988887777',
      password: 'caixa_seguro_123',
      roleProfile: 'restricted_sales',
      permissions: ['pdv_sales', 'manage_customers'],
    }),
  });
  const dataCollab = await resCollab.json();
  console.log('Novo Colaborador Restrito Cadastrado:', dataCollab);

  // 3. Listar Colaboradores
  const resList = await fetch('http://localhost:3000/api/admin/collaborators?tenant_id=e58226f2-9806-41ef-82bb-c987565e9824');
  const dataList = await resList.json();
  console.log(`Total de Colaboradores na Loja: ${dataList.collaborators?.length ?? 0}`);

  if (dataCust.success && (dataCollab.success || dataCollab.error?.includes('duplicate'))) {
    console.log('🎉 TESTES DE COLABORADORES E CLIENTE RÁPIDO FINALIZADOS COM SUCESSO!');
  }
}

testCollaborators();
