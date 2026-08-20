'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WholesaleCustomer {
  id: string;
  name: string;
  company_name: string | null;
  tax_id: string;
  phone: string;
  city: string | null;
  must_change_password: boolean;
}

interface WholesaleAuthState {
  customer: WholesaleCustomer | null;
  isAuthenticated: boolean;
  login: (customer: WholesaleCustomer) => void;
  logout: () => void;
  setPasswordChanged: () => void;
}

export const useWholesaleAuthStore = create<WholesaleAuthState>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,
      login: (customer) =>
        set({
          customer,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          customer: null,
          isAuthenticated: false,
        }),
      setPasswordChanged: () =>
        set((state) => ({
          customer: state.customer
            ? { ...state.customer, must_change_password: false }
            : null,
        })),
    }),
    {
      name: 'lojatenis-wholesale-auth',
    }
  )
);
