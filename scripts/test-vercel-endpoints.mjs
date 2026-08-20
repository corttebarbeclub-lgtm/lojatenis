async function checkVercelEndpoints() {
  const base = 'https://lojatenis-gray.vercel.app';
  const urls = [
    '/loja/tenisstore',
    '/loja/tenisstore/atacado',
    '/dashboard/pdv',
    '/dashboard',
    '/api/storefront/search?tenant_id=e58226f2-9806-41ef-82bb-c987565e9824',
    '/api/pdv/online-orders?tenant_id=e58226f2-9806-41ef-82bb-c987565e9824',
    '/api/pdv/wholesale-alerts?tenant_id=e58226f2-9806-41ef-82bb-c987565e9824'
  ];

  for (const u of urls) {
    const res = await fetch(base + u);
    console.log(`URL: ${u.padEnd(70)} -> Status: ${res.status} ${res.ok ? '✅ OK' : '❌ ERRO'}`);
  }
}
checkVercelEndpoints();
