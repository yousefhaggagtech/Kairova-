"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LocalizedString } from "@/domain/entities/api";

export interface CartItem {
  productId: string;
  name: LocalizedString;
  price: number;
  quantity: number;
  imageUrl: string | null;
  slug: string;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  hasHydrated: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;

  getTotal: () => number;
  getItemCount: () => number;
}

const clampQuantity = (quantity: number, stockQuantity: number) =>
  Math.max(1, Math.min(quantity, stockQuantity));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.productId === item.productId,
          );

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.productId === item.productId
                  ? {
                      ...cartItem,
                      quantity: clampQuantity(
                        cartItem.quantity + item.quantity,
                        item.stockQuantity,
                      ),
                      stockQuantity: item.stockQuantity,
                    }
                  : cartItem,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: clampQuantity(item.quantity, item.stockQuantity),
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: clampQuantity(quantity, item.stockQuantity),
                }
              : item,
          ),
        })),

      clear: () => set({ items: [] }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      getTotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ),
      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "kairova-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
