import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/src/i18n/config";

import CheckoutPageClient from "./_components/CheckoutPageClient";

type CheckoutPageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "checkout.checkoutPage.metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;

  return <CheckoutPageClient locale={locale} />;
}
