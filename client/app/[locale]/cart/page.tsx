import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/src/i18n/config";

import CartPageClient from "./_components/CartPageClient";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "checkout.cartPage.metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;

  return <CartPageClient locale={locale} />;
}
