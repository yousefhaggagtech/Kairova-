"use client";

import { useTranslations } from "next-intl";

import { useCartStore } from "@/application/store/cartStore";

export default function AccountAddressesPage() {
  const t = useTranslations("account");
  const tCheckout = useTranslations("checkout");
  const address = useCartStore((state) => state.shippingAddress);

  return (
    <section className="max-w-3xl border border-border-light p-5 dark:border-border-subtle">
      <h2 className="mb-5 text-h3 leading-heading">{t("addressBook")}</h2>

      {address ? (
        <dl className="grid gap-4 text-body sm:grid-cols-2">
          <div>
            <dt className="text-caption text-fg-muted">
              {t("lastCheckoutAddress")}
            </dt>
            <dd>{address.label}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">{t("phone")}</dt>
            <dd>{address.phone}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">{tCheckout("street")}</dt>
            <dd>{address.street}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">{tCheckout("city")}</dt>
            <dd>{address.city}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">
              {tCheckout("governorate")}
            </dt>
            <dd>{address.governorate}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-body text-fg-muted">{t("noAddresses")}</p>
      )}
    </section>
  );
}
