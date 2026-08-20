import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Loja',
    default: 'Catálogo Online',
  },
};

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      <main>{children}</main>
      <footer className="mt-16 border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs text-gray-400">
            Disponibilidade e preços sujeitos a alteração sem aviso prévio. Para confirmar seu pedido, entre em contato via WhatsApp.
          </p>
        </div>
      </footer>
    </div>
  );
}
