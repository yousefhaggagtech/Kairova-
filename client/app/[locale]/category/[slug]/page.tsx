"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { useCategory } from "@/application/hooks/useCategories";
import { useProducts } from "@/application/hooks/useProducts";
import ProductGrid from "@/components/catalog/ProductGrid";

type SupportedLocale = "ar" | "en";

export default function CategoryPage() {
  const params = useParams();
  const slugParam = params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam || "";
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("catalog");

  const {
    data: category,
    isError: categoryError,
    isLoading: categoryLoading,
  } = useCategory(slug);
  const { data: products, isLoading: productsLoading } = useProducts({
    categoryId: category?._id,
  });

  if (categoryLoading || (category && productsLoading)) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {t("loading")}
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {t("categoryNotFound")}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 md:px-10">
      <h1 className="mb-2 text-h1 leading-heading">
        {category.name[locale] || category.name.en}
      </h1>
      <p className="mb-8 text-body text-fg-muted">
        {category.gender === "men" ? t("menCollection") : t("womenCollection")}
      </p>
      <ProductGrid products={products || []} />
    </div>
  );
}
