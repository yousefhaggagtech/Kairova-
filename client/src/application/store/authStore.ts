"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authMeQueryKey } from "@/application/hooks/authQueryKeys";
import type { User } from "@/domain/entities/api";
import { authApi } from "@/infrastructure/api/authApi";
import { queryClient } from "@/infrastructure/http/queryClient";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;

  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
  setAuthenticatedUser: (user: User) => void;
  clearAuthenticatedUser: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user } = await authApi.login({ email, password });
          set({ user, isAuthenticated: true });
          queryClient.setQueryData(authMeQueryKey, user);
          return user;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true });
        try {
          const { user } = await authApi.register({
            name,
            email,
            password,
            phone,
          });
          set({ user, isAuthenticated: true });
          queryClient.setQueryData(authMeQueryKey, user);
          return user;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, isAuthenticated: false });
        queryClient.removeQueries({ queryKey: authMeQueryKey });
      },

      setAuthenticatedUser: (user) => set({ user, isAuthenticated: true }),
      clearAuthenticatedUser: () =>
        set({ user: null, isAuthenticated: false }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "kairova-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
