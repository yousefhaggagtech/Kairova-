"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useMyOrders } from "@/application/hooks/useOrders";
import { useAuthStore } from "@/application/store/authStore";
import type { Order, OrderStatus } from "@/domain/entities/api";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";

const statusClassByStatus: Record<OrderStatus, string> = {
  PENDING_DEPOSIT:
    "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-100",
  RESERVED:
    "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100",
  PACKED:
    "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100",
  FULLY_PAID:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100",
  CONFIRMED_SHIPPED:
    "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-100",
  CANCELLED:
    "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-100",
};

export default function CustomerOrdersPage() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const t = useTranslations("account");
  const tAdmin = useTranslations("admin");
  const tCatalog = useTranslations("catalog");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser);
  const [authChecked, setAuthChecked] = useState(false);
  const { data: orders = [], isError, isLoading } = useMyOrders(authChecked);

  useEffect(() => {
    let cancelled = false;

    async function verifyCustomer() {
      if (!hasHydrated) {
        return;
      }

      if (isAuthenticated && user) {
        if (user.role === "admin") {
          router.replace(`/${locale}/admin/orders`);
          return;
        }

        setAuthChecked(true);
        return;
      }

      try {
        const currentUser = await loadCurrentUser();

        if (cancelled) {
          return;
        }

        if (currentUser.role === "admin") {
          router.replace(`/${locale}/admin/orders`);
          return;
        }

        setAuthChecked(true);
      } catch {
        if (!cancelled) {
          router.replace(
            `/${locale}/auth/login?redirect=${encodeURIComponent(
              `/${locale}/account/orders`,
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

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (first: Order, second: Order) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
  }, [orders]);

  if (!authChecked || isLoading) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {tCatalog("loading")}
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 md:px-10">
      <h1 className="mb-8 text-h1 leading-heading">{t("myOrders")}</h1>

      {isError && (
        <p className="py-8 text-body text-red-600">{t("loadOrdersFailed")}</p>
      )}

      {!isError && sortedOrders.length === 0 && (
        <p className="py-8 text-body text-fg-muted">{t("noOrders")}</p>
      )}

      {!isError && sortedOrders.length > 0 && (
        <div className="grid gap-4">
          {sortedOrders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order._id}`}
              className="border border-border-light p-5 transition-colors hover:bg-surface-light dark:border-border-subtle dark:hover:bg-surface-dark"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="mb-2 font-mono text-body text-fg-muted">
                    {order.orderNumber}
                  </p>
                  <p className="text-body">
                    {new Date(order.createdAt).toLocaleString(locale)}
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:items-end">
                  <span
                    className={`inline-block border px-3 py-2 text-body ${
                      statusClassByStatus[order.status]
                    }`}
                  >
                    {tAdmin(`status.${order.status}`)}
                  </span>
                  <p className="text-body font-medium">
                    {order.subtotal.toLocaleString(locale)} {tCatalog("egp")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
