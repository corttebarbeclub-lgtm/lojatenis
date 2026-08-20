import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function testAuth() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navegando para login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'phabrycio@gmail.com');
  await page.type('input[type="password"]', 'admin123');
  
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
  ]);

  console.log('URL após login:', page.url());

  const screenshotsDir = path.resolve('public/pitch-assets');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  await page.screenshot({ path: path.join(screenshotsDir, 'test_dashboard.jpg') });
  console.log('Screenshot salva com sucesso!');

  await page.goto('http://localhost:3000/dashboard/pdv', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(screenshotsDir, 'test_pdv.jpg') });
  console.log('Screenshot PDV salva com sucesso!');

  await browser.close();
}

testAuth().catch(console.error);
