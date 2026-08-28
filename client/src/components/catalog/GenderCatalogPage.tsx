"use client";

import { useTranslations } from "next-intl";

import { useProducts } from "@/application/hooks/useProducts";

import ProductGrid from "./ProductGrid";

type GenderCatalogPageProps = {
  gender: "men" | "women";
};

export default function GenderCatalogPage({ gender }: GenderCatalogPageProps) {
  const t = useTranslations("catalog");
  const { data: products, isLoading } = useProducts({ gender });
  const title = gender === "men" ? t("menCollection") : t("womenCollection");

  return (
    <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 md:px-10">
      <h1 className="mb-8 text-h1 leading-heading">{title}</h1>
      {isLoading ? (
        <p className="py-8 text-body text-fg-muted">{t("loading")}</p>
      ) : (
        <ProductGrid products={products || []} />
      )}
    </div>
  );
}
