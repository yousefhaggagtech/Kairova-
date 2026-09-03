"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { useAdminOrders } from "@/application/hooks/useAdminOrders";
import { useAdminProducts } from "@/application/hooks/useAdminProducts";
import type { Order, OrderStatus, Product, User } from "@/domain/entities/api";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";

const ACTIONABLE_STATUSES: OrderStatus[] = [
  "PENDING_DEPOSIT",
  "RESERVED",
  "PACKED",
  "FULLY_PAID",
];

const PIPELINE_STATUSES: OrderStatus[] = [
  "PENDING_DEPOSIT",
  "RESERVED",
  "PACKED",
  "FULLY_PAID",
  "CONFIRMED_SHIPPED",
];

const QUICK_ACTIONS = [
  {
    href: "/admin/orders",
    titleKey: "dashboardActionOrders",
    bodyKey: "dashboardActionOrdersBody",
  },
  {
    href: "/admin/products/new",
    titleKey: "dashboardActionAddProduct",
    bodyKey: "dashboardActionAddProductBody",
  },
  {
    href: "/admin/products",
    titleKey: "dashboardActionProducts",
    bodyKey: "dashboardActionProductsBody",
  },
  {
    href: "/admin/settings",
    titleKey: "dashboardActionSettings",
    bodyKey: "dashboardActionSettingsBody",
  },
] as const;

function getCustomer(order: Order): User | null {
  return typeof order.customer === "object" ? order.customer : null;
}

function getCustomerName(order: Order) {
  return (
    getCustomer(order)?.name ??
    order.shippingAddress.fullName ??
    order.shippingAddress.label ??
    ""
  );
}

function getActionLabelKey(status: OrderStatus) {
  switch (status) {
    case "PENDING_DEPOSIT":
      return "confirmDeposit";
    case "RESERVED":
      return "markPacked";
    case "PACKED":
      return "confirmPayment";
    case "FULLY_PAID":
      return "shipOrder";
    default:
      return "view";
  }
}

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();

  return date.toDateString() === today.toDateString();
}

function formatDate(value: string, locale: SupportedLocale) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatCurrency(
  value: number,
  locale: SupportedLocale,
  currency: string,
) {
  return `${value.toLocaleString(locale)} ${currency}`;
}

function isLowStock(product: Product) {
  const threshold = product.lowStockThreshold ?? 3;

  return product.stockQuantity <= threshold;
}

function getStatusCount(orders: Order[], status: OrderStatus) {
  return orders.filter((order) => order.status === status).length;
}

function MetricCard({
  label,
  note,
  value,
}: {
  label: string;
  note: string;
  value: string;
}) {
  return (
    <article className="min-h-36 border border-border-light bg-bg-secondary p-5 shadow-[0_12px_40px_rgba(10,10,10,0.05)]">
      <div className="flex h-full flex-col justify-between gap-5">
        <p className="text-caption uppercase text-fg-muted">{label}</p>
        <div>
          <p className="text-h3 leading-heading text-fg-secondary">{value}</p>
          <p className="mt-2 text-caption text-fg-muted">{note}</p>
        </div>
      </div>
    </article>
  );
}

