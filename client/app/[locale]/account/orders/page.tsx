"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { useMyOrders } from "@/application/hooks/useOrders";
import type { Order } from "@/domain/entities/api";
import {
  getOrderStatusClasses,
  getOrderStatusIcon,
} from "@/lib/orderStatusStyles";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";

export default function CustomerOrdersPage() {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("account");
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
    <section className="space-y-8">
      <div className="border-y border-border-light bg-bg-secondary py-8 sm:py-10">
        <div className="px-5 sm:px-6 lg:px-8">
          <p className="text-caption uppercase text-fg-muted">
            {t("ordersEyebrow")}
          </p>
          <h1 className="mt-3 text-3xl leading-heading sm:text-h1">{t("myOrders")}</h1>
          <p className="mt-4 max-w-2xl text-body-lg leading-body text-fg-muted">
            {t("ordersLead")}
          </p>
        </div>
      </div>

      {isError && (
        <p className="border border-border-light bg-bg-secondary px-5 py-4 text-body text-fg-secondary">
          {t("loadOrdersFailed")}
        </p>
      )}

      {!isError && sortedOrders.length === 0 && (
        <p className="border border-border-light bg-bg-secondary px-5 py-8 text-body text-fg-muted">
          {t("noOrders")}
        </p>
      )}

      {!isError && sortedOrders.length > 0 && (
        <div className="grid gap-4">
          {sortedOrders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order._id}`}
              className="group border border-border-light bg-bg-secondary p-5 transition-colors hover:border-fg-secondary hover:bg-surface-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-secondary"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
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
                    className={`inline-flex min-h-11 items-center gap-2 border px-3 text-body ${getOrderStatusClasses(
                      order.status,
                    )}`}
                  >
                    {getOrderStatusIcon(order.status)}
                    {t(`status.${order.status}`)}
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
