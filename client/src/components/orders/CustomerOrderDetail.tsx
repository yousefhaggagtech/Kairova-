"use client";

import type { AxiosError } from "axios";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CloudUpload,
  Package,
  ShieldCheck,
  Truck,
  WalletCards,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent, DragEvent } from "react";
import { useRef, useState } from "react";

import { useAuthGuard } from "@/application/hooks/useAuthGuard";
import {
  useAddPaymentProof,
  useMyOrder,
} from "@/application/hooks/useOrders";
import { usePublicSettings } from "@/application/hooks/useSettings";
import { useImageUpload } from "@/application/hooks/useImageUpload";
import type { PaymentMethod } from "@/domain/entities/api";
import type { PublicSettings } from "@/infrastructure/api/settingsApi";
import {
  getOrderStatusClasses,
  getOrderStatusIcon,
} from "@/lib/orderStatusStyles";
import { paymentProofLabelKeys, type PaymentProofLabelKey } from "@/lib/paymentProofLabels";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";
type JourneyStatus =
  | "PENDING_DEPOSIT"
  | "RESERVED"
  | "PACKED"
  | "FULLY_PAID"
  | "CONFIRMED_SHIPPED"
  | "DELIVERED";
type ErrorResponse = {
  message?: string;
};

const journeyStages = [
  ["PENDING_DEPOSIT", WalletCards],
  ["RESERVED", ShieldCheck],
  ["PACKED", Package],
  ["FULLY_PAID", Check],
  ["CONFIRMED_SHIPPED", Truck],
  ["DELIVERED", Check],
] as const satisfies ReadonlyArray<readonly [JourneyStatus, typeof WalletCards]>;

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: order, isError, isLoading } = useMyOrder(
    orderId,
    !isAuthChecking && user?.role === "customer",
  );
  const { data: settings, isLoading: isSettingsLoading } = usePublicSettings();
  const proofUpload = useImageUpload("/api/uploads/payment-proofs/sign");
  const addPaymentProof = useAddPaymentProof();

  const uploadProof = async (file?: File) => {
    if (!file || !order) return;
    setActionError("");
    const uploadResult = await proofUpload.upload(file);
    if (!uploadResult) return;
    try {
      await addPaymentProof.mutateAsync({
        id: order._id,
        url: uploadResult.url,
        label: proofLabel,
      });
    } catch (error) {
      setActionError(getErrorMessage(error, t("uploadFailed")));
    }
  };

  const handleProofChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadProof(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleProofDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    void uploadProof(event.dataTransfer.files?.[0]);
  };

  if (isAuthChecking || isLoading || isSettingsLoading) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10 text-center">
        {tCatalog("loading")}
      </div>
    );
  }

  if (user?.role !== "customer") return null;

  if (isError || !order) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10 text-center">
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
  const proofError = actionError || proofUpload.error;
  const currentStageIndex = journeyStages.findIndex(
    ([stage]) => stage === order.status,
  );
  const isWaitingForPayment =
    order.status === "PENDING_DEPOSIT" || order.status === "PACKED";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6">
      {showBackLink && (
        <Link href="/account/orders" className="mb-6 inline-flex min-h-11 items-center underline text-sm text-fg-muted transition-colors hover:text-fg-secondary">
          {t("backToOrders")}
        </Link>
      )}

      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs tracking-widest text-fg-muted uppercase">
            {order.orderNumber}
          </p>
          <h1 className="text-3xl leading-tight sm:text-h1">{t("orderDetails")}</h1>
        </div>
        <span
          className={`inline-flex min-h-11 items-center gap-2 border px-4 py-2 text-xs font-medium rounded-full ${getOrderStatusClasses(
            order.status,
          )}`}
        >
          {getOrderStatusIcon(order.status)}
          {t(`status.${order.status}`)}
        </span>
      </div>

      {/* JOURNEY SECTION - UPDATED FOR CUT BORDERS */}
      <section className="mb-12 border border-border-light bg-surface-light p-4 dark:border-border-light dark:bg-bg-secondary sm:p-6 md:p-10">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-h3 leading-heading">{t("journeyTitle")}</h2>
          <span className="text-caption font-medium text-fg-muted">
            {order.status === "CANCELLED" ? t(`status.${order.status}`) : t(`journey.${order.status}`)}
          </span>
        </div>
        
        <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-start">
          {journeyStages.map(([stage, Icon], index) => {
            const completed = currentStageIndex >= index;
            const current = currentStageIndex === index;
            const isLast = index === journeyStages.length - 1;

            return (
              <div key={stage} className="flex shrink-0 items-start">
                {/* Icon and Label Group */}
                <div className="relative z-10 flex w-[5.75rem] shrink-0 flex-col items-center gap-3 text-center">
                  <span className={`flex h-12 w-12 items-center justify-center border transition-all duration-500 bg-surface-light dark:bg-bg-secondary ${
                    current 
                      ? "border-[#C5A059] text-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.3)]" 
                      : completed 
                        ? "border-[#C5A059] text-[#C5A059]" 
                        : "border-border-light text-fg-muted dark:border-border-light"
                  }`}>
                    {completed && !current ? <Check className="h-5 w-5 stroke-[2.5]" /> : <Icon className="h-5 w-5 stroke-[1.5]" />}
                  </span>
                  <span className={`min-h-8 max-w-[5.75rem] text-[10px] uppercase tracking-wider leading-tight ${completed ? "text-fg-secondary dark:text-fg-primary font-medium" : "text-fg-muted"}`}>
                    {t(`journey.${stage}`)}
                  </span>
                </div>

                {/* Segmented Line - Only if not last */}
                {!isLast && (
                  <div className="relative mx-[-6px] mt-6 h-[1.5px] w-14 shrink-0 bg-border-light dark:bg-border-subtle sm:w-16">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-[#C5A059]"
                      initial={{ width: 0 }}
                      animate={{ width: completed ? "100%" : "0%" }}
                      transition={{ duration: 0.8, delay: index * 0.2, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {isWaitingForPayment && (
            <motion.section 
              layout 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="border-t-4 border-t-[#C5A059] border-x border-b border-border-light bg-surface-light p-6 dark:border-border-light dark:bg-bg-secondary md:p-8"
            >
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-fg-muted font-bold">{t("paymentActionEyebrow")}</p>
              <h2 className="mb-6 text-h3 leading-heading">{tCheckout("paymentInstructions")}</h2>
              
              <dl className="grid gap-y-4 text-body sm:grid-cols-2">
                {[
                  { label: t("paymentMethod"), value: paymentMethod === "instapay" ? tCheckout("instapay") : tCheckout("vodafoneCash") },
                  { label: tCheckout("transferTo"), value: paymentNumber || tCheckout("paymentNumberMissing"), isMono: true },
                  { label: tCheckout("depositAmount"), value: `${order.depositAmount.toLocaleString(locale)} ${tCatalog("egp")}` },
                  { label: t("remaining"), value: `${order.remainingAmount.toLocaleString(locale)} ${tCatalog("egp")}` },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <dt className="text-caption text-fg-muted">{item.label}</dt>
                  <dd className={`break-words ${item.isMono ? "font-mono font-medium" : "font-medium"}`}>{item.value}</dd>
                </div>
              ))}
              </dl>
              
              <p className="mt-6 text-caption text-fg-muted italic">
                {tCheckout("afterTransfer")}
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-widest text-fg-muted">{t("proofType")}</label>
                  <select
                    value={proofLabel}
                    onChange={(event) => setProofLabel(event.target.value as PaymentProofLabelKey)}
                    className="kairova-select w-full border border-border-light px-3 py-3 text-body focus:border-[#C5A059] outline-none transition-colors"
                  >
                    {paymentProofLabelKeys.map((labelKey) => (
                      <option key={labelKey} value={labelKey}>
                        {tOrders(`paymentProofLabels.${labelKey}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={proofUpload.uploading || addPaymentProof.isPending}
                  onChange={(event) => void handleProofChange(event)}
                  className="sr-only"
                />
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  onDragOver={(event) => event.preventDefault()} 
                  onDrop={handleProofDrop} 
                  className="group flex min-h-32 w-full flex-col items-center justify-center gap-3 border border-dashed border-border-light bg-bg-secondary text-center transition-all hover:border-[#C5A059] hover:bg-surface-light dark:border-border-light dark:bg-bg-secondary"
                >
                  <CloudUpload className="h-8 w-8 stroke-[1.3] text-fg-muted group-hover:text-[#C5A059] transition-colors" />
                  <div className="space-y-1">
                    <span className="block text-body font-medium">{t("uploadScreenshot")}</span>
                    <span className="block text-caption text-fg-muted">{t("dropFile")}</span>
                  </div>
                </button>

                {(proofUpload.uploading || addPaymentProof.isPending) && (
                  <p className="text-center text-caption text-[#C5A059] animate-pulse">{t("uploadingProof")}</p>
                )}
                {proofError && (
                  <p className="border border-red-200 bg-red-50 px-4 py-3 text-caption text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                    {proofError}
                  </p>
                )}

                {storeWhatsApp && whatsappPhone && (
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block min-h-12 w-full bg-[#C5A059] px-5 py-4 text-center text-white text-body font-medium hover:bg-[#B8860B] transition-colors shadow-sm"
                  >
                    {t("whatsappOption")}
                  </a>
                )}
                
                <p className="mt-6 flex items-start gap-3 border-s-2 border-[#C5A059] px-4 py-3 text-caption leading-relaxed text-fg-muted bg-surface-light dark:bg-bg-secondary">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[#C5A059]" />
                  <span>{t("whatsappNotice")}</span>
                </p>
              </div>
            </motion.section>
          )}

          <section className="border border-border-light p-6 dark:border-border-light">
            <h2 className="mb-6 text-h3 leading-heading">{t("items")}</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`${order._id}-${index}`}
                  className="grid grid-cols-1 gap-3 border-b border-border-light pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center dark:border-border-light"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium">{item.name[locale] || item.name.en}</p>
                    <p className="text-caption text-fg-muted">
                      {item.quantity} x {item.unitPrice.toLocaleString(locale)} {tCatalog("egp")}
                    </p>
                  </div>
                  <p className="break-words font-mono font-medium sm:text-end">
                    {(item.unitPrice * item.quantity).toLocaleString(locale)} {tCatalog("egp")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-border-light bg-surface-light p-6 dark:border-border-light dark:bg-bg-secondary">
            <h2 className="mb-6 text-h3 leading-heading">{t("financialSummary")}</h2>
            <dl className="space-y-4 text-body">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                <dt className="text-fg-muted">{tCheckout("subtotal")}</dt>
                <dd className="break-words sm:text-end">{order.subtotal.toLocaleString(locale)} {tCatalog("egp")}</dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                <dt className="text-fg-muted">{tCheckout("depositRequired")} ({order.depositPercentage}%)</dt>
                <dd className="break-words font-medium text-[#C5A059] sm:text-end">
                  {order.depositAmount.toLocaleString(locale)} {tCatalog("egp")}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 border-t border-border-light pt-4 font-bold sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                <dt>{t("remaining")}</dt>
                <dd className="break-words sm:text-end">{order.remainingAmount.toLocaleString(locale)} {tCatalog("egp")}</dd>
              </div>
            </dl>
          </section>

          {storeWhatsApp && whatsappPhone ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block min-h-12 w-full bg-[#C5A059] px-5 py-4 text-center text-white font-medium hover:bg-[#B8860B] transition-all shadow-md"
            >
              {tCheckout("contactWhatsApp")}
            </a>
          ) : (
            <p className="border border-border-light px-5 py-4 text-center text-body text-fg-muted dark:border-border-light">
              {tAdmin("configureSettings")}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
