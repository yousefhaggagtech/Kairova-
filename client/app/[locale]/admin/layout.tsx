"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { useAdminGuard } from "@/application/hooks/useAdminGuard";
import { Link } from "@/src/i18n/navigation";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const t = useTranslations("admin");
  const { user, hasHydrated, isChecking } = useAdminGuard();

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
          <nav className="flex items-center gap-4 text-body">
            <Link href="/admin/orders" className="underline">
              {t("orders")}
            </Link>
            <Link href="/admin/products" className="underline">
              {t("products")}
            </Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
