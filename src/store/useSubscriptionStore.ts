import { create } from 'zustand';
import type { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

// ─── Types ────────────────────────────────────────────────────────────

interface SubscriptionState {
  // Pro status
  isPro: boolean;
  isLoading: boolean;

  // Customer info
  customerInfo: CustomerInfo | null;

  // Offerings
  currentOffering: PurchasesOffering | null;

  // Actions
  setIsPro: (isPro: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCustomerInfo: (info: CustomerInfo | null) => void;
  setCurrentOffering: (offering: PurchasesOffering | null) => void;

  // Derived from customer info
  updateFromCustomerInfo: (info: CustomerInfo) => void;
}

// ─── Store ────────────────────────────────────────────────────────────

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPro: false,
  isLoading: true,
  customerInfo: null,
  currentOffering: null,

  setIsPro: (isPro) => set({ isPro }),
  setLoading: (isLoading) => set({ isLoading }),
  setCustomerInfo: (customerInfo) => set({ customerInfo }),
  setCurrentOffering: (currentOffering) => set({ currentOffering }),

  updateFromCustomerInfo: (info) => {
    const isPro =
      typeof info.entitlements.active['AIF Pro'] !== 'undefined';
    set({ customerInfo: info, isPro, isLoading: false });
  },
}));
