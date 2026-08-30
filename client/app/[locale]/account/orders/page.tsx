"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { useMyOrders } from "@/application/hooks/useOrders";
import type { Order } from "@/domain/entities/api";
import { getOrderStatusClasses } from "@/lib/orderStatusStyles";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";

export default function CustomerOrdersPage() {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("account");
  const tAdmin = useTranslations("admin");
  const tCatalog = useTranslations("catalog");
  const { data: orders = [], isError, isLoading } = useMyOrders();

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (first: Order, second: Order) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
  }, [orders]);

  if (isLoading) {
    return <p className="py-8 text-body text-fg-muted">{tCatalog("loading")}</p>;
  }

  return (
    <section>
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
                      getOrderStatusClasses(order.status)
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