export default function AdminDashboardClient() {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("admin");
  const tCatalog = useTranslations("catalog");
  const {
    data: orders = [],
    isError: ordersError,
    isLoading: ordersLoading,
  } = useAdminOrders();
  const {
    data: products = [],
    isError: productsError,
    isLoading: productsLoading,
  } = useAdminProducts();
  const isLoading = ordersLoading || productsLoading;

  const dashboard = useMemo(() => {
    const activeOrders = orders.filter(
      (order) =>
        order.status !== "CANCELLED" &&
        order.status !== "CONFIRMED_SHIPPED",
    );
    const attentionOrders = orders
      .filter((order) => ACTIONABLE_STATUSES.includes(order.status))
      .sort(
        (firstOrder, secondOrder) =>
          new Date(secondOrder.updatedAt).getTime() -
          new Date(firstOrder.updatedAt).getTime(),
      );
    const recentOrders = [...orders].sort(
      (firstOrder, secondOrder) =>
        new Date(secondOrder.createdAt).getTime() -
        new Date(firstOrder.createdAt).getTime(),
    );
    const reservedValue = orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((total, order) => total + order.subtotal, 0);
    const lowStockProducts = products
      .filter(isLowStock)
      .sort(
        (firstProduct, secondProduct) =>
          firstProduct.stockQuantity - secondProduct.stockQuantity,
      );

    return {
      activeOrders,
      attentionOrders,
      lowStockProducts,
      menProducts: products.filter((product) => product.gender === "men"),
      outOfStockProducts: products.filter(
        (product) => product.stockQuantity <= 0,
      ),
      recentOrders,
      reservedValue,
      todayOrders: orders.filter((order) => isToday(order.createdAt)),
      womenProducts: products.filter((product) => product.gender === "women"),
    };
  }, [orders, products]);

  const hasError = ordersError || productsError;
  const loadingValue = isLoading ? t("loading") : null;
  const pipelineTotal =
    PIPELINE_STATUSES.reduce(
      (total, status) => total + getStatusCount(orders, status),
      0,
    ) || 1;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden border-y border-border-light bg-bg-secondary py-8 sm:py-10 lg:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--color-bg-secondary)_0%,var(--color-surface-light)_48%,var(--color-bg-secondary)_100%)]" />
        <div className="pointer-events-none absolute end-0 top-0 hidden h-full w-2/5 border-s border-border-light bg-[repeating-linear-gradient(135deg,rgba(10,10,10,0.04)_0,rgba(10,10,10,0.04)_1px,transparent_1px,transparent_18px)] lg:block" />
        <div className="relative grid gap-8 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
          <div className="max-w-3xl">
            <p className="text-caption uppercase text-fg-muted">
              {t("dashboardEyebrow")}
            </p>
            <h2 className="mt-4 text-3xl leading-heading text-fg-secondary sm:text-h1">
              {t("dashboardGreeting")}
            </h2>
            <p className="mt-4 max-w-2xl text-body-lg leading-body text-fg-muted">
              {t("dashboardLead")}
            </p>
          </div>

          <div className="border border-border-light bg-bg-secondary p-5">
            <p className="text-caption uppercase text-fg-muted">
              {t("dashboardToday")}
            </p>
            <p className="mt-4 break-words text-3xl leading-heading text-fg-secondary sm:text-h2">
              {loadingValue ??
                t("dashboardOrdersToday", {
                  count: dashboard.todayOrders.length.toLocaleString(locale),
                })}
            </p>
            <p className="mt-3 text-caption text-fg-muted">
              {loadingValue ??
                t("dashboardNeedsAction", {
                  count:
                    dashboard.attentionOrders.length.toLocaleString(locale),
                })}
            </p>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="border border-border-light bg-bg-secondary p-4 text-body text-fg-secondary"
        >
          {t("dashboardLoadFailed")}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t("dashboardActiveOrders")}
          value={
            loadingValue ??
            dashboard.activeOrders.length.toLocaleString(locale)
          }
          note={t("dashboardActiveOrdersNote")}
        />
        <MetricCard
          label={t("dashboardDepositReviews")}
          value={
            loadingValue ??
            getStatusCount(orders, "PENDING_DEPOSIT").toLocaleString(locale)
          }
          note={t("dashboardDepositReviewsNote")}
        />
        <MetricCard
          label={t("dashboardReservedValue")}
          value={
            loadingValue ??
            formatCurrency(
              dashboard.reservedValue,
              locale,
              tCatalog("egp"),
            )
          }
          note={t("dashboardReservedValueNote")}
        />
        <MetricCard
          label={t("dashboardLowStock")}
          value={
            loadingValue ??
            dashboard.lowStockProducts.length.toLocaleString(locale)
          }
          note={t("dashboardLowStockNote")}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="border border-border-light bg-bg-secondary p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-caption uppercase text-fg-muted">
                {t("dashboardPipeline")}
              </p>
              <h3 className="mt-2 text-h3 leading-heading">
                {t("orders")}
              </h3>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex min-h-11 items-center border border-fg-secondary px-4 text-body transition-colors hover:bg-fg-secondary hover:text-bg-secondary focus-visible:bg-fg-secondary focus-visible:text-bg-secondary focus-visible:outline-none"
            >
              {t("view")}
            </Link>
          </div>

          <div className="space-y-4">
            {PIPELINE_STATUSES.map((status) => {
              const count = getStatusCount(orders, status);
              const width = `${Math.max(
                (count / pipelineTotal) * 100,
                count ? 10 : 2,
              )}%`;

              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-body">
                    <span>{t(`status.${status}`)}</span>
                    <span className="font-mono text-caption text-fg-muted">
                      {loadingValue ?? count.toLocaleString(locale)}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-light">
                    <div
                      className="h-full bg-fg-secondary transition-[width] duration-500"
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border border-border-light bg-bg-secondary p-5 sm:p-6">
          <p className="text-caption uppercase text-fg-muted">
            {t("dashboardAttentionQueue")}
          </p>
          <h3 className="mt-2 text-h3 leading-heading">{t("actions")}</h3>

          <div className="mt-6 space-y-3">
            {isLoading && (
              <p className="py-6 text-body text-fg-muted">{t("loading")}</p>
            )}
            {!isLoading && dashboard.attentionOrders.length === 0 && (
              <p className="py-6 text-body text-fg-muted">
                {t("dashboardEmptyQueue")}
              </p>
            )}
            {!isLoading &&
              dashboard.attentionOrders.slice(0, 4).map((order) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="grid gap-3 border border-border-light p-4 transition-colors hover:bg-surface-light focus-visible:bg-surface-light focus-visible:outline-none sm:grid-cols-[1fr_auto]"
                >
                  <span>
                    <span className="block font-mono text-caption text-fg-muted">
                      {order.orderNumber}
                    </span>
                    <span className="mt-1 block text-body">
                      {getCustomerName(order)}
                    </span>
                  </span>
                  <span className="self-center border border-border-light bg-surface-light px-3 py-2 text-caption">
                    {t(getActionLabelKey(order.status))}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
        <section className="border border-border-light bg-bg-secondary p-5 sm:p-6">
          <p className="text-caption uppercase text-fg-muted">
            {t("dashboardCatalogPulse")}
          </p>
          <h3 className="mt-2 text-h3 leading-heading">{t("products")}</h3>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="border border-border-light p-4">
              <p className="text-caption text-fg-muted">
                {t("dashboardProductsLive")}
              </p>
              <p className="mt-3 text-h3 leading-heading">
                {loadingValue ?? products.length.toLocaleString(locale)}
              </p>
            </div>
            <div className="border border-border-light p-4">
              <p className="text-caption text-fg-muted">
                {t("dashboardOutOfStock")}
              </p>
              <p className="mt-3 text-h3 leading-heading">
                {loadingValue ??
                  dashboard.outOfStockProducts.length.toLocaleString(locale)}
              </p>
            </div>
            <div className="border border-border-light p-4">
              <p className="text-caption text-fg-muted">
                {t("dashboardMenProducts")}
              </p>
              <p className="mt-3 text-h3 leading-heading">
                {loadingValue ??
                  dashboard.menProducts.length.toLocaleString(locale)}
              </p>
            </div>
            <div className="border border-border-light p-4">
              <p className="text-caption text-fg-muted">
                {t("dashboardWomenProducts")}
              </p>
              <p className="mt-3 text-h3 leading-heading">
                {loadingValue ??
                  dashboard.womenProducts.length.toLocaleString(locale)}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {!isLoading && dashboard.lowStockProducts.length === 0 && (
              <p className="text-body text-fg-muted">
                {t("dashboardEmptyLowStock")}
              </p>
            )}
            {!isLoading &&
              dashboard.lowStockProducts.slice(0, 4).map((product) => (
                <Link
                  key={product._id}
                  href={`/admin/products/${product._id}/edit`}
                  className="flex min-h-16 items-center justify-between gap-4 border border-border-light px-4 py-3 transition-colors hover:bg-surface-light focus-visible:bg-surface-light focus-visible:outline-none"
                >
                  <span className="min-w-0">
                    <span className="block break-words text-body">
                      {product.name[locale] || product.name.en}
                    </span>
                    <span className="block break-words font-mono text-caption text-fg-muted">
                      {product.sku}
                    </span>
                  </span>
                  <span className="shrink-0 text-end text-caption text-fg-muted">
                    {t("dashboardUnits", {
                      count: product.stockQuantity.toLocaleString(locale),
                    })}
                  </span>
                </Link>
              ))}
          </div>
        </section>

        <section className="border border-border-light bg-bg-secondary p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-caption uppercase text-fg-muted">
                {t("dashboardRecentReservations")}
              </p>
              <h3 className="mt-2 text-h3 leading-heading">
                {t("orders")}
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading && (
              <p className="py-6 text-body text-fg-muted">{t("loading")}</p>
            )}
            {!isLoading && dashboard.recentOrders.length === 0 && (
              <p className="py-6 text-body text-fg-muted">
                {t("dashboardEmptyOrders")}
              </p>
            )}
            {!isLoading && dashboard.recentOrders.length > 0 && (
              <table className="w-full min-w-[680px] border-collapse text-start text-body">
                <thead className="text-caption uppercase text-fg-muted">
                  <tr>
                    <th className="border-b border-border-light px-3 py-3 text-start">
                      {t("order")}
                    </th>
                    <th className="border-b border-border-light px-3 py-3 text-start">
                      {t("customer")}
                    </th>
                    <th className="border-b border-border-light px-3 py-3 text-start">
                      {t("total")}
                    </th>
                    <th className="border-b border-border-light px-3 py-3 text-start">
                      {t("statusLabel")}
                    </th>
                    <th className="border-b border-border-light px-3 py-3 text-start">
                      {t("created")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentOrders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="group">
                      <td className="border-b border-border-light px-3 py-4 font-mono text-caption">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="inline-flex min-h-11 items-center underline-offset-4 group-hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="border-b border-border-light px-3 py-4">
                        {getCustomerName(order)}
                      </td>
                      <td className="border-b border-border-light px-3 py-4">
                        {formatCurrency(
                          order.subtotal,
                          locale,
                          tCatalog("egp"),
                        )}
                      </td>
                      <td className="border-b border-border-light px-3 py-4">
                        {t(`status.${order.status}`)}
                      </td>
                      <td className="border-b border-border-light px-3 py-4 text-caption text-fg-muted">
                        {formatDate(order.createdAt, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <section>
        <p className="text-caption uppercase text-fg-muted">
          {t("dashboardQuickActions")}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className="group min-h-40 border border-border-light bg-bg-secondary p-5 transition-colors hover:bg-fg-secondary hover:text-bg-secondary focus-visible:bg-fg-secondary focus-visible:text-bg-secondary focus-visible:outline-none"
            >
              <span className="font-mono text-caption text-fg-muted transition-colors group-hover:text-bg-secondary group-focus-visible:text-bg-secondary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-8 block text-body-lg">
                {t(action.titleKey)}
              </span>
              <span className="mt-3 block text-caption leading-body text-fg-muted transition-colors group-hover:text-bg-secondary group-focus-visible:text-bg-secondary">
                {t(action.bodyKey)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
