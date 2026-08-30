"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/application/store/authStore";
import type { User } from "@/domain/entities/api";
import { usePathname, useRouter } from "@/src/i18n/navigation";

import { useAuthMe } from "./useAuthMe";

type AuthRole = User["role"];

function getRoleHome(role: AuthRole) {
  return role === "admin" ? "/admin" : "/account";
}

function getLoginPath(pathname: string) {
  const redirectTarget = pathname || "/";

  return `/auth/login?redirect=${encodeURIComponent(redirectTarget)}`;
}

export function useAuthGuard(requiredRole?: AuthRole) {
  const router = useRouter();
  const pathname = usePathname();
  const storedUser = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const authQuery = useAuthMe({ enabled: hasHydrated });
  const user = authQuery.isError ? null : authQuery.data ?? storedUser;
  const isChecking = !hasHydrated || authQuery.isPending;

  useEffect(() => {
    if (!hasHydrated || authQuery.isPending) {
      return;
    }

    if (authQuery.isError || !user) {
      router.replace(getLoginPath(pathname));
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace(getRoleHome(user.role));
    }
  }, [
    authQuery.isError,
    authQuery.isPending,
    hasHydrated,
    pathname,
    requiredRole,
    router,
    user,
  ]);

  return {
    user,
    isAuthenticated: Boolean(user),
    hasHydrated,
    isChecking,
  };
}
