"use client";

import type { AxiosError } from "axios";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  useAdminOrder,
  useCancelOrder,
  useConfirmDeposit,
  useConfirmPayment,
  useMarkPacked,
  useShipOrder,
} from "@/application/hooks/useAdminOrders";
import OptimizedProductImage from "@/components/media/OptimizedProductImage";
import type {
  Order,
  OrderItem,
  ProductImage,
  OrderStatus,
  User,
} from "@/domain/entities/api";
import { formatAddressLines } from "@/lib/addressFormat";
import {
  getOrderStatusClasses,
  getOrderStatusIcon,
} from "@/lib/orderStatusStyles";
import { getPaymentProofLabelKey } from "@/lib/paymentProofLabels";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";
type ErrorResponse = {
  message?: string;
};

type DetailItem = {
  label: string;
  value: string;
};

const panelClassName = "border border-border-light bg-bg-secondary p-5 sm:p-6";
const panelTitleClassName = "text-h3 leading-heading text-fg-secondary";
const detailLabelClassName = "block text-caption uppercase text-fg-muted";
const detailValueClassName = "break-words text-body font-medium text-fg-secondary";
const fieldClassName =
  "w-full border border-border-light bg-bg-secondary px-3 py-2 text-body text-fg-secondary transition-colors placeholder:text-fg-muted focus:border-fg-secondary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";
const primaryButtonClassName =
  "w-full border border-fg-secondary bg-fg-secondary px-4 py-3 text-body font-medium text-bg-secondary transition-colors hover:bg-bg-absolute focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-secondary disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClassName =
  "w-full border border-border-light bg-bg-secondary px-4 py-3 text-body font-medium text-fg-secondary transition-colors hover:border-fg-secondary hover:bg-surface-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-secondary disabled:cursor-not-allowed disabled:opacity-50";

function getId(idParam: string | string[] | undefined) {
  return Array.isArray(idParam) ? idParam[0] : idParam || "";
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || fallback;
}

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

function getCustomerPhone(order: Order) {
  return order.customerPhone || getCustomer(order)?.phone || order.shippingAddress.phone;
}

function getProductKey(item: OrderItem, index: number) {
  const productId =
    typeof item.product === "string" ? item.product : item.product._id;

  return `${productId}-${index}`;
}

function canCancel(status: OrderStatus) {
  return status !== "CONFIRMED_SHIPPED" && status !== "CANCELLED";
}

function getWhatsAppPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function getProofKey(url: string, uploadedAt: string, index: number) {
  return `${url}-${uploadedAt}-${index}`;
}

