import { getTranslations } from "next-intl/server";

import { Link } from "@/src/i18n/navigation";

export default async function ProductNotFound() {
  const t = await getTranslations("catalog.productDetail");

  return (
    <section className="min-h-[60svh] bg-bg-absolute px-4 py-20 text-start text-fg-primary md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-[var(--max-content)]">
        <p className="text-caption font-medium uppercase tracking-normal text-fg-muted">
          {t("notFoundEyebrow")}
        </p>
        <h1 className="mt-5 break-words text-h2 leading-heading text-fg-primary sm:text-h1">
          {t("notFoundTitle")}
        </h1>
        <p className="mt-5 max-w-2xl text-body-lg leading-body text-fg-muted">
          {t("notFoundBody")}
        </p>
        <Link
          className="mt-8 inline-flex border border-fg-primary px-6 py-3 text-body font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-bg-absolute focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-primary"
          href="/"
        >
          {t("returnHome")}
        </Link>
      </div>
    </section>
  );
}
