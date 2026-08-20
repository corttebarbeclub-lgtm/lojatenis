'use client';

export interface ThermalReceiptData {
  orderNumber: string;
  orderSource?: 'pdv' | 'storefront' | 'wholesale';
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeCnpj?: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    complement?: string;
    reference?: string;
    zipCode?: string;
  } | null;
  items: {
    productName: string;
    color?: string;
    size: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
  }[];
  subtotalCents: number;
  discountCents?: number;
  discountDescription?: string;
  deliveryFeeCents?: number;
  totalCents: number;
  payments: {
    method: string;
    amountCents: number;
  }[];
  notes?: string;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function printThermalReceipt(data: ThermalReceiptData) {
  const printWindow = window.open('', '_blank', 'width=380,height=600');
  if (!printWindow) {
    alert('Por favor, permita popups para imprimir o cupom térmico.');
    return;
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <div style="margin-bottom: 6px;">
        <div style="font-weight: bold; text-transform: uppercase;">${item.productName}</div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>Tam ${item.size} • ${item.color || ''}</span>
          <span>${item.quantity}x ${formatMoney(item.unitPriceCents)}</span>
        </div>
        <div style="text-align: right; font-weight: bold;">${formatMoney(item.totalCents)}</div>
      </div>
    `
    )
    .join('');

  const paymentsHtml = data.payments
    .map(
      (p) => `
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span style="text-transform: uppercase;">${p.method === 'cash' ? 'Dinheiro' : p.method === 'pix' ? 'PIX' : 'Cartão'}:</span>
        <span style="font-weight: bold;">${formatMoney(p.amountCents)}</span>
      </div>
    `
    )
    .join('');

  const deliveryHtml = data.deliveryAddress?.street
    ? `
      <div style="border-top: 1px dashed #000; margin-top: 8px; padding-top: 6px;">
        <div style="font-weight: bold; text-align: center; font-size: 12px; margin-bottom: 4px;">DADOS DE ENTREGA</div>
        <div><strong>Cliente:</strong> ${data.customerName || 'Cliente'}</div>
        <div><strong>WhatsApp:</strong> ${data.customerPhone || '—'}</div>
        <div><strong>Endereço:</strong> ${data.deliveryAddress.street}, Nº ${data.deliveryAddress.number || 'S/N'}</div>
        <div><strong>Bairro:</strong> ${data.deliveryAddress.neighborhood || ''} - ${data.deliveryAddress.city || 'Manaus'}/${data.deliveryAddress.state || 'AM'}</div>
        ${data.deliveryAddress.complement ? `<div><strong>Compl:</strong> ${data.deliveryAddress.complement}</div>` : ''}
        ${data.deliveryAddress.reference ? `<div><strong>Ref:</strong> ${data.deliveryAddress.reference}</div>` : ''}
      </div>
    `
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Cupom Não Fiscal - Pedido #${data.orderNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 76mm;
            margin: 0 auto;
            padding: 8px 4px;
            font-size: 12px;
            line-height: 1.25;
            color: #000;
            background: #fff;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .double-divider { border-top: 2px dashed #000; margin: 8px 0; }
          .flex-between { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="center">
          <div style="font-size: 15px; font-weight: bold;">${data.storeName || 'HB TÊNIS MANAUS'}</div>
          <div style="font-size: 10px;">${data.storeAddress || 'Rua Barroso, 355 - Centro, Manaus - AM'}</div>
          <div style="font-size: 10px;">WhatsApp: ${data.storePhone || '(92) 98188-3786'}</div>
          <div style="font-size: 10px;">CNPJ: ${data.storeCnpj || '52.189.432/0001-90'}</div>
          <div class="double-divider"></div>
          <div style="font-size: 13px; font-weight: bold;">CUPOM NÃO FISCAL</div>
          <div style="font-size: 11px;">PEDIDO: #${data.orderNumber.slice(0, 8).toUpperCase()} • ${data.orderSource === 'storefront' ? 'LOJA ONLINE' : 'PDV BALCÃO'}</div>
          <div style="font-size: 10px;">DATA: ${new Date(data.createdAt).toLocaleString('pt-BR')}</div>
        </div>

        <div class="divider"></div>

        <div class="bold" style="margin-bottom: 4px; font-size: 11px;">ITENS DO PEDIDO:</div>
        ${itemsHtml}

        <div class="divider"></div>

        <div class="flex-between">
          <span>Subtotal:</span>
          <span>${formatMoney(data.subtotalCents)}</span>
        </div>

        ${
          data.discountCents && data.discountCents > 0
            ? `
          <div class="flex-between" style="color: #000; font-weight: bold;">
            <span>Desconto Autorizado:</span>
            <span>- ${formatMoney(data.discountCents)}</span>
          </div>
        `
            : ''
        }

        ${
          data.deliveryFeeCents && data.deliveryFeeCents > 0
            ? `
          <div class="flex-between">
            <span>Taxa de Entrega:</span>
            <span>+ ${formatMoney(data.deliveryFeeCents)}</span>
          </div>
        `
            : ''
        }

        <div class="flex-between" style="font-size: 14px; font-weight: bold; margin-top: 4px;">
          <span>TOTAL A PAGAR:</span>
          <span>${formatMoney(data.totalCents)}</span>
        </div>

        <div class="divider"></div>

        <div class="bold" style="margin-bottom: 2px;">PAGAMENTO:</div>
        ${paymentsHtml}

        ${deliveryHtml}

        <div class="double-divider"></div>

        <div class="center" style="font-size: 10px;">
          <div>Obrigado pela preferência!</div>
          <div>Troca apenas com este cupom em até 7 dias.</div>
          <div style="margin-top: 4px; font-weight: bold;">HB TÊNIS - O Melhor do Sneaker em Manaus</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 800);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