function getItemPrimaryImage(item: OrderItem): ProductImage | null {
  if (typeof item.product === "string") {
    return null;
  }

  const images = Array.isArray(item.product.images) ? item.product.images : [];

  return images.find((image) => image.isPrimary) || images[0] || null;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = getId(params.id);
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("admin");
  const tCatalog = useTranslations("catalog");
  const tCheckout = useTranslations("checkout");
  const tOrders = useTranslations("orders");
  const { data: order, isError, isLoading } = useAdminOrder(orderId);
  const confirmDeposit = useConfirmDeposit();
  const markPacked = useMarkPacked();
  const confirmPayment = useConfirmPayment();
  const shipOrder = useShipOrder();
  const cancelOrder = useCancelOrder();
  const [waybillNumber, setWaybillNumber] = useState("");
  const [actionError, setActionError] = useState("");

  const actionPending =
    confirmDeposit.isPending ||
    markPacked.isPending ||
    confirmPayment.isPending ||
    shipOrder.isPending ||
    cancelOrder.isPending;

  const runAction = async (action: () => Promise<Order>) => {
    setActionError("");

    try {
      await action();
    } catch (error) {
      setActionError(getErrorMessage(error, t("actionFailed")));
    }
  };

  const handleShip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!order) {
      return;
    }

    if (order.shippingStatus === "manual_required") {
      return;
    }

    void runAction(() =>
      shipOrder.mutateAsync({
        id: order._id,
        waybillNumber: waybillNumber.trim(),
      }),
    );
  };

  const handleCancel = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!order) {
      return;
    }

    void runAction(() => cancelOrder.mutateAsync(order._id));
  };

  const getProofDisplayLabel = (label?: string) => {
    const labelKey = getPaymentProofLabelKey(label);

    return labelKey
      ? tOrders(`paymentProofLabels.${labelKey}`)
      : label || t("paymentProof");
  };

  if (isLoading) {
    return (
      <section className={panelClassName}>
        <p className="text-body text-fg-muted">{t("loading")}</p>
      </section>
    );
  }

  if (isError || !order) {
    return (
      <section className={panelClassName}>
        <p className="text-body text-fg-muted">{t("orderNotFound")}</p>
      </section>
    );
  }

  const customer = getCustomer(order);
  const shippingAddress = order.shippingAddress;
  const shippingRequiresManualCheck =
    order.status === "FULLY_PAID" &&
    order.shippingStatus === "manual_required";
  const customerPhone = getCustomerPhone(order);
  const customerWhatsAppPhone = getWhatsAppPhone(customerPhone);
  const whatsappMessage = encodeURIComponent(
    tOrders("adminWhatsAppMessage", { orderNumber: order.orderNumber }),
  );
  const whatsappUrl = `https://wa.me/${customerWhatsAppPhone}?text=${whatsappMessage}`;
  const paymentProofs = order.paymentProofs ?? [];
  const formatMoney = (amount: number) =>
    `${amount.toLocaleString(locale)} ${tCatalog("egp")}`;
  const paymentMethodLabel =
    order.paymentMethod === "instapay"
      ? tCheckout("instapay")
      : order.paymentMethod === "vodafone_cash"
        ? tCheckout("vodafoneCash")
        : t("notSet");
  const totalQuantity = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const headerMetrics: DetailItem[] = [
    { label: t("customer"), value: getCustomerName(order) },
    { label: t("total"), value: formatMoney(order.subtotal) },
    {
      label: t("paymentProofs"),
      value: paymentProofs.length.toLocaleString(locale),
    },
    { label: t("quantity"), value: totalQuantity.toLocaleString(locale) },
  ];
  const orderSummaryItems: DetailItem[] = [
    { label: t("paymentChannel"), value: paymentMethodLabel },
    { label: t("subtotal"), value: formatMoney(order.subtotal) },
    {
      label: `${t("deposit")} (${order.depositPercentage}%)`,
      value: formatMoney(order.depositAmount),
    },
    { label: t("remaining"), value: formatMoney(order.remainingAmount) },
  ];
  const customerItems: DetailItem[] = [
    { label: t("customer"), value: getCustomerName(order) },
    { label: t("email"), value: customer?.email || t("notSet") },
    { label: t("phone"), value: customerPhone },
  ];
  const deliveryItems: DetailItem[] = [
    {
      label: t("address"),
      value: formatAddressLines(shippingAddress).join(", ") || t("notSet"),
    },
    { label: t("phone"), value: shippingAddress.phone },
    { label: t("waybill"), value: order.waybillNumber || t("notSet") },
  ];
  const timelineItems: DetailItem[] = [
    {
      label: t("created"),
      value: new Date(order.createdAt).toLocaleString(locale),
    },
    {
      label: t("updated"),
      value: new Date(order.updatedAt).toLocaleString(locale),
    },
    ...(order.cancellationReason
      ? [{ label: t("cancelReason"), value: order.cancellationReason }]
      : []),
  ];

  return (
    <section className="space-y-8">
      <Link
        href="/admin/orders"
        className="inline-flex min-h-10 items-center border border-border-light bg-bg-secondary px-4 text-body text-fg-secondary transition-colors hover:border-fg-secondary hover:bg-surface-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-secondary"
      >
        {t("backToOrders")}
      </Link>

      <section className="relative overflow-hidden border-y border-border-light bg-bg-secondary py-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--color-bg-secondary)_0%,var(--color-surface-light)_48%,var(--color-bg-secondary)_100%)]" />
        <div className="pointer-events-none absolute end-0 top-0 hidden h-full w-2/5 border-s border-border-light bg-[repeating-linear-gradient(135deg,rgba(10,10,10,0.04)_0,rgba(10,10,10,0.04)_1px,transparent_1px,transparent_18px)] lg:block" />
        <div className="relative px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-caption uppercase text-fg-muted">
                {t("orderWorkspace")}
              </p>
              <p className="mt-4 font-mono text-body text-fg-muted">
                {order.orderNumber}
              </p>
              <h2 className="mt-2 text-h1 leading-heading text-fg-secondary">
                {t("order")}
              </h2>
              <p className="mt-4 max-w-2xl text-body-lg leading-body text-fg-muted">
                {t("orderDetailLead")}
              </p>
            </div>
            <span
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 border px-3 text-body ${getOrderStatusClasses(
                order.status,
              )}`}
            >
              {getOrderStatusIcon(order.status)}
              {t(`status.${order.status}`)}
            </span>
          </div>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {headerMetrics.map((item) => (
              <div
                key={item.label}
                className="border border-border-light bg-bg-secondary/85 p-4"
              >
                <dt className={detailLabelClassName}>{item.label}</dt>
                <dd className="mt-2 break-words text-body-lg font-semibold text-fg-secondary">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className={panelClassName}>
            <div className="border-b border-border-light pb-5">
              <p className={detailLabelClassName}>{t("actions")}</p>
              <h3 className={`mt-2 ${panelTitleClassName}`}>
                {t("fulfillmentControls")}
              </h3>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {order.status === "PENDING_DEPOSIT" && (
                <button
                  type="button"
                  disabled={actionPending}
                  onClick={() =>
                    void runAction(() => confirmDeposit.mutateAsync(order._id))
                  }
                  className={primaryButtonClassName}
                  data-testid="admin-forward-action"
                >
                  {actionPending ? t("processing") : t("confirmDeposit")}
                </button>
              )}

              {order.status === "RESERVED" && (
                <button
                  type="button"
                  disabled={actionPending}
                  onClick={() =>
                    void runAction(() => markPacked.mutateAsync(order._id))
                  }
                  className={primaryButtonClassName}
                  data-testid="admin-forward-action"
                >
                  {actionPending ? t("processing") : t("markPacked")}
                </button>
              )}

              {order.status === "PACKED" && (
                <button
                  type="button"
                  disabled={actionPending}
                  onClick={() =>
                    void runAction(() => confirmPayment.mutateAsync(order._id))
                  }
                  className={primaryButtonClassName}
                  data-testid="admin-forward-action"
                >
                  {actionPending ? t("processing") : t("confirmPayment")}
                </button>
              )}

              {order.status === "FULLY_PAID" && (
                <form
                  onSubmit={handleShip}
                  className="space-y-3 md:col-span-2"
                  data-testid="admin-ship-form"
                >
                  <label className={detailLabelClassName} htmlFor="waybill">
                    {t("waybillNumber")}
                  </label>
                  <input
                    id="waybill"
                    type="text"
                    value={waybillNumber}
                    onChange={(event) => setWaybillNumber(event.target.value)}
                    required
                    disabled={shippingRequiresManualCheck}
                    className={fieldClassName}
                  />
                  {shippingRequiresManualCheck && (
                    <p className="text-caption text-fg-muted">
                      {t("manualShippingRequired")}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={
                      actionPending ||
                      shippingRequiresManualCheck ||
                      waybillNumber.trim().length === 0
                    }
                    className={primaryButtonClassName}
                    data-testid="admin-forward-action"
                  >
                    {actionPending ? t("processing") : t("shipOrder")}
                  </button>
                </form>
              )}

              {order.status === "CONFIRMED_SHIPPED" && (
                <p className="text-body text-fg-muted">{t("noForwardAction")}</p>
              )}

              {order.status === "CANCELLED" && (
                <p className="text-body text-fg-muted">{t("alreadyCancelled")}</p>
              )}

              {canCancel(order.status) && (
                <form
                  onSubmit={handleCancel}
                  className="md:col-span-2"
                  data-testid="admin-cancel-form"
                >
                  <button
                    type="submit"
                    disabled={actionPending}
                    className={secondaryButtonClassName}
                    data-testid="admin-cancel-action"
                  >
                    {actionPending ? t("processing") : t("cancelOrder")}
                  </button>
                </form>
              )}
            </div>

            {actionError && (
              <p className="mt-5 border border-fg-secondary bg-surface-light px-4 py-3 text-body text-fg-secondary">
                {actionError}
              </p>
            )}
          </section>

          <section className={panelClassName}>
            <div className="flex flex-col gap-2 border-b border-border-light pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={detailLabelClassName}>{t("orderSummary")}</p>
                <h3 className={`mt-2 ${panelTitleClassName}`}>{t("items")}</h3>
              </div>
              <p className="text-body text-fg-muted">
                {totalQuantity.toLocaleString(locale)} {t("quantity")}
              </p>
            </div>

            <div className="divide-y divide-border-light">
              {order.items.map((item, index) => {
                const itemImage = getItemPrimaryImage(item);
                const itemName = item.name[locale] || item.name.en;

                return (
                  <article
                    key={getProductKey(item, index)}
                    className="grid gap-4 py-5 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="relative h-24 w-[88px] overflow-hidden bg-surface-light">
                      {itemImage ? (
                        <OptimizedProductImage
                          src={itemImage.url}
                          alt={
                            itemImage.alt[locale] ||
                            itemImage.alt.en ||
                            itemName
                          }
                          fill
                          variant="thumbnail"
                          sizes="88px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-caption text-fg-muted">
                          {tCatalog("noImage")}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="break-words text-body-lg font-medium text-fg-secondary">
                        {itemName}
                      </h4>
                      <dl className="mt-3 grid gap-3 text-body sm:grid-cols-2">
                        <div>
                          <dt className={detailLabelClassName}>
                            {t("quantity")}
                          </dt>
                          <dd className={detailValueClassName}>
                            {item.quantity.toLocaleString(locale)}
                          </dd>
                        </div>
                        <div>
                          <dt className={detailLabelClassName}>
                            {t("price")}
                          </dt>
                          <dd className={detailValueClassName}>
                            {formatMoney(item.unitPrice)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="border-t border-border-light pt-4 sm:border-t-0 sm:pt-0 sm:text-end">
                      <p className={detailLabelClassName}>{t("lineTotal")}</p>
                      <p className="mt-2 text-body-lg font-semibold text-fg-secondary">
                        {formatMoney(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={panelClassName}>
            <div className="border-b border-border-light pb-5">
              <p className={detailLabelClassName}>{t("uploadedProofs")}</p>
              <h3 className={`mt-2 ${panelTitleClassName}`}>
                {t("paymentProofs")}
              </h3>
            </div>

            {paymentProofs.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {paymentProofs.map((proof, index) => (
                  <a
                    key={getProofKey(proof.url, proof.uploadedAt, index)}
                    href={proof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block border border-border-light bg-bg-secondary p-3 transition-colors hover:border-fg-secondary hover:bg-surface-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-secondary"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-light">
                      <Image
                        src={proof.url}
                        alt={getProofDisplayLabel(proof.label)}
                        fill
                        unoptimized
                        sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-3 text-body font-medium text-fg-secondary">
                      {getProofDisplayLabel(proof.label)}
                    </p>
                    <p className="mt-1 text-caption text-fg-muted">
                      {new Date(proof.uploadedAt).toLocaleString(locale)}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-5 border border-border-light bg-surface-light px-4 py-5 text-body text-fg-muted">
                {t("noPaymentProofs")}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <section className={panelClassName}>
            <div className="border-b border-border-light pb-5">
              <p className={detailLabelClassName}>{t("payments")}</p>
              <h3 className={`mt-2 ${panelTitleClassName}`}>
                {t("orderSummary")}
              </h3>
            </div>

            <dl className="divide-y divide-border-light">
              {orderSummaryItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 py-4"
                >
                  <dt className="text-body text-fg-muted">{item.label}</dt>
                  <dd className="max-w-[55%] break-words text-end text-body font-semibold text-fg-secondary">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={panelClassName}>
            <div className="border-b border-border-light pb-5">
              <p className={detailLabelClassName}>{t("customerDetails")}</p>
              <h3 className={`mt-2 ${panelTitleClassName}`}>
                {t("customerSnapshot")}
              </h3>
            </div>

            <dl className="mt-5 space-y-4">
              {customerItems.map((item) => (
                <div key={item.label}>
                  <dt className={detailLabelClassName}>{item.label}</dt>
                  <dd className={`mt-1 ${detailValueClassName}`}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            {customerWhatsAppPhone && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center border border-fg-secondary px-4 text-center text-body font-medium text-fg-secondary transition-colors hover:bg-fg-secondary hover:text-bg-secondary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-secondary"
              >
                {t("contactCustomerWhatsApp")}
              </a>
            )}
          </section>

          <section className={panelClassName}>
            <div className="border-b border-border-light pb-5">
              <p className={detailLabelClassName}>{t("shippingAddress")}</p>
              <h3 className={`mt-2 ${panelTitleClassName}`}>
                {t("deliverySnapshot")}
              </h3>
            </div>

            <dl className="mt-5 space-y-4">
              {deliveryItems.map((item) => (
                <div key={item.label}>
                  <dt className={detailLabelClassName}>{item.label}</dt>
                  <dd className={`mt-1 ${detailValueClassName}`}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={panelClassName}>
            <h3 className={panelTitleClassName}>{t("timeline")}</h3>
            <dl className="mt-5 space-y-4">
              {timelineItems.map((item) => (
                <div
                  key={item.label}
                  className="border-s border-border-light ps-4"
                >
                  <dt className={detailLabelClassName}>{item.label}</dt>
                  <dd className={`mt-1 ${detailValueClassName}`}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}
