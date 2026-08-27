"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useAdminOrders } from "@/application/hooks/useAdminOrders";
import type { Order, OrderStatus, User } from "@/domain/entities/api";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING_DEPOSIT",
  "RESERVED",
  "PACKED",
  "FULLY_PAID",
  "CONFIRMED_SHIPPED",
  "CANCELLED",
];

function getCustomer(order: Order): User | null {
  return typeof order.customer === "object" ? order.customer : null;
}

function getCustomerName(order: Order) {
  return getCustomer(order)?.name ?? order.shippingAddress.label;
}

function getCustomerPhone(order: Order) {
  return order.customerPhone || getCustomer(order)?.phone || order.shippingAddress.phone;
}

function getCustomerEmail(order: Order) {
  return getCustomer(order)?.email ?? "";
}

function getStatusClass(status: OrderStatus) {
  switch (status) {
    case "PENDING_DEPOSIT":
      return "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-100";
    case "RESERVED":
      return "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100";
    case "PACKED":
      return "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100";
    case "FULLY_PAID":
      return "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100";
    case "CONFIRMED_SHIPPED":
      return "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-100";
    case "CANCELLED":
      return "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-100";
  }
}

function matchesSearch(order: Order, query: string) {
  const searchText = [
    order.orderNumber,
    getCustomerName(order),
    getCustomerPhone(order),
    getCustomerEmail(order),
  ]
    .join(" ")
    .toLowerCase();

  return searchText.includes(query.toLowerCase());
}

export default function AdminOrdersPage() {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("admin");
  const tCatalog = useTranslations("catalog");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const filters = statusFilter ? { status: statusFilter } : undefined;
  const { data: orders = [], isError, isLoading } = useAdminOrders(filters);

  const filteredOrders = useMemo(() => {
    const query = search.trim();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => matchesSearch(order, query));
  }, [orders, search]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-h2 leading-heading">{t("orders")}</h2>
          <p className="mt-2 text-body text-fg-muted">
            {filteredOrders.length.toLocaleString(locale)} {t("orders")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_220px]">
          <div>
            <label className="mb-2 block text-caption" htmlFor="order-search">
              {t("search")}
            </label>
            <input
              id="order-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
            />
          </div>
          <div>
            <label className="mb-2 block text-caption" htmlFor="status-filter">
              {t("filterByStatus")}
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as OrderStatus | "")
              }
              className="w-full border border-border-light bg-bg-secondary px-3 py-2 dark:border-border-subtle dark:bg-bg-primary"
            >
              <option value="">{t("allStatuses")}</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`status.${status}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <p className="py-8 text-body text-fg-muted">{t("loading")}</p>
      )}

      {isError && (
        <p className="py-8 text-body text-red-600">{t("loadFailed")}</p>
      )}

      {!isLoading && !isError && filteredOrders.length === 0 && (
        <p className="py-8 text-body text-fg-muted">{t("noOrders")}</p>
      )}

      {!isLoading && !isError && filteredOrders.length > 0 && (
        <div className="overflow-x-auto border border-border-light dark:border-border-subtle">
          <table className="w-full min-w-[900px] border-collapse text-start text-body">
            <thead className="bg-surface-light text-caption uppercase text-fg-muted dark:bg-surface-dark">
              <tr>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("order")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("customer")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("phone")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("total")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("statusLabel")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("created")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("view")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-border-light last:border-b-0 dark:border-border-subtle"
                >
                  <td className="px-4 py-4 font-mono text-body">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-4">
                    <p>{getCustomerName(order)}</p>
                    {getCustomerEmail(order) && (
                      <p className="text-caption text-fg-muted">
                        {getCustomerEmail(order)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">{getCustomerPhone(order)}</td>
                  <td className="px-4 py-4">
                    {order.subtotal.toLocaleString(locale)} {tCatalog("egp")}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block border px-2 py-1 text-caption ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {t(`status.${order.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {new Date(order.createdAt).toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="underline"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
