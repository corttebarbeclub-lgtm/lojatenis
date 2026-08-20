/**
 * Validador Oficial de CNPJ e CNAEs do Setor Calçadista e Artigos Esportivos
 */

// Lista oficial de CNAEs que comercializam, distribuem ou fabricam calçados, tênis e artigos esportivos
export const FOOTWEAR_CNAES = [
  { code: '4782201', desc: 'Comércio varejista de calçados' },
  { code: '4782202', desc: 'Comércio varejista de artigos de viagem e calçados' },
  { code: '4643501', desc: 'Comércio atacadista de calçados' },
  { code: '4642701', desc: 'Comércio atacadista de artigos do vestuário e complementos (calçados esportivos)' },
  { code: '4781400', desc: 'Comércio varejista de artigos do vestuário e acessórios' },
  { code: '4763602', desc: 'Comércio varejista de artigos esportivos (tênis e performance)' },
  { code: '4649499', desc: 'Comércio atacadista de outros equipamentos e artigos de uso pessoal e doméstico' },
  { code: '1531901', desc: 'Fabricação de calçados de couro' },
  { code: '1532700', desc: 'Fabricação de calçados de material plástico' },
  { code: '1533500', desc: 'Fabricação de calçados de outros materiais (tênis, tecidos)' },
  { code: '1539400', desc: 'Fabricação de calçados não especificados anteriormente' },
  { code: '1540800', desc: 'Fabricação de partes para calçados' },
  { code: '4789099', desc: 'Comércio varejista de outros produtos não especificados (lojas multimarcas)' },
  { code: '4616800', desc: 'Representantes comerciais e agentes do comércio de têxteis, vestuário e calçados' },
];

export interface CnpjValidationResult {
  isValidFormat: boolean;
  isReal: boolean;
  isActive: boolean;
  isFootwearBusiness: boolean;
  companyName?: string;
  tradeName?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  matchedCnae?: { code: string; desc: string };
  rawCnaes?: string[];
  error?: string;
}

// 1. Validação matemática de Dígitos Verificadores do CNPJ
export function isValidCnpjChecksum(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === Number(digits.charAt(1));
}

// 2. Consulta Oficial de CNPJ na Receita Federal via APIs públicas com Fallback
export async function verifyCnpjWithReceita(cnpj: string): Promise<CnpjValidationResult> {
  const clean = cnpj.replace(/\D/g, '');

  if (!isValidCnpjChecksum(clean)) {
    return {
      isValidFormat: false,
      isReal: false,
      isActive: false,
      isFootwearBusiness: false,
      error: 'CNPJ inválido no formato ou dígito verificador.',
    };
  }

  try {
    // 1ª Tentativa: BrasilAPI (Rápida, sem limite restritivo)
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      headers: { 'User-Agent': 'Lojatenis-B2B-Checker/1.0' },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const isActive = data.descricao_situacao_cadastral?.toUpperCase() === 'ATIVA';
      
      const allCnaeCodes: string[] = [
        String(data.cnae_fiscal || '').replace(/\D/g, ''),
        ...(data.cnaes_secundarios || []).map((c: { codigo: number | string }) => String(c.codigo || '').replace(/\D/g, '')),
      ].filter(Boolean);

      // Verificar se algum CNAE coincide com a lista calçadista
      const matched = FOOTWEAR_CNAES.find((fc) =>
        allCnaeCodes.some((code) => code.startsWith(fc.code.substring(0, 5)) || code === fc.code)
      );

      return {
        isValidFormat: true,
        isReal: true,
        isActive,
        isFootwearBusiness: !!matched,
        companyName: data.razao_social || data.nome_fantasia,
        tradeName: data.nome_fantasia || data.razao_social,
        city: data.municipio,
        state: data.uf,
        email: data.email || undefined,
        phone: data.ddd_telefone_1 ? `${data.ddd_telefone_1}` : undefined,
        matchedCnae: matched,
        rawCnaes: allCnaeCodes,
      };
    }

    // 2ª Tentativa Fallback: ReceitaWS
    const resFallback = await fetch(`https://www.receitaws.com.br/v1/cnpj/${clean}`);
    if (resFallback.ok) {
      const dataFallback = await resFallback.json();
      if (dataFallback.status !== 'ERROR') {
        const isActive = dataFallback.situacao?.toUpperCase() === 'ATIVA';
        const allCnaeCodes: string[] = [
          ...(dataFallback.atividade_principal || []).map((c: { code: string }) => c.code.replace(/\D/g, '')),
          ...(dataFallback.atividades_secundarias || []).map((c: { code: string }) => c.code.replace(/\D/g, '')),
        ].filter(Boolean);

        const matched = FOOTWEAR_CNAES.find((fc) =>
          allCnaeCodes.some((code) => code.startsWith(fc.code.substring(0, 5)) || code === fc.code)
        );

        return {
          isValidFormat: true,
          isReal: true,
          isActive,
          isFootwearBusiness: !!matched,
          companyName: dataFallback.nome || dataFallback.fantasia,
          tradeName: dataFallback.fantasia || dataFallback.nome,
          city: dataFallback.municipio,
          state: dataFallback.uf,
          email: dataFallback.email || undefined,
          phone: dataFallback.telefone || undefined,
          matchedCnae: matched,
          rawCnaes: allCnaeCodes,
        };
      }
    }

    return {
      isValidFormat: true,
      isReal: false,
      isActive: false,
      isFootwearBusiness: false,
      error: 'CNPJ não localizado na base oficial da Receita Federal.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao consultar Receita Federal';
    return {
      isValidFormat: true,
      isReal: false,
      isActive: false,
      isFootwearBusiness: false,
      error: msg,
    };
  }
}
