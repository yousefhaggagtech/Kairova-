"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/src/i18n/navigation";

export default function DetailStorytellingCta() {
  const t = useTranslations("home.detailCta");
  const locale = useLocale();

  return (
    <section
      aria-labelledby="detail-storytelling-cta-heading"
      className="bg-bg-secondary px-4 pb-24 pt-0 text-center text-fg-secondary sm:px-10 sm:pb-32 sm:pt-0"
      data-section="detail-storytelling-cta"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <h2
          id="detail-storytelling-cta-heading"
          className="text-3xl leading-heading text-fg-secondary sm:text-h1"
        >
          {t("heading")}
        </h2>
        <p className="mt-4 max-w-xl text-body leading-relaxed text-fg-muted sm:text-lg">
          {t("body")}
        </p>
        <Link
          href="/category/women-accessories"
          className="mt-10 inline-flex min-h-12 items-center justify-center border border-fg-secondary px-8 py-3 text-caption font-medium uppercase text-fg-secondary hover:bg-fg-secondary hover:text-bg-secondary focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}
