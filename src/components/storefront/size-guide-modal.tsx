'use client';

import { useState } from 'react';
import { X, Ruler } from 'lucide-react';

const sizeChart = [
  { br: '34', us: '4', eu: '35', cm: '22.0' },
  { br: '35', us: '5', eu: '36', cm: '22.5' },
  { br: '36', us: '6', eu: '37', cm: '23.5' },
  { br: '37', us: '7', eu: '38', cm: '24.0' },
  { br: '38', us: '8', eu: '39', cm: '25.0' },
  { br: '39', us: '9', eu: '40', cm: '25.5' },
  { br: '40', us: '10', eu: '41', cm: '26.5' },
  { br: '41', us: '11', eu: '42', cm: '27.0' },
  { br: '42', us: '12', eu: '43', cm: '28.0' },
  { br: '43', us: '13', eu: '44', cm: '28.5' },
  { br: '44', us: '14', eu: '45', cm: '29.5' },
];

interface SizeGuideModalProps {
  trigger?: React.ReactNode;
}

export function SizeGuideModal({ trigger }: SizeGuideModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </span>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Ruler className="h-4 w-4" />
          Guia de Tamanhos
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-gray-900" />
                <h2 className="text-lg font-bold text-gray-900">Guia de Tamanhos</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabela */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">BR</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">US</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">EU</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">CM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sizeChart.map((row) => (
                    <tr key={row.br} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 font-medium text-gray-900">{row.br}</td>
                      <td className="px-4 py-2 text-gray-600">{row.us}</td>
                      <td className="px-4 py-2 text-gray-600">{row.eu}</td>
                      <td className="px-4 py-2 text-gray-600">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dicas */}
            <div className="mt-4 rounded-xl bg-blue-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-blue-900">📏 Como medir seu pé</h3>
              <ol className="space-y-1 text-xs text-blue-700 list-decimal list-inside">
                <li>Coloque o pé sobre uma folha de papel, apoiado em uma parede.</li>
                <li>Marque a ponta do dedo mais longo e o calcanhar.</li>
                <li>Meça a distância entre as duas marcas em centímetros.</li>
                <li>Consulte a tabela acima para encontrar o tamanho ideal.</li>
              </ol>
              <p className="mt-2 text-xs text-blue-600">
                💡 <strong>Dica:</strong> Meça os dois pés — use o maior como referência. Em caso de dúvida, escolha o número maior.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
