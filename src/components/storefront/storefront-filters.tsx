'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface StorefrontFiltersProps {
  brands: FilterOption[];
  categories: FilterOption[];
  genders: FilterOption[];
}

const GENDERS: FilterOption[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'unissex', label: 'Unissex' },
  { value: 'infantil', label: 'Infantil' },
];

export function StorefrontFilters({ brands, categories, genders }: StorefrontFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === params.get(name)) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.delete('page'); // reset to first page on filter change
      return params.toString();
    },
    [searchParams]
  );

  function toggle(key: string, value: string) {
    const qs = createQueryString(key, value);
    router.push(`${pathname}?${qs}`, { scroll: false });
  }

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  const activeFilters = ['brand', 'category', 'gender', 'stock'].filter((k) => searchParams.has(k));
  const hasFilters = activeFilters.length > 0;

  function FilterSection({
    title,
    paramKey,
    options,
  }: {
    title: string;
    paramKey: string;
    options: FilterOption[];
  }) {
    const active = searchParams.get(paramKey);
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h4>
        <div className="space-y-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggle(paramKey, opt.value)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-all ${
                active === opt.value
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={`h-3 w-3 rounded-full border flex-shrink-0 transition-colors ${
                active === opt.value ? 'bg-white border-white' : 'border-gray-300'
              }`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {/* Disponibilidade */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Disponibilidade</h4>
        <button
          onClick={() => toggle('stock', 'in_stock')}
          className={`w-full flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-all ${
            searchParams.get('stock') === 'in_stock'
              ? 'bg-gray-900 text-white font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className={`h-3 w-3 rounded-full border flex-shrink-0 transition-colors ${
            searchParams.get('stock') === 'in_stock' ? 'bg-white border-white' : 'border-gray-300'
          }`} />
          Em estoque
        </button>
      </div>

      {/* Marca */}
      {brands.length > 0 && (
        <FilterSection title="Marca" paramKey="brand" options={brands} />
      )}

      {/* Categoria */}
      {categories.length > 0 && (
        <FilterSection title="Categoria" paramKey="category" options={categories} />
      )}

      {/* Gênero */}
      {genders.length > 0 && (
        <FilterSection
          title="Gênero"
          paramKey="gender"
          options={GENDERS.filter((g) => genders.some((gg) => gg.value === g.value))}
        />
      )}
    </div>
  );
}
