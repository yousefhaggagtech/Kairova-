"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

import { useAuthGuard } from "@/application/hooks/useAuthGuard";
import { useAuthStore } from "@/application/store/authStore";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";

type Props = {
  children: ReactNode;
};

const navItems = [
  { href: "/account", labelKey: "account" },
  { href: "/account/orders", labelKey: "orders" },
  { href: "/account/addresses", labelKey: "addresses" },
] as const;

export default function AccountLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("account");
  const tCatalog = useTranslations("catalog");
  const { user, hasHydrated, isChecking } = useAuthGuard("customer");
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      router.push("/");
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
                    className={`transition-colors hover:text-hover-muted ${
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
