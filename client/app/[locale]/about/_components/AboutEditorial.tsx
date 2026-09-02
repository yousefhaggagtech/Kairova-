import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/src/i18n/config";
import { Link } from "@/src/i18n/navigation";

const HERO_IMAGE_SRC =
  "https://ik.imagekit.io/1pscfy7oah/kiarova/kairova-solaris-emerald-pendant-gold-women-necklace.jpeg?tr=w-2200,q-100";

const BRAND_CODES = [
  { id: "heritage", number: "01" },
  { id: "restraint", number: "02" },
  { id: "service", number: "03" },
] as const;

const DETAIL_POINTS = [
  { id: "materials" },
  { id: "silhouette" },
  { id: "ritual" },
] as const;

const COLLECTION_LINKS = [
  {
    href: "/women",
    id: "women",
  },
  {
    href: "/men",
    id: "men",
  },
] as const;

type AboutEditorialProps = {
  locale: Locale;
};

function getEyebrowClassName(isRtl: boolean, tone: "dark" | "light" = "dark") {
  return [
    "text-caption font-medium",
    tone === "light" ? "text-border-light/80" : "text-fg-secondary/55",
    isRtl ? "" : "uppercase tracking-[0.32em]",
  ]
    .filter(Boolean)
    .join(" ");
}

function HeritageGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 520 520"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M260 42 458 382H62L260 42Z"
        stroke="currentColor"
        strokeWidth="8"
      />
      <path d="M260 42v340M140 382 260 178l120 204" stroke="currentColor" strokeWidth="5" />
      <path
        d="M106 430h308M160 462h200M212 494h96"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  );
}

