"use client";

import type { FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useProducts } from "@/application/hooks/useProducts";
import ProductGrid from "@/components/catalog/ProductGrid";
import type { Locale } from "@/src/i18n/config";
import { useRouter } from "@/src/i18n/navigation";

type SearchPageClientProps = {
  query: string;
};

function normalizeSearchQuery(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function SearchPageClient({ query }: SearchPageClientProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("search");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const normalizedQuery = normalizeSearchQuery(query);
  const isRtl = locale === "ar";
  const { data: products = [], isError, isLoading } = useProducts(
    normalizedQuery ? { search: normalizedQuery } : undefined,
    { enabled: Boolean(normalizedQuery) },
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextQuery = normalizeSearchQuery(String(formData.get("q") ?? ""));

    if (!nextQuery) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  }

  return (
    <div
      className={`mx-auto w-full max-w-[var(--max-content)] px-4 py-12 md:px-10 ${
        isRtl ? "font-body-ar" : "font-body-en"
      }`}
    >
      <section className="mx-auto mb-12 max-w-4xl text-center">
        <p className="mb-4 text-caption font-medium uppercase tracking-normal text-black/45">
          {t("eyebrow")}
        </p>
        <h1
          className={`break-words text-3xl leading-heading text-fg-secondary sm:text-h1 ${
            isRtl ? "font-display-ar" : "font-display-en"
          }`}
        >
          {normalizedQuery
            ? t("titleWithQuery", { query: normalizedQuery })
            : t("title")}
        </h1>
        <form
          className="mx-auto mt-8 flex max-w-2xl flex-col items-stretch gap-4 text-start sm:flex-row sm:items-end"
          onSubmit={handleSubmit}
        >
          <div className="min-w-0 flex-1">
            <label
              className="mb-2 block text-caption font-medium uppercase text-fg-muted"
              htmlFor="search-page-input"
            >
              {t("inputLabel")}
            </label>
            <input
              className="w-full border-0 border-b border-border-light bg-transparent py-3 text-body text-fg-secondary outline-none transition-colors placeholder:text-fg-muted focus:border-fg-secondary"
              defaultValue={query}
              id="search-page-input"
              key={query}
              name="q"
              placeholder={tNav("searchPlaceholder")}
              type="search"
            />
          </div>
          <button
            className="min-h-12 w-full shrink-0 cursor-pointer border border-fg-secondary px-6 text-caption font-medium uppercase text-fg-secondary transition-colors duration-200 hover:bg-fg-secondary hover:text-bg-secondary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary sm:w-auto"
            type="submit"
          >
            {t("submit")}
          </button>
        </form>
        <p className="mt-6 text-body text-fg-muted" aria-live="polite">
          {normalizedQuery
            ? isLoading
              ? t("loading")
              : t("resultCount", { count: products.length })
            : t("emptyState")}
        </p>
      </section>

      {normalizedQuery ? (
        isError ? (
          <p className="py-20 text-center text-body text-fg-muted">
            {t("loadFailed")}
          </p>
        ) : (
          <ProductGrid products={products} isLoading={isLoading} />
        )
      ) : null}
    </div>
  );
}
