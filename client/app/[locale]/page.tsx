import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import FeaturedSection from "@/src/components/home/FeaturedSection";
import HeroMotion from "@/src/components/home/HeroMotion";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  return (
    <>
      <HeroMotion title={t("title")} tagline={t("tagline")} />
      <FeaturedSection locale={locale} />
    </>
  );
}
