// Lista de todos os 62 municípios do Estado do Amazonas
export interface AmazonasCity {
  name: string;
  isCapital: boolean;
  shippingCents: number;
  deliveryDays: string;
  transportType: string;
}

export const AMAZONAS_CITIES: AmazonasCity[] = [
  { name: 'Manaus', isCapital: true, shippingCents: 100, deliveryDays: '1 dia útil (Entrega Expressa)', transportType: 'Motoboy / Express' },
  { name: 'Alvarães', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 7 dias (Barco/Lancha)', transportType: 'Barco Regional' },
  { name: 'Amaturá', isCapital: false, shippingCents: 10000, deliveryDays: '5 a 10 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Anamã', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 5 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Anori', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 5 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Apuí', isCapital: false, shippingCents: 10000, deliveryDays: '4 a 8 dias', transportType: 'Transporte Rodoviário/Fluvial' },
  { name: 'Atalaia do Norte', isCapital: false, shippingCents: 10000, deliveryDays: '7 a 12 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Autazes', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Barco/Lancha)', transportType: 'Barco Regional' },
  { name: 'Barcelos', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 6 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Barreirinha', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 5 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Benjamin Constant', isCapital: false, shippingCents: 10000, deliveryDays: '6 a 10 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Beruri', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 5 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Boa Vista do Ramos', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 5 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Boca do Acre', isCapital: false, shippingCents: 10000, deliveryDays: '5 a 9 dias', transportType: 'Transporte Fluvial/Rodoviário' },
  { name: 'Borba', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Caapiranga', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Canutama', isCapital: false, shippingCents: 10000, deliveryDays: '4 a 8 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Carauari', isCapital: false, shippingCents: 10000, deliveryDays: '5 a 9 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Careiro', isCapital: false, shippingCents: 10000, deliveryDays: '1 a 3 dias (Lancha/Barco)', transportType: 'Barco Regional' },
  { name: 'Careiro da Várzea', isCapital: false, shippingCents: 10000, deliveryDays: '1 a 2 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Coari', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Lancha/Barco)', transportType: 'Barco Regional' },
  { name: 'Codajás', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Eirunepé', isCapital: false, shippingCents: 10000, deliveryDays: '7 a 14 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Envira', isCapital: false, shippingCents: 10000, deliveryDays: '7 a 14 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Fonte Boa', isCapital: false, shippingCents: 10000, deliveryDays: '4 a 8 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Guajará', isCapital: false, shippingCents: 10000, deliveryDays: '8 a 15 dias', transportType: 'Barco Regional' },
  { name: 'Humaitá', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 6 dias (Barco/Rodoviário)', transportType: 'Transporte Misto' },
  { name: 'Ipixuna', isCapital: false, shippingCents: 10000, deliveryDays: '8 a 15 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Iranduba', isCapital: false, shippingCents: 10000, deliveryDays: '1 a 2 dias (Entrega Ponte/Barco)', transportType: 'Transporte Terrestre/Fluvial' },
  { name: 'Itacoatiara', isCapital: false, shippingCents: 10000, deliveryDays: '1 a 3 dias (Barco/Lancha/Rodoviário)', transportType: 'Transporte Rodoviário/Fluvial' },
  { name: 'Itamarati', isCapital: false, shippingCents: 10000, deliveryDays: '6 a 12 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Itapiranga', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Japurá', isCapital: false, shippingCents: 10000, deliveryDays: '6 a 12 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Juruá', isCapital: false, shippingCents: 10000, deliveryDays: '6 a 12 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Jutaí', isCapital: false, shippingCents: 10000, deliveryDays: '5 a 10 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Lábrea', isCapital: false, shippingCents: 10000, deliveryDays: '5 a 10 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Manacapuru', isCapital: false, shippingCents: 10000, deliveryDays: '1 a 2 dias (Lancha/Rodoviário)', transportType: 'Transporte Misto' },
  { name: 'Manaquiri', isCapital: false, shippingCents: 10000, deliveryDays: '1 a 3 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Manicoré', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 6 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Maraã', isCapital: false, shippingCents: 10000, deliveryDays: '4 a 8 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Maués', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Barco/Lancha)', transportType: 'Barco Regional' },
  { name: 'Nhamundá', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 6 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Nova Olinda do Norte', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Novo Airão', isCapital: false, shippingCents: 10000, deliveryDays: '1 a 3 dias (Barco/Rodoviário)', transportType: 'Transporte Misto' },
  { name: 'Novo Aripuanã', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 6 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Parintins', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Lancha Jato/Barco)', transportType: 'Barco Regional / Lancha' },
  { name: 'Pauini', isCapital: false, shippingCents: 10000, deliveryDays: '7 a 14 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Presidente Figueiredo', isCapital: false, shippingCents: 10000, deliveryDays: '1 a 2 dias (Rodoviário)', transportType: 'Transporte Rodoviário' },
  { name: 'Rio Preto da Eva', isCapital: false, shippingCents: 10000, deliveryDays: '1 a 2 dias (Rodoviário)', transportType: 'Transporte Rodoviário' },
  { name: 'Santa Isabel do Rio Negro', isCapital: false, shippingCents: 10000, deliveryDays: '4 a 8 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Santo Antônio do Içá', isCapital: false, shippingCents: 10000, deliveryDays: '6 a 11 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'São Gabriel da Cachoeira', isCapital: false, shippingCents: 10000, deliveryDays: '4 a 8 dias (Barco Expresso)', transportType: 'Barco Regional' },
  { name: 'São Paulo de Olivença', isCapital: false, shippingCents: 10000, deliveryDays: '6 a 11 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'São Sebastião do Uatumã', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 6 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Silves', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Tabatinga', isCapital: false, shippingCents: 10000, deliveryDays: '5 a 10 dias (Lancha/Barco)', transportType: 'Barco Regional' },
  { name: 'Tapauá', isCapital: false, shippingCents: 10000, deliveryDays: '5 a 10 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Tefé', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Lancha Expresso/Barco)', transportType: 'Barco Regional / Lancha' },
  { name: 'Tonantins', isCapital: false, shippingCents: 10000, deliveryDays: '5 a 9 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Uarini', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 6 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Urucará', isCapital: false, shippingCents: 10000, deliveryDays: '3 a 5 dias (Barco)', transportType: 'Barco Regional' },
  { name: 'Urucurituba', isCapital: false, shippingCents: 10000, deliveryDays: '2 a 4 dias (Barco)', transportType: 'Barco Regional' }
];

export function getAmazonasShipping(cityName: string, state: string) {
  const isAM = state.trim().toUpperCase() === 'AM' || state.trim().toLowerCase() === 'amazonas';
  
  if (!isAM) {
    return {
      isAmazonas: false,
      isCapital: false,
      shippingCents: 3500, // R$ 35,00 padrão Correios PAC
      label: 'Correios PAC (Nacional)',
      deliveryDays: '5 a 10 dias úteis',
      transportType: 'Correios'
    };
  }

  const normalizedCity = cityName.trim().toLowerCase();
  if (normalizedCity.includes('manaus')) {
    return {
      isAmazonas: true,
      isCapital: true,
      shippingCents: 100, // R$ 1,00
      label: 'Entrega Expressa Manaus (Promoção R$ 1,00)',
      deliveryDays: '1 dia útil',
      transportType: 'Motoboy / Entrega Local'
    };
  }

  // Interior do Amazonas
  const found = AMAZONAS_CITIES.find(
    (c) => c.name.toLowerCase() === normalizedCity
  );

  return {
    isAmazonas: true,
    isCapital: false,
    shippingCents: 10000, // R$ 100,00
    label: `Transporte Fluvial Barco Interior AM (${found ? found.name : cityName})`,
    deliveryDays: found ? found.deliveryDays : '3 a 8 dias (Barco de Linha)',
    transportType: found ? found.transportType : 'Barco Regional Fluvial'
  };
}
