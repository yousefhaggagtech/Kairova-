import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import BrandPhilosophySection from "@/components/home/BrandPhilosophySection";
import ClientTestimonialsSection from "@/components/home/ClientTestimonialsSection";
import CuratedIconsSection from "@/components/home/CuratedIconsSection";
import DetailStorytellingSection from "@/components/home/DetailStorytellingSection";
import DetailStorytellingCta from "@/components/home/DetailStorytellingCta";
import DualGateway from "@/components/home/DualGateway";
import HeroMotion from "@/components/home/HeroMotion";

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

export default async function HomePage() {
  const t = await getTranslations("site");

  return (
    <>
      <HeroMotion title={t("title")} tagline={t("tagline")} />
      <DualGateway />
      <BrandPhilosophySection />
      <CuratedIconsSection />
      <DetailStorytellingSection />
      <DetailStorytellingCta />
      <ClientTestimonialsSection />
    </>
  );
}