export default async function AboutEditorial({ locale }: AboutEditorialProps) {
  const t = await getTranslations({ locale, namespace: "about" });
  const isRtl = locale === "ar";

  return (
    <div className="bg-bg-secondary text-fg-secondary" dir={isRtl ? "rtl" : "ltr"}>
      <section
        aria-labelledby="about-hero-heading"
        className="relative isolate overflow-hidden bg-bg-primary text-fg-primary"
        data-section="about-hero"
      >
        <div className="absolute inset-0 z-0">
          <Image
            alt={t("imageAlt")}
            className="object-cover object-[50%_44%] [filter:grayscale(1)_contrast(1.18)_brightness(0.62)]"
            fill
            preload
            quality={100}
            sizes="100vw"
            src={HERO_IMAGE_SRC}
          />
        </div>

        <div aria-hidden="true" className="absolute inset-0 z-10 bg-bg-primary/42" />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_70%_34%,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_34%),linear-gradient(180deg,rgba(10,10,10,0.08)_0%,rgba(10,10,10,0.42)_54%,rgba(10,10,10,0.84)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-4 top-4 z-20 hidden h-[calc(100%-2rem)] border border-fg-primary/12 sm:block md:inset-x-8 md:top-8 md:h-[calc(100%-4rem)]"
        />

        <div className="relative z-20 mx-auto flex min-h-[calc(100svh-9rem)] w-full max-w-[var(--max-content)] flex-col justify-end px-4 pb-14 pt-20 sm:px-6 sm:pb-16 md:px-10 lg:pb-20">
          <div className="max-w-4xl text-start">
            <p className={getEyebrowClassName(isRtl, "light")}>{t("eyebrow")}</p>
            <h1
              id="about-hero-heading"
              className="mt-5 max-w-5xl text-h2 leading-display text-fg-primary sm:text-h1 lg:text-display"
            >
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg leading-body text-border-light/90">
              {t("body")}
            </p>
          </div>

          <div className="mt-12 grid gap-5 border-t border-fg-primary/18 pt-6 text-caption leading-body text-border-light/78 sm:grid-cols-2 lg:w-[72%]">
            <p>{t("heroNote")}</p>
            <p>{t("heroProof")}</p>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden px-4 py-24 sm:px-6 sm:py-32 md:px-10">
        <HeritageGlyph
          className={`absolute top-12 h-[30rem] w-[30rem] text-fg-secondary opacity-[0.035] ${
            isRtl ? "left-[-12rem] scale-x-[-1]" : "right-[-12rem]"
          }`}
        />

        <div className="relative mx-auto grid w-full max-w-[var(--max-content)] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="text-start">
            <div className="mb-8 h-px w-20 bg-fg-secondary/18" />
            <p className={getEyebrowClassName(isRtl)}>{t("statementEyebrow")}</p>
            <h2 className="mt-5 max-w-2xl text-h2 leading-heading text-fg-secondary sm:text-h1">
              {t("statementTitle")}
            </h2>
          </div>

          <div className="grid gap-7 text-start text-body-lg leading-body text-fg-secondary/72">
            <p>{t("storyIntro")}</p>
            <p>{t("storyBody")}</p>
            <p className="font-medium text-fg-secondary">{t("storyClosing")}</p>
          </div>
        </div>
      </section>

      <section className="bg-bg-primary px-4 py-24 text-fg-primary sm:px-6 sm:py-32 md:px-10">
        <div className="mx-auto w-full max-w-[var(--max-content)]">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div className="text-start">
              <p className={getEyebrowClassName(isRtl, "light")}>
                {t("principlesEyebrow")}
              </p>
              <h2 className="mt-5 max-w-2xl text-h2 leading-heading text-fg-primary sm:text-h1">
                {t("principlesTitle")}
              </h2>
              <p className="mt-6 max-w-xl text-body-lg leading-body text-border-light/72">
                {t("principlesSubtitle")}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {BRAND_CODES.map((code) => (
                <article
                  key={code.id}
                  className="border border-fg-primary/12 px-5 py-6 text-start transition-colors duration-500 hover:border-fg-primary/28"
                >
                  <p className="text-caption font-medium text-border-light/54">
                    {code.number}
                  </p>
                  <h3 className="mt-8 text-h3 leading-heading text-fg-primary">
                    {t(`principles.${code.id}.title`)}
                  </h3>
                  <p className="mt-5 text-body leading-body text-border-light/70">
                    {t(`principles.${code.id}.body`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-light px-4 py-24 sm:px-6 sm:py-32 md:px-10">
        <div className="mx-auto grid w-full max-w-[var(--max-content)] gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:gap-20">
          <div className="relative min-h-[440px] overflow-hidden bg-bg-primary shadow-[0_24px_80px_rgba(10,10,10,0.14)] sm:min-h-[560px]">
            <Image
              alt={t("imageAlt")}
              className="object-cover object-[50%_44%] [filter:grayscale(1)_contrast(1.1)_brightness(0.88)]"
              fill
              quality={100}
              sizes="(min-width: 1024px) 46vw, 100vw"
              src={HERO_IMAGE_SRC}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0)_42%,rgba(10,10,10,0.68)_100%)]"
            />
            <p className="absolute bottom-0 max-w-sm px-5 py-5 text-caption leading-body text-border-light/82 sm:px-7 sm:py-7">
              {t("imageCaption")}
            </p>
          </div>

          <div className="text-start">
            <p className={getEyebrowClassName(isRtl)}>{t("craftEyebrow")}</p>
            <h2 className="mt-5 max-w-2xl text-h2 leading-heading text-fg-secondary sm:text-h1">
              {t("craftTitle")}
            </h2>
            <p className="mt-6 max-w-2xl text-body-lg leading-body text-fg-secondary/72">
              {t("craftBody")}
            </p>

            <div className="mt-12 divide-y divide-border-light border-y border-border-light">
              {DETAIL_POINTS.map((point) => (
                <div
                  key={point.id}
                  className="grid gap-3 py-6 sm:grid-cols-[9rem_1fr] sm:gap-8"
                >
                  <p className="text-caption font-medium text-fg-muted">
                    {t(`details.${point.id}.label`)}
                  </p>
                  <p className="text-body-lg leading-body text-fg-secondary/76">
                    {t(`details.${point.id}.text`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-secondary px-4 py-24 text-fg-secondary sm:px-6 sm:py-32 md:px-10">
        <div className="mx-auto w-full max-w-[var(--max-content)] border-t border-fg-secondary/10 pt-16 text-center">
          <p className={getEyebrowClassName(isRtl)}>{t("ctaEyebrow")}</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-h2 leading-heading sm:text-h1">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-body-lg leading-body text-fg-secondary/68">
            {t("ctaBody")}
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
            {COLLECTION_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-20 flex-col justify-center border border-fg-secondary px-6 py-4 text-start transition-colors duration-300 hover:bg-fg-secondary hover:text-bg-secondary focus-visible:bg-fg-secondary focus-visible:text-bg-secondary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary"
              >
                <span className="text-body-lg font-medium leading-heading">
                  {t(`collections.${item.id}.label`)}
                </span>
                <span className="mt-1 text-caption leading-body text-fg-muted transition-colors duration-300 group-hover:text-bg-secondary/72 group-focus-visible:text-bg-secondary/72">
                  {t(`collections.${item.id}.meta`)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
