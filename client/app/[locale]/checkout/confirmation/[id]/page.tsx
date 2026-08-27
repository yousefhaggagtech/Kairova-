"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { usePublicSettings } from "@/application/hooks/useSettings";
import { useMyOrder } from "@/application/hooks/useOrders";

type SupportedLocale = "ar" | "en";

function getId(idParam: string | string[] | undefined) {
  return Array.isArray(idParam) ? idParam[0] : idParam || "";
}

export default function ConfirmationPage() {
  const params = useParams();
  const orderId = getId(params.id);
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("checkout");
  const tAdmin = useTranslations("admin");
  const tCatalog = useTranslations("catalog");
  const { data: order, isError, isLoading } = useMyOrder(orderId);
  const { data: settings, isLoading: isSettingsLoading } = usePublicSettings();

  if (isLoading || isSettingsLoading) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {tCatalog("loading")}
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {t("orderNotFound")}
      </div>
    );
  }

  const storeWhatsApp = settings?.whatsappNumber || "";
  const walletNumber = settings?.walletNumber || settings?.vodafoneCashNumber;
  const message = encodeURIComponent(
    `Hi, I'm sending deposit for Order ${order.orderNumber}. Total: ${order.subtotal.toLocaleString()} EGP`,
  );
  const whatsappUrl = `https://wa.me/${storeWhatsApp}?text=${message}`;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 text-center">
      <h1 className="mb-4 text-h1 leading-heading">
        {t("reservationCreated")}
      </h1>
      <p className="mb-8 text-body-lg text-fg-muted">
        {t("reservationCreatedDesc")}
      </p>

      <div className="mb-8 bg-surface-light p-6 dark:bg-surface-dark">
        <p className="mb-2 text-body">{t("orderNumber")}</p>
        <p className="font-mono text-h3 leading-heading">
          {order.orderNumber}
        </p>
      </div>

      <div className="mb-8 border border-border-light p-6 text-start dark:border-border-subtle">
        <h2 className="mb-4 text-h3 leading-heading">
          {t("paymentInstructions")}
        </h2>
        <p className="mb-4 text-body">
          {t("depositAmount")}:{" "}
          <strong>
            {order.depositAmount.toLocaleString(locale)} {tCatalog("egp")}
          </strong>
        </p>
        <p className="mb-2 text-body">{t("transferTo")}:</p>
        <p className="mb-4 font-mono text-body-lg">
          {walletNumber || tAdmin("configureSettings")}
        </p>
        <p className="text-caption text-fg-muted">{t("afterTransfer")}</p>
      </div>

      {storeWhatsApp ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-fg-secondary px-8 py-4 text-bg-secondary hover:opacity-90 dark:bg-fg-primary dark:text-bg-primary"
        >
          {t("contactWhatsApp")}
        </a>
      ) : (
        <p className="inline-block border border-border-light px-8 py-4 text-body text-fg-muted dark:border-border-subtle">
          {tAdmin("configureSettings")}
        </p>
      )}
    </div>
  );
}
