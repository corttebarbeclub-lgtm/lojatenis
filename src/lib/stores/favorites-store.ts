'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteProduct {
  id: string;
  name: string;
  brandName?: string;
  priceCents: number;
  imageUrl?: string;
}

interface FavoritesState {
  favorites: FavoriteProduct[];
  toggleFavorite: (product: FavoriteProduct) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (product) => {
        const current = get().favorites;
        const exists = current.some((f) => f.id === product.id);
        if (exists) {
          set({ favorites: current.filter((f) => f.id !== product.id) });
        } else {
          set({ favorites: [...current, product] });
        }
      },
      isFavorite: (productId) => {
        return get().favorites.some((f) => f.id === productId);
      },
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'hb-tenis-favorites',
    }
  )
);
