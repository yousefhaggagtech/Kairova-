"use client";

import { useLocale, useTranslations } from "next-intl";

import { useProducts } from "@/application/hooks/useProducts";
import type { Locale } from "@/src/i18n/config";

import CollectionHeader from "./CollectionHeader";
import ProductGrid from "./ProductGrid";

type GenderCatalogPageProps = {
  gender: "men" | "women";
};

export default function GenderCatalogPage({ gender }: GenderCatalogPageProps) {
  const t = useTranslations("catalog");
  const locale = useLocale() as Locale;
  const { data: products, isLoading } = useProducts({ gender });

  return (
    <>
      <CollectionHeader gender={gender} locale={locale} />
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 md:px-10">
        {isLoading ? (
          <p className="py-8 text-body text-fg-muted">{t("loading")}</p>
        ) : (
          <ProductGrid products={products || []} />
        )}
      </div>
    </>
  );
}
