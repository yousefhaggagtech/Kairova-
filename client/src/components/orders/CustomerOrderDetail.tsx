"use client";

import type { AxiosError } from "axios";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent } from "react";
import { useState } from "react";

import { useAuthGuard } from "@/application/hooks/useAuthGuard";
import {
  useAddPaymentProof,
  useMyOrder,
} from "@/application/hooks/useOrders";
import { usePublicSettings } from "@/application/hooks/useSettings";
import { useImageUpload } from "@/application/hooks/useImageUpload";
import type { PaymentMethod } from "@/domain/entities/api";
import type { PublicSettings } from "@/infrastructure/api/settingsApi";
import { getOrderStatusClasses } from "@/lib/orderStatusStyles";
import {
  getPaymentProofLabelKey,
  paymentProofLabelKeys,
  type PaymentProofLabelKey,
} from "@/lib/paymentProofLabels";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";
type ErrorResponse = {
  message?: string;
};

type CustomerOrderDetailProps = {
  orderId: string;
  showBackLink?: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;

  return axiosError.response?.data?.message || fallback;
}

function getPaymentNumber(
  settings: PublicSettings | undefined,
  paymentMethod: PaymentMethod,
) {
  return paymentMethod === "instapay"
    ? settings?.instapayNumber
    : settings?.vodafoneCashNumber;
}

function getWhatsAppPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function getProofKey(url: string, uploadedAt: string, index: number) {
  return `${url}-${uploadedAt}-${index}`;
}

