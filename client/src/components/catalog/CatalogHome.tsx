"use client";

import { useTranslations } from "next-intl";

import { useCategories } from "@/application/hooks/useCategories";
import { useProducts } from "@/application/hooks/useProducts";

import CategoryCard from "./CategoryCard";
import ProductGrid from "./ProductGrid";

function LoadingState() {
  const t = useTranslations("catalog");
  return <p className="py-8 text-body text-fg-muted">{t("loading")}</p>;
}

export default function CatalogHome() {
  const t = useTranslations("catalog");
  const { data: menCategories, isLoading: menLoading } = useCategories({
    gender: "men",
  });
  const { data: womenCategories, isLoading: womenLoading } = useCategories({
    gender: "women",
  });
  const { data: featuredProducts, isLoading: productsLoading } = useProducts();

  return (
    <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 md:px-10">
      <section className="mb-16">
        <h2 className="mb-6 text-h2 leading-heading">{t("men")}</h2>
        {menLoading ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {menCategories?.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-h2 leading-heading">{t("women")}</h2>
        {womenLoading ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {womenCategories?.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 text-h2 leading-heading">{t("viewAll")}</h2>
        {productsLoading ? (
          <LoadingState />
        ) : (
          <ProductGrid products={(featuredProducts ?? []).slice(0, 8)} />
        )}
      </section>
    </div>
  );
}
