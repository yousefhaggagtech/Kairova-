import { getTranslations } from "next-intl/server";

type FeaturedSectionProps = {
  locale: string;
};

export default async function FeaturedSection({ locale }: FeaturedSectionProps) {
  const t = await getTranslations({ locale, namespace: "home" });
  const featuredItems = [t("featuredMen"), t("featuredWomen")];

  return (
    <section className="bg-surface-light ps-6 pe-6 pt-section-sm pb-section-sm text-fg-secondary">
      <div className="mx-auto grid w-full max-w-[var(--max-content)] gap-5 md:grid-cols-2">
        {featuredItems.map((label) => (
          <div
            key={label}
            className="flex min-h-56 items-center justify-center border border-border-light bg-bg-secondary ps-8 pe-8 text-center"
          >
            <p className="text-h3 leading-heading text-fg-secondary">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
