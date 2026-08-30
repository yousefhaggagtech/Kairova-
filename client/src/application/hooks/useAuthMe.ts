"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthStore } from "@/application/store/authStore";
import { authApi } from "@/infrastructure/api/authApi";

import { authMeQueryKey } from "./authQueryKeys";

type UseAuthMeOptions = {
  enabled?: boolean;
};

export function useAuthMe({ enabled = true }: UseAuthMeOptions = {}) {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setAuthenticatedUser = useAuthStore(
    (state) => state.setAuthenticatedUser,
  );
  const clearAuthenticatedUser = useAuthStore(
    (state) => state.clearAuthenticatedUser,
  );
  const shouldFetch = hasHydrated && enabled;

  const authQuery = useQuery({
    queryKey: authMeQueryKey,
    queryFn: authApi.getMe,
    enabled: shouldFetch,
    retry: false,
  });

  useEffect(() => {
    if (!shouldFetch || !authQuery.isSuccess) {
      return;
    }

    setAuthenticatedUser(authQuery.data);
  }, [
    authQuery.data,
    authQuery.isSuccess,
    setAuthenticatedUser,
    shouldFetch,
  ]);

  useEffect(() => {
    if (!shouldFetch || !authQuery.isError) {
      return;
    }

    clearAuthenticatedUser();
  }, [authQuery.isError, clearAuthenticatedUser, shouldFetch]);

  return authQuery;
}
