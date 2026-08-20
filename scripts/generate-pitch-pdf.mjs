import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jmlxhsqfvxjggvqusleu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptbHhoc3FmdnhqZ2d2cXVzbGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NTE3NDYsImV4cCI6MjEwMjQyNzc0Nn0.dAtippakVgVqweGjHD767ePPX9g7urzjDLLeT9WFsDQ';

async function generate() {
  console.log('🚀 Autenticando com Supabase para sessão de admin de Higsson...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'phabrycio@gmail.com',
    password: 'admin123'
  });

  if (authError || !authData.session) {
    console.error('Erro auth Supabase:', authError);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Injetar cookies de sessão Supabase
  if (authData?.session) {
    const token = JSON.stringify(authData.session);
    await page.setCookie({
      name: 'sb-jmlxhsqfvxjggvqusleu-auth-token',
      value: encodeURIComponent(token),
      domain: 'localhost',
      path: '/'
    });
  }

  const screenshotsDir = path.resolve('public/pitch-assets');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Capturar print da Visão Geral (Painel do Dono - Olá, Higsson)
  console.log('📸 Capturando print da Visão Geral com Olá, Higsson...');
  try {
    await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, 'visao_geral.jpg'), quality: 95, type: 'jpeg' });
  } catch (e) {
    console.warn('Aviso visão geral:', e.message);
  }

  // 2. Capturar print do PDV Balcão na hora da venda
  console.log('📸 Capturando print do PDV na hora da venda...');
  try {
    await page.goto('http://localhost:3001/dashboard/pdv', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, 'pdv_venda.jpg'), quality: 95, type: 'jpeg' });
  } catch (e) {
    console.warn('Aviso pdv venda:', e.message);
  }

  // 3. Capturar print da Vitrine Hero
  console.log('📸 Capturando print da Vitrine Hero...');
  try {
    await page.goto('http://localhost:3001/loja/tenisstore', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, 'hero_banner.jpg'), quality: 95, type: 'jpeg' });
  } catch (e) {
    console.warn('Aviso hero:', e.message);
  }

  // 4. Capturar print do Catálogo Real
  console.log('📸 Capturando print do Catálogo Real...');
  try {
    await page.evaluate(() => {
      const el = document.getElementById('produtos');
      if (el) el.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, 'catalogo_grid.jpg'), quality: 95, type: 'jpeg' });
  } catch (e) {
    console.warn('Aviso catalogo:', e.message);
  }

  // Carregar imagens em base64
  const toBase64 = (filePath) => {
    if (fs.existsSync(filePath)) {
      return `data:image/jpeg;base64,${fs.readFileSync(filePath).toString('base64')}`;
    }
    return '';
  };

  const imgVisaoGeral = toBase64(path.join(screenshotsDir, 'visao_geral.jpg'));
  const imgPdvVenda = toBase64(path.join(screenshotsDir, 'pdv_venda.jpg'));
  const imgHero = toBase64(path.join(screenshotsDir, 'hero_banner.jpg'));
  const imgCatalogo = toBase64(path.join(screenshotsDir, 'catalogo_grid.jpg'));

  // 5. Montar HTML Executivo
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>Proposta Comercial — Tk Coding Vibe Soluções Tecnológicas</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #09090b;
        color: #f4f4f5;
        line-height: 1.45;
        -webkit-print-color-adjust: exact;
      }

      .page {
        width: 100%;
        min-height: 100vh;
        padding: 32px 40px;
        page-break-after: always;
        position: relative;
        background: #09090b;
      }

      .header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #27272a;
        padding-bottom: 12px;
        margin-bottom: 16px;
      }

      .company-badge {
        display: flex;
        flex-direction: column;
      }

      .company-name {
        font-size: 15px;
        font-weight: 900;
        letter-spacing: -0.3px;
        color: #ffffff;
      }

      .company-author {
        font-size: 11px;
        font-weight: 700;
        color: #f59e0b;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .badge-tag {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.4);
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
      }

      .hero-title {
        font-size: 24px;
        font-weight: 900;
        line-height: 1.15;
        margin-bottom: 6px;
        color: #ffffff;
      }

      .hero-subtitle {
        font-size: 12px;
        color: #a1a1aa;
        margin-bottom: 14px;
        max-width: 820px;
      }

      .grid-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 14px;
      }

      .card {
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 12px;
        padding: 12px;
      }

      .card-title {
        font-size: 12px;
        font-weight: 800;
        color: #f59e0b;
        margin-bottom: 3px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .card-desc {
        font-size: 11px;
        color: #d4d4d8;
      }

      .screenshot-container {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #3f3f46;
        box-shadow: 0 10px 25px rgba(0,0,0,0.6);
        margin-top: 6px;
        background: #000;
      }

      .screenshot-img {
        width: 100%;
        height: auto;
        display: block;
      }

      .timeline-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 14px;
        background: #18181b;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #27272a;
      }

      .timeline-table th {
        background: #27272a;
        color: #f59e0b;
        text-align: left;
        padding: 10px 14px;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
      }

      .timeline-table td {
        padding: 10px 14px;
        border-top: 1px solid #27272a;
        font-size: 11px;
        color: #e4e4e7;
      }

      .price-box {
        background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
        border: 1px solid #f59e0b;
        border-radius: 16px;
        padding: 18px;
        margin-top: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .price-item {
        display: flex;
        flex-direction: column;
      }

      .price-label {
        font-size: 11px;
        font-weight: 700;
        color: #a1a1aa;
        text-transform: uppercase;
      }

      .price-value {
        font-size: 24px;
        font-weight: 900;
        color: #f59e0b;
        margin: 3px 0;
      }

      .price-sub {
        font-size: 11px;
        color: #d4d4d8;
      }

      .footer-note {
        margin-top: 18px;
        text-align: center;
        font-size: 10px;
        color: #71717a;
        border-top: 1px solid #27272a;
        padding-top: 10px;
      }
    </style>
  </head>
  <body>

    <!-- PÁGINA 1: VISÃO GERAL (PAINEL DO DONO - HIGSSON) -->
    <div class="page">
      <div class="header-bar">
        <div class="company-badge">
          <span class="company-name">Tk Coding Vibe Soluções Tecnológicas</span>
          <span class="company-author">Por Pabricio Juan</span>
        </div>
        <div class="badge-tag">Plano Start • Painel do Dono</div>
      </div>

      <h1 class="hero-title">Sistema de Gestão & Vendas — HB Tênis Manaus</h1>
      <p class="hero-subtitle">
        Painel centralizado para controle de faturamento, lucro bruto em tempo real, gestão de estoque por numerações e ranking dos calçados campeões de vendas.
      </p>

      <div class="grid-cards">
        <div class="card">
          <div class="card-title">📊 1. Painel do Dono em Tempo Real</div>
          <div class="card-desc">Monitore vendas diárias, faturamento mensal, margem de lucro e alertas de estoque baixo diretamente no celular ou computador.</div>
        </div>
        <div class="card">
          <div class="card-title">⚡ 2. PDV Balcão Instantâneo</div>
          <div class="card-desc">Localização rápida do modelo por nome, marca ou código de referência com fechamento de venda em menos de 5 segundos.</div>
        </div>
        <div class="card">
          <div class="card-title">👥 3. Gestão de Equipe & Relatórios</div>
          <div class="card-desc">Cadastro de colaboradores, permissões de acesso e relatórios completos de faturamento inclusos no plano.</div>
        </div>
        <div class="card">
          <div class="card-title">📦 4. Controle Central por Grade</div>
          <div class="card-desc">Estoque por numeração (34 ao 44) unificado entre o balcão físico e a vitrine online sem risco de furos.</div>
        </div>
      </div>

      <div style="font-size: 12px; font-weight: 800; color: #f59e0b; margin-top: 4px;">📸 TELA 1 — VISÃO GERAL / PAINEL ADMINISTRATIVO (HIGSSON):</div>
      ${imgVisaoGeral ? `<div class="screenshot-container"><img class="screenshot-img" src="${imgVisaoGeral}" alt="Painel do Dono" /></div>` : ''}
    </div>

    <!-- PÁGINA 2: PDV BALCÃO NA HORA DA VENDA -->
    <div class="page">
      <div class="header-bar">
        <div class="company-badge">
          <span class="company-name">Tk Coding Vibe Soluções Tecnológicas</span>
          <span class="company-author">Por Pabricio Juan</span>
        </div>
        <div class="badge-tag">Ponto de Venda • PDV Balcão</div>
      </div>

      <h2 style="font-size: 20px; font-weight: 900; color: #fff; margin-bottom: 4px;">⚡ TELA 2 — PDV BALCÃO NA HORA DA VENDA</h2>
      <p style="font-size: 11px; color: #a1a1aa; margin-bottom: 8px;">
        Busca ágil por nome ou código do calçado, seleção de numeração, carrinho visual com foto e finalização em 1 clique.
      </p>

      ${imgPdvVenda ? `<div class="screenshot-container" style="margin-bottom: 12px;"><img class="screenshot-img" src="${imgPdvVenda}" alt="PDV Venda" /></div>` : ''}
    </div>

    <!-- PÁGINA 3: VITRINE HYPE E CATÁLOGO REAL -->
    <div class="page">
      <div class="header-bar">
        <div class="company-badge">
          <span class="company-name">Tk Coding Vibe Soluções Tecnológicas</span>
          <span class="company-author">Por Pabricio Juan</span>
        </div>
        <div class="badge-tag">Loja Virtual • Vitrine & Catálogo</div>
      </div>

      <div style="font-size: 11px; font-weight: 800; color: #f59e0b; margin-bottom: 4px;">🔥 TELA 3 — HERO BANNER COM TÊNIS EM ESTOQUE & FRETE R$ 15 MANAUS:</div>
      ${imgHero ? `<div class="screenshot-container" style="margin-bottom: 14px;"><img class="screenshot-img" src="${imgHero}" alt="Vitrine Hero" /></div>` : ''}

      <div style="font-size: 11px; font-weight: 800; color: #f59e0b; margin-bottom: 4px;">👟 TELA 4 — CATÁLOGO REAL DE SNEAKERS COM FOTOS AUTÊNTICAS E PREÇOS:</div>
      ${imgCatalogo ? `<div class="screenshot-container"><img class="screenshot-img" src="${imgCatalogo}" alt="Catálogo Real" /></div>` : ''}
    </div>

    <!-- PÁGINA 4: CRONOGRAMA, INVESTIMENTO E FECHAMENTO -->
    <div class="page">
      <div class="header-bar">
        <div class="company-badge">
          <span class="company-name">Tk Coding Vibe Soluções Tecnológicas</span>
          <span class="company-author">Por Pabricio Juan</span>
        </div>
        <div class="badge-tag">Cronograma & Condições Comerciais</div>
      </div>

      <h2 style="font-size: 22px; font-weight: 900; color: #fff; margin-bottom: 4px;">⏱️ Cronograma de Implantação (10 Dias Úteis)</h2>
      <p style="font-size: 12px; color: #a1a1aa; margin-bottom: 10px;">
        Estrutura em 4 etapas bem definidas para você acompanhar e validar cada detalhe antes do lançamento oficial:
      </p>

      <table class="timeline-table">
        <thead>
          <tr>
            <th>Fase</th>
            <th>Prazo</th>
            <th>Atividades & Entregáveis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: 800; color: #f59e0b;">1. Infra & Marca</td>
            <td>Dias 1 a 3</td>
            <td>Provisionamento do servidor na nuvem, banco de dados dedicado, domínio próprio com SSL e identidade visual da HB Tênis.</td>
          </tr>
          <tr>
            <td style="font-weight: 800; color: #f59e0b;">2. Demo & Testes</td>
            <td>Dias 4 a 6</td>
            <td><strong>Apresentação da versão Demo interativa (Staging)</strong> e período de 72h para simulação de vendas e ajustes finos solicitados pelo lojista.</td>
          </tr>
          <tr>
            <td style="font-weight: 800; color: #f59e0b;">3. Carga & Treino</td>
            <td>Dias 7 a 9</td>
            <td>Carga do catálogo de fotos em alta resolução, cadastro do estoque inicial por grade e <strong>treinamento prático da equipe de caixa</strong>.</td>
          </tr>
          <tr>
            <td style="font-weight: 800; color: #10b981;">4. Go-Live Oficial</td>
            <td>Dia 10</td>
            <td><strong>Loja e PDV 100% ativos e faturando</strong>, quitação dos 50% finais do setup e entrega oficial das chaves de acesso.</td>
          </tr>
        </tbody>
      </table>

      <h2 style="font-size: 22px; font-weight: 900; color: #fff; margin-top: 20px; margin-bottom: 4px;">💳 Condições de Pagamento & Investimento</h2>

      <div class="price-box">
        <div class="price-item">
          <span class="price-label">Taxa Única de Setup & Customização</span>
          <span class="price-value">R$ 1.500,00</span>
          <span class="price-sub">• <strong>50% de Sinal (R$ 750)</strong> para início imediato</span>
          <span class="price-sub">• <strong>50% na Entrega (R$ 750)</strong> no Go-Live pós-treinamento</span>
          <span class="price-sub" style="color: #f59e0b; margin-top: 3px;">*Opção de parcelamento em até 3x no cartão</span>
        </div>

        <div class="price-item">
          <span class="price-label">Assinatura Mensal (SaaS & Suporte VIP)</span>
          <span class="price-value">R$ 249,00<span style="font-size: 13px; color: #a1a1aa;">/mês</span></span>
          <span class="price-sub">• <strong>1º Vencimento Inteligente:</strong> 30 dias após o Go-Live</span>
          <span class="price-sub">• Você só paga quando a loja já estiver faturando</span>
          <span class="price-sub">• Inclui servidor nuvem, atualizações e suporte</span>
        </div>
      </div>

      <div style="margin-top: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 10px; font-size: 11px; color: #6ee7b7;">
        🛡️ <strong>Garantia & Suporte:</strong> Acompanhamento em tempo real durante os primeiros dias de uso da loja e PDV. Sem contrato de fidelidade abusivo.
      </div>

      <div class="footer-note">
        <strong>Tk Coding Vibe Soluções Tecnológicas — Por Pabricio Juan</strong> • Proposta Comercial emitida para a HB Tênis Manaus (Higsson).
      </div>
    </div>

  </body>
  </html>
  `;

  console.log('📄 Renderizando HTML e gerando arquivo PDF executivo...');
  const tempHtmlPath = path.resolve('public/pitch-assets/pitch.html');
  fs.writeFileSync(tempHtmlPath, htmlContent);

  await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'load', timeout: 60000 });

  const pdfPath = path.resolve('PITCH_PROPOSTA_COMERCIAL.pdf');
  const docsPdfPath = path.resolve('docs/PITCH_PROPOSTA_COMERCIAL.pdf');

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: '0px'
    }
  });

  fs.copyFileSync(pdfPath, docsPdfPath);

  await browser.close();
  console.log(`🎉 PDF gerado com absoluto sucesso em: ${pdfPath}`);
}

generate().catch(err => {
  console.error('Erro ao gerar PDF:', err);
  process.exit(1);
});
