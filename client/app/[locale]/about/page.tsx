import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 md:px-10">
      <h1 className="mb-6 text-h1 leading-heading">{t("title")}</h1>
      <p className="text-body-lg leading-body text-fg-muted">{t("body")}</p>
    </section>
  );
}
