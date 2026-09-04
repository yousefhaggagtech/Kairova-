"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { Locale } from "@/src/i18n/config";

const PRODUCT_ITEMS = [
  {
    id: "phantom",
    image:
      "https://ik.imagekit.io/1pscfy7oah/kiarova/kairova-phantom-chronograph-black-men-watch.png",
    layout: "md:col-span-7 md:row-span-2 min-h-[22rem] md:min-h-[30rem]",
  },
  {
    id: "aura",
    image:
      "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/Kayali%20Vanilla%2028%20Hard%20Cover.png",
    layout: "md:col-span-5 md:row-span-1 min-h-[18rem] md:min-h-[14rem]",
  },
  {
    id: "monarch",
    image:
      "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/Dior%20Sauvage%20Parfum.png",
    layout: "md:col-span-5 md:row-span-1 min-h-[18rem] md:min-h-[14rem]",
  },
  {
    id: "starlight",
    image:
      "https://ik.imagekit.io/1pscfy7oah/kiarova/kairova-starlight-diamond-gold-women-watch.png",
    layout: "md:col-span-7 md:row-span-1 min-h-[18rem] md:min-h-[14rem]",
  },
] as const;

export default function CuratedIconsSection() {
  const t = useTranslations("home.curatedIcons");
  const locale = useLocale() as Locale;
  const isRtl = locale === "ar";

  return (
    <section className="bg-bg-secondary px-4 py-section-sm text-fg-secondary sm:px-6 md:px-10 lg:py-section" data-section="curated-icons">
        <div className="mx-auto w-full max-w-[var(--max-content)]">
          <div className="mb-8 flex items-center gap-4">
            <p
              className={`text-caption font-medium text-fg-secondary/55 ${
                isRtl ? "" : "uppercase tracking-[0.32em]"
              }`}
            >
              {t("eyebrow")}
            </p>
            <div className="h-px flex-1 bg-fg-secondary/10" />
          </div>

          <div
            className={`mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${
              isRtl ? "lg:text-end" : ""
            }`}
          >
            <h2 className="max-w-[15ch] text-3xl leading-heading text-fg-secondary sm:text-h1">
              {t("heading")}
            </h2>
            <p className="max-w-xl text-body-lg leading-body text-fg-secondary/70">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-12 md:grid-rows-[minmax(0,20rem)_minmax(0,14.75rem)_minmax(0,14.75rem)]">
            {PRODUCT_ITEMS.map((product) => (
              <motion.article
                key={product.id}
                className={`group relative overflow-hidden bg-fg-secondary ${product.layout}`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="relative h-full w-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <Image
                      alt={t(`items.${product.id}.name`)}
                      className="h-full w-full object-cover [filter:contrast(1.06)_saturate(1.04)_brightness(0.98)]"
                      fill
                      priority={false}
                      quality={100}
                      sizes="(min-width: 1280px) 50vw, 100vw"
                      src={product.image}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.08))]" />
                    <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply [background-image:radial-gradient(rgba(255,255,255,0.35)_0.7px,transparent_0.8px)] [background-size:7px_7px]" />
                  </motion.div>
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,248,240,0.34),transparent_22%),linear-gradient(180deg,rgba(10,10,10,0.08)_0%,rgba(10,10,10,0.18)_40%,rgba(10,10,10,0.8)_100%)]" />

                <motion.div
                  className="absolute inset-x-0 bottom-0 z-20 p-4 md:p-5"
                  initial={{ opacity: 0, y: 8 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                >
                  <span className="inline-flex items-center border border-white/25 bg-white/5 px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.22em] text-fg-primary backdrop-blur-[2px]">
                    {t(`items.${product.id}.feature`)}
                  </span>
                </motion.div>

                <div
                  className={`relative z-10 flex h-full flex-col justify-end gap-2 p-4 text-fg-primary md:p-5 ${
                    isRtl ? "items-end text-end" : "items-start text-start"
                  }`}
                >
                  <h3 className="max-w-[16ch] text-2xl leading-tight text-fg-primary sm:text-3xl">
                    {t(`items.${product.id}.name`)}
                  </h3>
                  <p className="text-caption font-medium text-white/80 sm:text-body">
                    {t(`items.${product.id}.price`)}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
  );
}
