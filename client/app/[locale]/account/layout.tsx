"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/application/store/authStore";
import { Link, usePathname } from "@/src/i18n/navigation";

type Props = {
  children: ReactNode;
};

const navItems = [
  { href: "/account", labelKey: "account" },
  { href: "/account/orders", labelKey: "orders" },
  { href: "/account/addresses", labelKey: "addresses" },
] as const;

export default function AccountLayout({ children }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("account");
  const tCatalog = useTranslations("catalog");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser);
  const logout = useAuthStore((state) => state.logout);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyCustomer() {
      if (!hasHydrated) {
        return;
      }

      if (isAuthenticated && user) {
        if (user.role === "admin") {
          router.replace(`/${locale}/admin`);
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

        if (currentUser.role === "admin") {
          router.replace(`/${locale}/admin`);
          return;
        }

        setIsChecking(false);
      } catch {
        if (!cancelled) {
          router.replace(
            `/${locale}/auth/login?redirect=${encodeURIComponent(
              `/${locale}/account`,
            )}`,
          );
        }
      }
    }

    void verifyCustomer();

    return () => {
      cancelled = true;
    };
  }, [
    hasHydrated,
    isAuthenticated,
    loadCurrentUser,
    locale,
    router,
    user,
  ]);

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
        {tCatalog("loading")}
      </div>
    );
  }

  if (!user || user.role !== "customer") {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-8 md:px-10">
      <header className="mb-8 border-b border-border-light pb-6 dark:border-border-subtle">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-caption uppercase text-fg-muted">
              {t("signedInAs")} {user.name}
            </p>
            <h1 className="text-h2 leading-heading">{t("title")}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <nav className="flex items-center gap-4 text-body">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/account" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition-colors hover:text-[#818181] ${
                      isActive ? "underline" : "text-fg-muted"
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
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
