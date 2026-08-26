"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/application/store/authStore";

export function useAdminGuard() {
  const locale = useLocale();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifyAdmin() {
      if (!hasHydrated) {
        setIsChecking(true);
        return;
      }

      if (isAuthenticated && user) {
        if (user.role !== "admin") {
          router.replace(`/${locale}`);
          return;
        }

        setIsChecking(false);
        return;
      }

      try {
        const currentUser = await loadCurrentUser();

        if (cancelled) {
          return;
        }

        if (currentUser.role !== "admin") {
          router.replace(`/${locale}`);
          return;
        }

        setIsChecking(false);
      } catch {
        if (!cancelled) {
          router.replace(
            `/${locale}/auth/login?redirect=${encodeURIComponent(
              `/${locale}/admin/orders`,
            )}`,
          );
        }
      }
    }

    void verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, loadCurrentUser, locale, router, user]);

  return {
    user,
    isAuthenticated,
    hasHydrated,
    isChecking,
  };
}
