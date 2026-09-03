"use client";

import { LogOut } from "lucide-react";
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
      <div className="bg-bg-secondary text-fg-secondary">
        <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
          {t("loading")}
        </div>
      </div>
    );
  }

  if (!user || user.role !== "customer") {
    return null;
  }

  return (
    <div className="bg-surface-light text-fg-secondary">
      <header className="border-b border-border-light bg-bg-secondary">
        <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-7 md:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-caption uppercase text-fg-muted">
                {t("signedInAs")} {user.name}
              </p>
              <h1 className="text-h2 leading-heading">{t("title")}</h1>
              <p className="mt-3 max-w-2xl text-body leading-body text-fg-muted">
                {t("accountShellLead")}
              </p>
            </div>
            <button
              type="button"
              disabled={isLoading || isLoggingOut}
              onClick={() => void handleLogout()}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-fg-secondary px-5 text-body transition-colors hover:bg-fg-secondary hover:text-bg-secondary focus-visible:bg-fg-secondary focus-visible:text-bg-secondary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
              {t("logOut")}
            </button>
          </div>

          <nav
            className="mt-7 flex gap-2 overflow-x-auto border-t border-border-light pt-5 text-body"
            aria-label={t("accountNavigation")}
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/account"
                  ? pathname === "/account"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-11 shrink-0 items-center border px-4 transition-colors focus-visible:outline-none ${
                    isActive
                      ? "border-fg-secondary bg-fg-secondary text-bg-secondary"
                      : "border-border-light bg-bg-secondary text-fg-secondary hover:border-fg-secondary hover:bg-surface-light"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[var(--max-content)] px-4 py-8 md:px-10">
        {children}
      </main>
    </div>
  );
}
