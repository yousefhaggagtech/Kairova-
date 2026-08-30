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
import type {
  Order,
  OrderItem,
  OrderStatus,
  User,
} from "@/domain/entities/api";
import { getOrderStatusClasses } from "@/lib/orderStatusStyles";
import { getPaymentProofLabelKey } from "@/lib/paymentProofLabels";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";
type ErrorResponse = {
  message?: string;
};

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
  return getCustomer(order)?.name ?? order.shippingAddress.label;
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
  const [cancelReason, setCancelReason] = useState("");
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

    void runAction(() =>
      cancelOrder.mutateAsync({
        id: order._id,
        reason: cancelReason.trim(),
      }),
    );
  };

  const getProofDisplayLabel = (label?: string) => {
    const labelKey = getPaymentProofLabelKey(label);

    return labelKey
      ? tOrders(`paymentProofLabels.${labelKey}`)
      : label || t("paymentProof");
  };

  if (isLoading) {
    return <p className="py-8 text-body text-fg-muted">{t("loading")}</p>;
  }

  if (isError || !order) {
    return <p className="py-8 text-body text-fg-muted">{t("orderNotFound")}</p>;
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

  return (
    <section>
      <Link href="/admin/orders" className="mb-6 inline-block underline">
        {t("backToOrders")}
      </Link>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-2 font-mono text-body text-fg-muted">
            {order.orderNumber}
          </p>
          <h2 className="text-h2 leading-heading">{t("order")}</h2>
        </div>
        <span
          className={`inline-block border px-3 py-2 text-body ${getOrderStatusClasses(
            order.status,
          )}`}
        >
          {t(`status.${order.status}`)}
        </span>
      </div>

      <section className="mb-8 border border-border-light bg-surface-light p-5 dark:border-border-subtle dark:bg-surface-dark">
        <h3 className="mb-4 text-h3 leading-heading">{t("actions")}</h3>

        <div className="grid gap-3 md:grid-cols-2">
          {order.status === "PENDING_DEPOSIT" && (
            <button
              type="button"
              disabled={actionPending}
              onClick={() =>
                void runAction(() => confirmDeposit.mutateAsync(order._id))
              }
              className="w-full border border-fg-secondary bg-fg-secondary px-4 py-3 text-bg-secondary disabled:opacity-50 dark:border-fg-primary dark:bg-fg-primary dark:text-bg-primary"
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
              className="w-full border border-fg-secondary bg-fg-secondary px-4 py-3 text-bg-secondary disabled:opacity-50 dark:border-fg-primary dark:bg-fg-primary dark:text-bg-primary"
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
              className="w-full border border-fg-secondary bg-fg-secondary px-4 py-3 text-bg-secondary disabled:opacity-50 dark:border-fg-primary dark:bg-fg-primary dark:text-bg-primary"
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
              <label className="block text-caption" htmlFor="waybill">
                {t("waybillNumber")}
              </label>
              <input
                id="waybill"
                type="text"
                value={waybillNumber}
                onChange={(event) => setWaybillNumber(event.target.value)}
                required
                disabled={shippingRequiresManualCheck}
                className="w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
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
                className="w-full border border-fg-secondary bg-fg-secondary px-4 py-3 text-bg-secondary disabled:opacity-50 dark:border-fg-primary dark:bg-fg-primary dark:text-bg-primary"
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
              className="space-y-3 md:col-span-2"
              data-testid="admin-cancel-form"
            >
              <label className="block text-caption" htmlFor="cancel-reason">
                {t("cancelReason")}
              </label>
              <textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                required
                maxLength={500}
                className="min-h-24 w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
              />
              <button
                type="submit"
                disabled={actionPending || cancelReason.trim().length === 0}
                className="w-full border border-red-700 px-4 py-3 text-red-700 disabled:opacity-50 dark:border-red-300 dark:text-red-300"
                data-testid="admin-cancel-action"
              >
                {actionPending ? t("processing") : t("cancelOrder")}
              </button>
            </form>
          )}
        </div>

        {actionError && (
          <p className="mt-4 text-body text-red-600">{actionError}</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="border border-border-light p-5 dark:border-border-subtle">
            <h3 className="mb-4 text-h3 leading-heading">{t("items")}</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={getProductKey(item, index)}
                  className="flex flex-col gap-2 border-b border-border-light pb-4 last:border-b-0 last:pb-0 dark:border-border-subtle sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p>{item.name[locale] || item.name.en}</p>
                    <p className="text-caption text-fg-muted">
                      {item.quantity} x{" "}
                      {item.unitPrice.toLocaleString(locale)} {tCatalog("egp")}
                    </p>
                  </div>
                  <p className="font-medium">
                    {(item.unitPrice * item.quantity).toLocaleString(locale)}{" "}
                    {tCatalog("egp")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-border-light p-5 dark:border-border-subtle">
            <h3 className="mb-4 text-h3 leading-heading">
              {t("shippingAddress")}
            </h3>
            <dl className="grid gap-3 text-body sm:grid-cols-2">
              <div>
                <dt className="text-caption text-fg-muted">{t("address")}</dt>
                <dd>
                  {shippingAddress.street}, {shippingAddress.city},{" "}
                  {shippingAddress.governorate}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-fg-muted">{t("phone")}</dt>
                <dd>{shippingAddress.phone}</dd>
              </div>
              <div>
                <dt className="text-caption text-fg-muted">{t("waybill")}</dt>
                <dd>{order.waybillNumber || t("notSet")}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-border-light p-5 dark:border-border-subtle">
            <h3 className="mb-4 text-h3 leading-heading">
              {t("customerDetails")}
            </h3>
            <dl className="space-y-3 text-body">
              <div>
                <dt className="text-caption text-fg-muted">{t("customer")}</dt>
                <dd>{getCustomerName(order)}</dd>
              </div>
              <div>
                <dt className="text-caption text-fg-muted">{t("email")}</dt>
                <dd>{customer?.email || t("notSet")}</dd>
              </div>
              <div>
                <dt className="text-caption text-fg-muted">{t("phone")}</dt>
                <dd>{customerPhone}</dd>
              </div>
              {customerWhatsAppPhone && (
                <div>
                  <dt className="text-caption text-fg-muted">
                    {t("customerWhatsApp")}
                  </dt>
                  <dd>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {t("contactCustomerWhatsApp")}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-caption text-fg-muted">{t("created")}</dt>
                <dd>{new Date(order.createdAt).toLocaleString(locale)}</dd>
              </div>
              <div>
                <dt className="text-caption text-fg-muted">{t("updated")}</dt>
                <dd>{new Date(order.updatedAt).toLocaleString(locale)}</dd>
              </div>
            </dl>
          </section>

          <section className="border border-border-light p-5 dark:border-border-subtle">
            <h3 className="mb-4 text-h3 leading-heading">{t("payments")}</h3>
            <dl className="space-y-3 text-body">
              <div className="flex justify-between gap-4">
                <dt>{t("paymentMethod")}</dt>
                <dd>
                  {order.paymentMethod === "instapay"
                    ? tCheckout("instapay")
                    : tCheckout("vodafoneCash")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{t("subtotal")}</dt>
                <dd>
                  {order.subtotal.toLocaleString(locale)} {tCatalog("egp")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>
                  {t("deposit")} ({order.depositPercentage}%)
                </dt>
                <dd>
                  {order.depositAmount.toLocaleString(locale)}{" "}
                  {tCatalog("egp")}
                </dd>
              </div>
              <div className="flex justify-between gap-4 font-medium">
                <dt>{t("remaining")}</dt>
                <dd>
                  {order.remainingAmount.toLocaleString(locale)}{" "}
                  {tCatalog("egp")}
                </dd>
              </div>
            </dl>
          </section>

          <section className="border border-border-light p-5 dark:border-border-subtle">
            <h3 className="mb-4 text-h3 leading-heading">
              {t("paymentProofs")}
            </h3>
            {paymentProofs.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {paymentProofs.map((proof, index) => (
                  <a
                    key={getProofKey(proof.url, proof.uploadedAt, index)}
                    href={proof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-border-light p-2 transition-colors hover:bg-surface-light dark:border-border-subtle dark:hover:bg-surface-dark"
                  >
                    <div className="relative mb-2 h-28 w-full overflow-hidden bg-surface-light dark:bg-surface-dark">
                      <Image
                        src={proof.url}
                        alt={getProofDisplayLabel(proof.label)}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 300px, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="text-body">
                      {getProofDisplayLabel(proof.label)}
                    </p>
                    <p className="text-caption text-fg-muted">
                      {new Date(proof.uploadedAt).toLocaleString(locale)}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-body text-fg-muted">{t("noPaymentProofs")}</p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
