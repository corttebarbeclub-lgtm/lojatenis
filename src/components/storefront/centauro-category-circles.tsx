import Link from 'next/link';

interface CentauroCategoryCirclesProps {
  slug: string;
}

const CATEGORIES = [
  {
    name: 'Jordan & Nike',
    param: '?brand=nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
    tag: 'Hype Kicks',
  },
  {
    name: 'Adidas Retrô',
    param: '?brand=adidas',
    image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=300&auto=format&fit=crop&q=80',
    tag: 'Samba / OG',
  },
  {
    name: 'New Balance',
    param: '?brand=new balance',
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=300&auto=format&fit=crop&q=80',
    tag: '550 / 9060',
  },
  {
    name: 'Streetwear',
    param: '?category=casual',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop&q=80',
    tag: 'Casual Lifestyle',
  },
  {
    name: 'Corrida',
    param: '?category=corrida',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop&q=80',
    tag: 'Performance',
  },
  {
    name: 'Puma Hype',
    param: '?brand=puma',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&auto=format&fit=crop&q=80',
    tag: 'Palermo / Suede',
  },
  {
    name: 'Asics Gel',
    param: '?brand=asics',
    image: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=300&auto=format&fit=crop&q=80',
    tag: 'Gel-Nimbus',
  },
  {
    name: 'Vans Skate',
    param: '?brand=vans',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&auto=format&fit=crop&q=80',
    tag: 'Old Skool',
  },
  {
    name: 'HB Atacado',
    param: '/atacado',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&auto=format&fit=crop&q=80',
    tag: 'Lojistas B2B',
  },
];

export function CentauroCategoryCircles({ slug }: CentauroCategoryCirclesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Categorias & Marcas Exclusivas
        </h3>
        <span className="text-xs font-black text-amber-400 hidden sm:inline">
          50 modelos pronta entrega no Amazonas
        </span>
      </div>

      {/* Carrossel de Círculos com Borda Dourada */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const href = cat.param.startsWith('/') ? `/loja/${slug}${cat.param}` : `/loja/${slug}${cat.param}`;
          return (
            <Link
              key={cat.name}
              href={href}
              className="group flex flex-col items-center gap-2 flex-shrink-0"
            >
              {/* Círculo com Borda Dourada no Hover */}
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-zinc-800 bg-zinc-900 p-1 shadow-md group-hover:border-amber-400 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all duration-300 group-hover:scale-105">
                <div className="h-full w-full overflow-hidden rounded-full bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
                  />
                </div>
              </div>

              {/* Rótulo da Categoria */}
              <div className="text-center">
                <span className="block text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition-colors leading-tight">
                  {cat.name}
                </span>
                <span className="block text-[10px] text-zinc-400 font-medium">
                  {cat.tag}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
