"use client";

import { motion, MotionConfig } from "framer-motion";
import type { Variants } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { Locale } from "@/src/i18n/config";

const PHILOSOPHY_IMAGE_SRC =
  "https://ik.imagekit.io/1pscfy7oah/kiarova/hero-section-pic.png?tr=w-2400,q-100";

const editorialEase: [number, number, number, number] = [0.19, 1, 0.22, 1];

const sectionRevealVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const imageRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.985,
    y: 42,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1.15,
      ease: editorialEase,
    },
  },
};

const imageDepthVariants: Variants = {
  hidden: {
    scale: 1,
  },
  visible: {
    scale: 1.055,
    transition: {
      delay: 0.15,
      duration: 8,
      ease: "easeOut",
    },
  },
};

const copyRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.28,
      duration: 0.95,
      ease: editorialEase,
    },
  },
};

function PyramidWatermark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 1200 260"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M88 232H1112V238H88V232ZM160 232L420 74L574 232H160ZM206 224H528L417 91L206 224ZM464 232L704 42L982 232H464ZM516 224H932L705 59L516 224ZM750 232L972 104L1122 232H750ZM792 224H1087L970 119L792 224ZM371 128L417 98L457 147L448 153L415 113L377 137L371 128ZM662 86L704 53L753 89L745 98L705 67L668 96L662 86Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function HorusWatermark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 360 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26 112C68 68 121 46 184 46C248 46 302 70 334 112C291 150 240 169 181 169C119 169 67 150 26 112Z"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="M101 111C125 89 152 78 181 78C212 78 239 90 260 113C237 134 210 145 181 145C150 145 123 134 101 111Z"
        stroke="currentColor"
        strokeWidth="5"
      />
      <circle cx="181" cy="112" r="22" stroke="currentColor" strokeWidth="5" />
      <path
        d="M181 169C176 187 165 200 149 209M233 160C242 179 257 192 278 199M75 112H18M334 112H292"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  );
}

export default function BrandPhilosophySection() {
  const t = useTranslations("home.brandPhilosophy");
  const locale = useLocale() as Locale;
  const isRtl = locale === "ar";

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        className="relative isolate overflow-hidden bg-bg-secondary px-4 py-section-sm text-fg-secondary sm:px-6 md:px-10 lg:py-section"
        data-section="brand-philosophy"
        initial="hidden"
        viewport={{ once: true, amount: 0.35 }}
        variants={sectionRevealVariants}
        whileInView="visible"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <PyramidWatermark
            className={`absolute bottom-[7%] h-auto w-[78rem] max-w-none text-fg-secondary opacity-[0.035] sm:w-[86rem] ${
              isRtl ? "right-[-18rem] scale-x-[-1]" : "left-[-18rem]"
            }`}
          />
          <HorusWatermark
            className={`absolute top-[12%] h-64 w-64 text-fg-secondary opacity-[0.03] sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem] ${
              isRtl ? "left-[-6rem]" : "right-[-6rem]"
            }`}
          />
        </div>

        <div className="relative mx-auto w-full max-w-[var(--max-content)]">
          <div className="h-px w-full bg-fg-secondary/10" />

          <div className="relative py-14 sm:py-20 lg:min-h-[86svh] lg:py-28">
            <motion.div
              className={`relative w-full overflow-hidden bg-fg-secondary ${
                isRtl ? "lg:ms-auto" : "lg:me-auto"
              } aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] lg:min-h-[440px] lg:w-[76%]`}
              variants={imageRevealVariants}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  transformOrigin: isRtl ? "72% 50%" : "28% 50%",
                }}
                variants={imageDepthVariants}
              >
                <Image
                  alt={t("imageAlt")}
                  className="object-cover object-center grayscale"
                  fill
                  priority={false}
                  quality={100}
                  sizes="(min-width: 1280px) 980px, (min-width: 1024px) 76vw, 100vw"
                  src={PHILOSOPHY_IMAGE_SRC}
                />
              </motion.div>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(10,10,10,0.24)_100%)]"
              />
            </motion.div>

            <div
              className={`relative z-20 mx-auto mt-8 max-w-xl bg-bg-secondary py-4 text-center lg:absolute lg:top-[20%] lg:mt-0 lg:w-[42%] lg:max-w-[34rem] lg:px-12 lg:py-12 lg:text-start ${
                isRtl ? "lg:start-0" : "lg:end-0"
              }`}
            >
              <motion.div variants={copyRevealVariants}>
                <div className="mx-auto mb-8 h-px w-20 bg-fg-secondary/20 lg:mx-0" />
                <p
                  className={`text-caption font-medium text-fg-secondary/55 ${
                    isRtl ? "" : "uppercase tracking-[0.32em]"
                  }`}
                >
                  {t("eyebrow")}
                </p>
                <h2 className="mt-5 text-3xl leading-heading text-fg-secondary sm:text-h1">
                  {t("heading")}
                </h2>
                <p className="mt-7 text-body-lg leading-body text-fg-secondary/75">
                  {t("body")}
                </p>
                <p className="mt-10 text-body font-medium leading-body text-fg-secondary">
                  {t("closing")}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="h-px w-full bg-fg-secondary/10" />
        </div>
      </motion.section>
    </MotionConfig>
  );
}
