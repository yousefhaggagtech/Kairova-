import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/src/i18n/config";

import AboutEditorial from "./_components/AboutEditorial";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;

  return <AboutEditorial locale={locale} />;
}