export default function CustomerOrderDetail({
  orderId,
  showBackLink = true,
}: CustomerOrderDetailProps) {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("account");
  const tAdmin = useTranslations("admin");
  const tCatalog = useTranslations("catalog");
  const tCheckout = useTranslations("checkout");
  const tOrders = useTranslations("orders");
  const { user, isChecking: isAuthChecking } = useAuthGuard("customer");
  const [proofLabel, setProofLabel] =
    useState<PaymentProofLabelKey>("deposit");
  const [actionError, setActionError] = useState("");
  const { data: order, isError, isLoading } = useMyOrder(
    orderId,
    !isAuthChecking && user?.role === "customer",
  );
  const { data: settings, isLoading: isSettingsLoading } = usePublicSettings();
  const proofUpload = useImageUpload("/api/uploads/payment-proofs/sign");
  const addPaymentProof = useAddPaymentProof();

  const getProofDisplayLabel = (label?: string) => {
    const labelKey = getPaymentProofLabelKey(label);

    return labelKey
      ? tOrders(`paymentProofLabels.${labelKey}`)
      : label || t("paymentProof");
  };

  const handleProofChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !order) {
      return;
    }

    setActionError("");

    const uploadResult = await proofUpload.upload(file);

    if (!uploadResult) {
      event.target.value = "";
      return;
    }

    try {
      await addPaymentProof.mutateAsync({
        id: order._id,
        url: uploadResult.url,
        label: proofLabel,
      });
    } catch (error) {
      setActionError(getErrorMessage(error, t("uploadFailed")));
    } finally {
      event.target.value = "";
    }
  };

  if (isAuthChecking || isLoading || isSettingsLoading) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {tCatalog("loading")}
      </div>
    );
  }

  if (user?.role !== "customer") {
    return null;
  }

  if (isError || !order) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {tCheckout("orderNotFound")}
      </div>
    );
  }

  const paymentMethod = order.paymentMethod ?? "vodafone_cash";
  const paymentNumber = getPaymentNumber(settings, paymentMethod);
  const storeWhatsApp = settings?.whatsappNumber || "";
  const whatsappPhone = getWhatsAppPhone(storeWhatsApp);
  const whatsappMessage = encodeURIComponent(
    tOrders("customerWhatsAppMessage", { orderNumber: order.orderNumber }),
  );
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`;
  const paymentProofs = order.paymentProofs ?? [];
  const proofError = actionError || proofUpload.error;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6">
      {showBackLink && (
        <Link href="/account/orders" className="mb-6 inline-block underline">
          {t("backToOrders")}
        </Link>
      )}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-2 font-mono text-body text-fg-muted">
            {order.orderNumber}
          </p>
          <h1 className="text-h1 leading-heading">{t("orderDetails")}</h1>
        </div>
        <span
          className={`inline-block border px-3 py-2 text-body ${
            getOrderStatusClasses(order.status)
          }`}
        >
          {tAdmin(`status.${order.status}`)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="border border-border-light p-5 dark:border-border-subtle">
            <h2 className="mb-4 text-h3 leading-heading">
              {tCheckout("paymentInstructions")}
            </h2>
            <dl className="grid gap-3 text-body sm:grid-cols-2">
              <div>
                <dt className="text-caption text-fg-muted">
                  {t("paymentMethod")}
                </dt>
                <dd>
                  {paymentMethod === "instapay"
                    ? tCheckout("instapay")
                    : tCheckout("vodafoneCash")}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-fg-muted">
                  {tCheckout("transferTo")}
                </dt>
                <dd className="font-mono">
                  {paymentNumber || tCheckout("paymentNumberMissing")}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-fg-muted">
                  {tCheckout("depositAmount")}
                </dt>
                <dd>
                  {order.depositAmount.toLocaleString(locale)}{" "}
                  {tCatalog("egp")}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-fg-muted">{t("remaining")}</dt>
                <dd>
                  {order.remainingAmount.toLocaleString(locale)}{" "}
                  {tCatalog("egp")}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-caption text-fg-muted">
              {tCheckout("afterTransfer")}
            </p>
          </section>

          <section className="border border-border-light p-5 dark:border-border-subtle">
            <h2 className="mb-4 text-h3 leading-heading">{t("items")}</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`${order._id}-${index}`}
                  className="flex justify-between gap-4 border-b border-border-light pb-4 last:border-b-0 last:pb-0 dark:border-border-subtle"
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
            <h2 className="mb-4 text-h3 leading-heading">
              {t("paymentProofs")}
            </h2>
            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_1.5fr]">
              <select
                value={proofLabel}
                onChange={(event) =>
                  setProofLabel(event.target.value as PaymentProofLabelKey)
                }
                className="w-full border border-border-light bg-bg-secondary px-3 py-3 dark:border-border-subtle dark:bg-bg-primary"
              >
                {paymentProofLabelKeys.map((labelKey) => (
                  <option key={labelKey} value={labelKey}>
                    {tOrders(`paymentProofLabels.${labelKey}`)}
                  </option>
                ))}
              </select>
              <input
                type="file"
                accept="image/*"
                disabled={proofUpload.uploading || addPaymentProof.isPending}
                onChange={(event) => void handleProofChange(event)}
                className="w-full border border-border-light px-3 py-3 text-body file:me-4 file:border-0 file:bg-fg-secondary file:px-4 file:py-2 file:text-bg-secondary disabled:opacity-50 dark:border-border-subtle dark:file:bg-fg-primary dark:file:text-bg-primary"
              />
            </div>
            {(proofUpload.uploading || addPaymentProof.isPending) && (
              <p className="mb-4 text-body text-fg-muted">
                {t("uploadingProof")}
              </p>
            )}
            {proofError && (
              <p className="mb-4 text-body text-red-600">{proofError}</p>
            )}

            {paymentProofs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {paymentProofs.map((proof, index) => (
                  <a
                    key={getProofKey(proof.url, proof.uploadedAt, index)}
                    href={proof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-border-light p-2 hover:bg-surface-light dark:border-border-subtle dark:hover:bg-surface-dark"
                  >
                    <div className="relative mb-2 h-32 w-full overflow-hidden bg-surface-light dark:bg-surface-dark">
                      <Image
                        src={proof.url}
                        alt={getProofDisplayLabel(proof.label)}
                        fill
                        unoptimized
                        sizes="(min-width: 640px) 300px, 100vw"
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
        </div>

        <aside className="space-y-6">
          <section className="border border-border-light bg-surface-light p-5 dark:border-border-subtle dark:bg-surface-dark">
            <h2 className="mb-4 text-h3 leading-heading">{t("summary")}</h2>
            <dl className="space-y-3 text-body">
              <div className="flex justify-between gap-4">
                <dt>{tCheckout("subtotal")}</dt>
                <dd>
                  {order.subtotal.toLocaleString(locale)} {tCatalog("egp")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>
                  {tCheckout("depositRequired")} ({order.depositPercentage}%)
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

          {storeWhatsApp && whatsappPhone ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-fg-secondary px-5 py-4 text-center text-bg-secondary hover:opacity-90 dark:bg-fg-primary dark:text-bg-primary"
            >
              {tCheckout("contactWhatsApp")}
            </a>
          ) : (
            <p className="border border-border-light px-5 py-4 text-center text-body text-fg-muted dark:border-border-subtle">
              {tAdmin("configureSettings")}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
