async function testAlerts() {
  const res = await fetch('http://localhost:3000/api/pdv/wholesale-alerts?tenant_id=e58226f2-9806-41ef-82bb-c987565e9824');
  const data = await res.json();
  console.log('Status da API:', res.status);
  console.log('Dados de Alertas Retornados:', JSON.stringify(data, null, 2));
}

testAlerts();
