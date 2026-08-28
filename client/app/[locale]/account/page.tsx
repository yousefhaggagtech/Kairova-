"use client";

import { useTranslations } from "next-intl";

import { useAuthStore } from "@/application/store/authStore";
import { Link } from "@/src/i18n/navigation";

export default function AccountPage() {
  const t = useTranslations("account");
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="border border-border-light p-5 dark:border-border-subtle">
        <h2 className="mb-5 text-h3 leading-heading">{t("profile")}</h2>
        <dl className="grid gap-4 text-body sm:grid-cols-2">
          <div>
            <dt className="text-caption text-fg-muted">{t("name")}</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">{t("email")}</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">{t("phone")}</dt>
            <dd>{user.phone || t("notProvided")}</dd>
          </div>
        </dl>
      </section>

      <aside className="space-y-4">
        <Link
          href="/account/orders"
          className="block border border-border-light p-5 transition-colors hover:bg-surface-light dark:border-border-subtle dark:hover:bg-surface-dark"
        >
          <h2 className="text-h3 leading-heading">{t("orders")}</h2>
          <p className="mt-2 text-body text-fg-muted">{t("manageOrders")}</p>
        </Link>
        <Link
          href="/account/addresses"
          className="block border border-border-light p-5 transition-colors hover:bg-surface-light dark:border-border-subtle dark:hover:bg-surface-dark"
        >
          <h2 className="text-h3 leading-heading">{t("addresses")}</h2>
          <p className="mt-2 text-body text-fg-muted">{t("noAddresses")}</p>
        </Link>
      </aside>
    </div>
  );
}
