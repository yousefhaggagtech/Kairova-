"use client";

import { useLocale, useTranslations } from "next-intl";

import type { Category } from "@/domain/entities/api";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";

export default function CategoryCard({ category }: { category: Category }) {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("catalog");

  return (
    <Link
      href={`/category/${category.slug}`}
      className="block border border-border-light bg-bg-secondary p-6 transition hover:border-fg-secondary dark:border-border-subtle dark:bg-surface-dark dark:hover:border-fg-primary"
    >
      <h3 className="text-h3 leading-heading">
        {category.name[locale] || category.name.en}
      </h3>
      <p className="mt-2 text-body text-fg-muted">
        {category.gender === "men" ? t("men") : t("women")}
      </p>
    </Link>
  );
}
