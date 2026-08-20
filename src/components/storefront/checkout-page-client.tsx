'use client';

import { useState, useEffect } from 'react';
import { useCartStore, formatPrice, getInstallments } from '@/lib/stores/cart-store';
import {
  paymentMethods,
  type PaymentMethod,
} from '@/lib/validations/checkout';
import { AMAZONAS_CITIES, getAmazonasShipping } from '@/lib/shipping/amazonas';
import { StorefrontHeader } from '@/components/storefront/storefront-header';
import {
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Truck,
  Package,
  Ship,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface CheckoutPageClientProps {
  slug: string;
  storeName: string;
  whatsappNumber: string | null;
}

interface CustomerData {
  name: string;
  cpf: string;
  phone: string;
  email: string;
}

interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const steps = [
  { id: 1, label: 'Dados Pessoais', icon: User },
  { id: 2, label: 'Endereço e Frete', icon: MapPin },
  { id: 3, label: 'Pagamento e Resumo', icon: CreditCard },
];

function maskCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
}

function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function maskCEP(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export default function CheckoutPageClient({
  slug,
  storeName,
  whatsappNumber,
}: CheckoutPageClientProps) {
  const { items, clearCart } = useCartStore();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const subtotal = useCartStore((s) => s.getTotalPriceCents());

  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    cpf: '',
    phone: '',
    email: '',
  });

  const [address, setAddress] = useState<AddressData>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Manaus',
    state: 'AM',
  });

  const [payment, setPayment] = useState<PaymentMethod>('pix');
  const [installmentCount, setInstallmentCount] = useState(3);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderCompletedId, setOrderCompletedId] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Busca CEP via ViaCEP
  async function handleCEPBlur() {
    const cleanCep = address.cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch {
      // ignore network errors on blur
    } finally {
      setCepLoading(false);
    }
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <>
        <StorefrontHeader
          storeName={storeName}
          slug={slug}
          whatsappNumber={whatsappNumber}
          activePage="varejo"
        />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gray-50">
            <ShoppingBag className="h-8 w-8 text-gray-200" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Carrinho vazio</h1>
          <p className="mt-2 text-sm text-gray-500">Adicione produtos antes de fazer checkout.</p>
          <Link
            href={`/loja/${slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao catálogo
          </Link>
        </div>
      </>
    );
  }

  // Cálculo de Frete Dinâmico com regras do Amazonas (Manaus = R$ 1, Interior = R$ 100)
  const shippingInfo = getAmazonasShipping(address.city || 'Manaus', address.state || 'AM');
  const shippingCents = shippingInfo.shippingCents;
  const totalCents = subtotal + shippingCents;
  
  // Parcelamento com regra: taxa 4% base + 1% ao mês
  const installments = getInstallments(totalCents);
  const selectedInstallment = installments.find((i) => i.installments === installmentCount) || installments[0];
  const finalPayableCents = payment === 'credit' ? selectedInstallment.totalWithFeeCents : totalCents;

  function canAdvance() {
    if (step === 1) {
      return (
        customer.name.trim().length >= 3 &&
        customer.cpf.replace(/\D/g, '').length === 11 &&
        customer.phone.replace(/\D/g, '').length >= 10 &&
        customer.email.includes('@')
      );
    }
    if (step === 2) {
      return (
        address.street.trim().length >= 2 &&
        address.number.trim().length >= 1 &&
        address.neighborhood.trim().length >= 2 &&
        address.city.trim().length >= 2 &&
        address.state.trim().length >= 2
      );
    }
    return true;
  }

  async function handleFinalize() {
    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/storefront/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          address,
          paymentMethod: payment,
          shippingCents,
          items,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Erro ao processar pedido. Tente novamente.');
        setSubmittingOrder(false);
        return;
      }

      setOrderCompletedId(data.sale_id);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      alert('Erro de conexão ao enviar pedido.');
    } finally {
      setSubmittingOrder(false);
    }
  }

  if (orderCompletedId) {
    return (
      <>
        <StorefrontHeader
          storeName={storeName}
          slug={slug}
          whatsappNumber={whatsappNumber}
          activePage="varejo"
        />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg border-2 border-emerald-300">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Estoque Sequestrado & Reservado
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              🎉 Pedido Enviado para o Caixa da Loja!
            </h1>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Nº do Pedido: <strong className="font-mono text-black">#{orderCompletedId.slice(0, 8).toUpperCase()}</strong>
            </p>
            <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed pt-2">
              Seus pares de tênis foram reservados no estoque central e seu pedido já entrou diretamente na <strong>fila do PDV da HB Tênis</strong> para aprovação e emissão do cupom não fiscal de entrega.
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200 max-w-md mx-auto text-left text-xs space-y-1.5">
            <p className="font-bold text-gray-800">📍 Dados de Entrega Registrados:</p>
            <p className="text-gray-600">{customer.name} • {customer.phone}</p>
            <p className="text-gray-600">{address.street}, Nº {address.number} - {address.neighborhood}, {address.city}/{address.state}</p>
          </div>

          <div className="pt-4">
            <Link
              href={`/loja/${slug}`}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-black text-white font-black text-xs hover:bg-zinc-800 shadow-md transition-all"
            >
              Continuar Comprando na Loja
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <StorefrontHeader
        storeName={storeName}
        slug={slug}
        whatsappNumber={whatsappNumber}
        activePage="varejo"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Banner Promoção Amazonas */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-4 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">🚀 Envio Especial para Todo o Amazonas!</p>
              <p className="text-xs text-emerald-100">
                Frete fixo em Manaus por apenas <strong className="text-white font-black">R$ 1,00</strong> | Interior do AM via Barco por <strong className="text-white font-black">R$ 100,00</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isDone
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : isActive
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-xs font-medium ${
                        isActive ? 'text-gray-900 font-bold' : 'text-gray-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`mx-3 h-0.5 flex-1 rounded-full ${
                        step > s.id ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Formulário */}
          <div className="lg:col-span-3">
            {/* STEP 1: Dados Pessoais */}
            {step === 1 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-700" />
                  1. Dados Pessoais do Comprador
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Ex: Carlos Eduardo de Souza"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                      <input
                        type="text"
                        value={customer.cpf}
                        onChange={(e) =>
                          setCustomer({ ...customer, cpf: maskCPF(e.target.value) })
                        }
                        placeholder="000.000.000-00"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp / Celular *
                      </label>
                      <input
                        type="text"
                        value={customer.phone}
                        onChange={(e) =>
                          setCustomer({ ...customer, phone: maskPhone(e.target.value) })
                        }
                        placeholder="(92) 98188-3786"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="carlos@exemplo.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Endereço e Frete Amazonas */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-700" />
                    2. Endereço de Entrega
                  </h2>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado (UF) *
                        </label>
                        <select
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                          <option value="AM">Amazonas (AM)</option>
                          <option value="PA">Pará (PA)</option>
                          <option value="RR">Roraima (RR)</option>
                          <option value="AC">Acre (AC)</option>
                          <option value="RO">Rondônia (RO)</option>
                          <option value="SP">São Paulo (SP)</option>
                          <option value="RJ">Rio de Janeiro (RJ)</option>
                          <option value="MG">Minas Gerais (MG)</option>
                          <option value="Outro">Outro Estado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade do Amazonas *
                        </label>
                        {address.state === 'AM' ? (
                          <select
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                          >
                            <optgroup label="Capital">
                              <option value="Manaus">Manaus (Frete R$ 1,00)</option>
                            </optgroup>
                            <optgroup label="Interior do Amazonas (Via Barco - Frete R$ 100,00)">
                              {AMAZONAS_CITIES.filter((c) => !c.isCapital).map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder="Digite sua cidade"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        )}
                      </div>
                    </div>

                    <div className="max-w-xs">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={address.cep}
                          onChange={(e) =>
                            setAddress({ ...address, cep: maskCEP(e.target.value) })
                          }
                          onBlur={handleCEPBlur}
                          placeholder="69000-000"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                        />
                        {cepLoading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rua / Avenida / Comunidade *
                        </label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          placeholder="Ex: Av. Djalma Batista"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          value={address.number}
                          onChange={(e) => setAddress({ ...address, number: e.target.value })}
                          placeholder="123 ou S/N"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          value={address.neighborhood}
                          onChange={(e) =>
                            setAddress({ ...address, neighborhood: e.target.value })
                          }
                          placeholder="Ex: Chapada / Centro"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Complemento / Ponto de Referência
                        </label>
                        <input
                          type="text"
                          value={address.complement}
                          onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                          placeholder="Ex: Próximo ao porto / Apto 102"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opções de frete automático */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
                    {shippingInfo.isCapital ? (
                      <Truck className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Ship className="h-5 w-5 text-blue-600" />
                    )}
                    Modalidade de Frete Calculada
                  </h2>

                  <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{shippingInfo.label}</span>
                          {shippingInfo.isCapital && (
                            <span className="rounded bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                              PROMO R$ 1,00
                            </span>
                          )}
                          {!shippingInfo.isCapital && shippingInfo.isAmazonas && (
                            <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white flex items-center gap-1">
                              <Ship className="h-3 w-3" />
                              Via Barco
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {shippingInfo.deliveryDays} • Transporte: {shippingInfo.transportType}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-gray-900">
                          {formatPrice(shippingInfo.shippingCents)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Pagamento e Resumo */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-700" />
                    3. Escolha a Forma de Pagamento
                  </h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {paymentMethods.map((pm) => (
                      <label
                        key={pm.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                          payment === pm.value
                            ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={payment === pm.value}
                          onChange={() => {
                            setPayment(pm.value);
                          }}
                          className="h-4 w-4 accent-gray-900"
                        />
                        <span className="text-base">{pm.icon}</span>
                        <span className="text-sm font-semibold text-gray-900">{pm.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Parcelas com juros 4% + 1%/mês */}
                  {payment === 'credit' && (
                    <div className="mt-5 rounded-xl bg-gray-50 p-4 border border-gray-200">
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Selecione o Parcelamento no Cartão (taxa de 4% + 1% por mês):
                      </label>
                      <select
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(Number(e.target.value))}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        {installments.map((inst) => (
                          <option key={inst.installments} value={inst.installments}>
                            {inst.installments}x de {formatPrice(inst.valueCents)} — Total: {formatPrice(inst.totalWithFeeCents)} (taxa de {inst.feePercent}%)
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-gray-500">
                        * O valor das parcelas inclui a taxa contratada de intermediação.
                      </p>
                    </div>
                  )}

                  {payment === 'pix' && (
                    <div className="mt-4 rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                      <p className="font-bold">💠 Pagamento 100% Seguro via PIX</p>
                      <p>A chave PIX e QR Code serão fornecidos imediatamente no WhatsApp para confirmação do seu calçado.</p>
                    </div>
                  )}
                </div>

                {/* Resumo do pedido */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-700" />
                    Resumo Completo do Pedido
                  </h2>
                  <div className="space-y-3 divide-y divide-gray-100">
                    {items.map((item) => (
                      <div
                        key={`${item.variantId}-${item.isWholesale}`}
                        className="flex items-center gap-3 pt-3 text-sm first:pt-0"
                      >
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ShoppingBag className="h-4 w-4 text-gray-200" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            {item.brandName && `${item.brandName} • `}{item.color} • Tamanho: <strong className="text-gray-900">{item.size}</strong>
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity}x {formatPrice(item.priceCents)}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900 flex-shrink-0">
                          {formatPrice(item.priceCents * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal ({totalItems} itens)</span>
                      <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Frete ({shippingInfo.label})</span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice(shippingCents)}
                      </span>
                    </div>
                    {payment === 'credit' && selectedInstallment.hasFee && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Acréscimo Cartão ({selectedInstallment.feePercent}%)</span>
                        <span>{formatPrice(selectedInstallment.totalWithFeeCents - totalCents)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-black border-t border-gray-100 pt-3 text-gray-900">
                      <span>Total Final</span>
                      <span>{formatPrice(finalPayableCents)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — resumo fixo */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Resumo da Compra
              </h3>
              <div className="space-y-2 text-sm border-b border-gray-100 pb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{totalItems} calçados</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frete ({address.city || 'Manaus'})</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(shippingCents)}
                  </span>
                </div>
                {payment === 'credit' && selectedInstallment.hasFee && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Taxa cartão</span>
                    <span>{formatPrice(selectedInstallment.totalWithFeeCents - totalCents)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-lg font-black text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(finalPayableCents)}</span>
                </div>
                {payment === 'credit' && (
                  <p className="text-xs text-emerald-700 font-semibold text-right">
                    ou {installmentCount}x de {formatPrice(selectedInstallment.valueCents)}
                  </p>
                )}
              </div>

              {/* Navegação */}
              <div className="space-y-2">
                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canAdvance()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Avançar Etapa
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalize}
                    disabled={submittingOrder}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-black text-white hover:bg-zinc-800 shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingOrder ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                        Reservando Estoque no Caixa...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        Concluir Pedido & Enviar ao Caixa
                      </>
                    )}
                  </button>
                )}

                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex w-full items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 py-2 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar etapa anterior
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
