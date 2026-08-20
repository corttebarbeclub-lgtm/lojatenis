async function testWholesaleDetail() {
  const url = 'http://localhost:3000/loja/tenisstore/atacado/produto/80b4d3fe-4612-44ce-8001-eacf34582a57';
  console.log(`Testing wholesale detail route: ${url}`);
  const resp = await fetch(url);
  console.log(`Status: ${resp.status}`);
}

testWholesaleDetail();
