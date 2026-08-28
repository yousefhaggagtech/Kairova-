"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { useAdminGuard } from "@/application/hooks/useAdminGuard";
import { useAuthStore } from "@/application/store/authStore";
import { Link } from "@/src/i18n/navigation";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("admin");
  const { user, hasHydrated, isChecking } = useAdminGuard();
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      router.push(`/${locale}`);
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!hasHydrated || isChecking) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {t("loading")}
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-8 md:px-10">
      <header className="mb-8 border-b border-border-light pb-6 dark:border-border-subtle">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-caption uppercase text-fg-muted">
              {t("signedInAs")} {user.name}
            </p>
            <h1 className="text-h2 leading-heading">{t("title")}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <nav className="flex items-center gap-4 text-body">
              <Link href="/admin/orders" className="underline">
                {t("orders")}
              </Link>
              <Link href="/admin/products" className="underline">
                {t("products")}
              </Link>
              <Link href="/admin/settings" className="underline">
                {t("settings")}
              </Link>
            </nav>

            <button
              type="button"
              disabled={isLoading || isLoggingOut}
              onClick={() => void handleLogout()}
              className="border border-border-light px-4 py-2 text-body transition-colors hover:border-fg-secondary disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-subtle dark:hover:border-fg-primary"
            >
              {t("logOut")}
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
