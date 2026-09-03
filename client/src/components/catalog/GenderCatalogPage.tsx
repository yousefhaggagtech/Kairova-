"use client";

import { motion, MotionConfig } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import type { Locale } from "@/src/i18n/config";

import CategoryFilterBar from "./CategoryFilterBar";
import CollectionHeader from "./CollectionHeader";
import ProductGrid from "./ProductGrid";

type GenderCatalogPageProps = {
  gender: "men" | "women";
};

const luxuryEase: [number, number, number, number] = [0.19, 1, 0.22, 1];

function CollectionMarketingIntro({
  gender,
  locale,
}: {
  gender: GenderCatalogPageProps["gender"];
  locale: Locale;
}) {
  const t = useTranslations(
    gender === "men"
      ? "catalog.menMarketingIntro"
      : "catalog.womenMarketingIntro",
  );
  const isRtl = locale === "ar";

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className={`mx-auto mb-20 max-w-5xl text-center ${
          isRtl ? "font-body-ar" : "font-body-en"
        }`}
        initial={{ opacity: 0, y: 22 }}
        transition={{ duration: 0.8, ease: luxuryEase }}
      >
        <p className="mb-5 text-caption font-medium uppercase tracking-normal text-black/45">
          {t("eyebrow")}
        </p>
        <h2
          className={`text-4xl leading-heading text-black sm:text-h1 ${
            isRtl ? "font-display-ar" : "font-display-en"
          }`}
        >
          {t("title")}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-body-lg leading-body text-black/65">
          {t("body")}
        </p>
      </motion.section>
    </MotionConfig>
  );
}

export default function GenderCatalogPage({ gender }: GenderCatalogPageProps) {
  const locale = useLocale() as Locale;

  return (
    <>
      <CollectionHeader gender={gender} locale={locale} />
      <div className="w-full py-12">
        <CategoryFilterBar gender={gender} />
        <div className="mx-auto w-full max-w-[var(--max-content)] px-4 md:px-10">
          <CollectionMarketingIntro gender={gender} locale={locale} />
          <ProductGrid gender={gender} />
        </div>
      </div>
    </>
  );
}
