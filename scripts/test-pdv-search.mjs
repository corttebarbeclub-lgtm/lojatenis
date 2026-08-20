async function testSearch() {
  const urls = [
    'http://localhost:3000/api/admin/pdv/search?q=nike',
    'http://localhost:3000/api/admin/pdv/search?q=jordan',
    'http://localhost:3000/api/admin/pdv/search?q=dunk',
    'http://localhost:3000/api/admin/pdv/search?q=38',
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      const data = await res.json();
      console.log(`[${res.status}] ${u} -> ${data.results?.length ?? 0} resultados encontrados`);
    } catch (e) {
      console.log(`[ERRO] ${u} -> ${e.message}`);
    }
  }
}

testSearch();
