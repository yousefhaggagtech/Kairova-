"use client";

import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type { Locale } from "@/src/i18n/config";

const REVIEW_ITEMS = [
  {
    id: "review1",
    image: "https://ik.imagekit.io/1pscfy7oah/kiarova/reviews/review-1.jpeg",
  },
  {
    id: "review2",
    image: "https://ik.imagekit.io/1pscfy7oah/kiarova/reviews/review-2.jpeg",
  },
  {
    id: "review3",
    image: "https://ik.imagekit.io/1pscfy7oah/kiarova/reviews/review-3.jpeg",
  },
  {
    id: "review4",
    image: "https://ik.imagekit.io/1pscfy7oah/kiarova/reviews/review-4.jpeg",
  },
  {
    id: "review5",
    image: "https://ik.imagekit.io/1pscfy7oah/kiarova/reviews/review-5.jpeg",
  },
  {
    id: "review6",
    image: "https://ik.imagekit.io/1pscfy7oah/kiarova/reviews/review-6.jpeg",
  },
  {
    id: "review7",
    image: "https://ik.imagekit.io/1pscfy7oah/kiarova/reviews/review-7.jpeg",
  },
  {
    id: "review8",
    image: "https://ik.imagekit.io/1pscfy7oah/kiarova/reviews/review-8.jpeg",
  },
  {
    id: "review9",
    image: "https://ik.imagekit.io/1pscfy7oah/kiarova/reviews/review-9.jpeg",
  },
] as const;

const editorialEase: [number, number, number, number] = [0.19, 1, 0.22, 1];
const SLIDE_INTERVAL_MS = 7200;

const sectionRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.1,
      ease: editorialEase,
    },
  },
};

const slideVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction * 28,
    filter: "blur(3px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.95,
      ease: editorialEase,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -22,
    filter: "blur(2px)",
    transition: {
      duration: 0.65,
      ease: editorialEase,
    },
  }),
};

export default function ClientTestimonialsSection() {
  const t = useTranslations("home.clientTestimonials");
  const locale = useLocale() as Locale;
  const isRtl = locale === "ar";
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeReview = REVIEW_ITEMS[activeIndex];
  const slideDirection = isRtl ? -1 : 1;

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const slideTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % REVIEW_ITEMS.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(slideTimer);
  }, [shouldReduceMotion]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        aria-labelledby="client-testimonials-heading"
        className="bg-bg-secondary px-4 py-24 text-fg-secondary sm:px-6 sm:py-32 md:px-10 lg:py-40"
        data-section="client-testimonials"
        dir={isRtl ? "rtl" : "ltr"}
        initial="hidden"
        viewport={{ once: true, amount: 0.28 }}
        variants={sectionRevealVariants}
        whileInView="visible"
      >
        <div className="mx-auto w-full max-w-[var(--max-content)]">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className={`text-caption font-medium text-fg-secondary/50 ${
                isRtl ? "" : "uppercase tracking-[0.32em]"
              }`}
            >
              {t("eyebrow")}
            </p>
            <h2
              id="client-testimonials-heading"
              className="mt-5 text-h2 leading-heading text-fg-secondary sm:text-h1"
            >
              {t("title")}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-body-lg leading-body text-fg-secondary/65">
              {t("subtitle")}
            </p>
          </div>

          <div className="mt-16 overflow-hidden sm:mt-20 lg:mt-24">
            <AnimatePresence custom={slideDirection} initial={false} mode="wait">
              <motion.article
                key={activeReview.id}
                className="grid min-h-[42rem] items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.72fr)] lg:gap-16 lg:[direction:ltr]"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div
                  className={`mx-auto flex max-w-xl flex-col items-center text-center lg:mx-0 ${
                    isRtl ? "lg:items-end lg:text-end" : "lg:items-start lg:text-start"
                  }`}
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  <div className="mb-10 flex w-full items-center gap-5">
                    <span className="h-px flex-1 bg-fg-secondary/10" />
                    <span className="text-caption font-medium text-fg-secondary/35">
                      {(activeIndex + 1).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="max-w-[13ch] text-h2 leading-heading text-fg-secondary sm:text-h1">
                    {t(`items.${activeReview.id}.title`)}
                  </h3>
                  <p className="mt-7 max-w-lg text-body-lg leading-body text-fg-secondary/70">
                    {t(`items.${activeReview.id}.body`)}
                  </p>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <div className="relative w-full max-w-[18rem] sm:max-w-[20rem]">
                    <div className="relative aspect-[9/19.5] rounded-[2.35rem] border border-fg-secondary/18 bg-bg-secondary p-2 shadow-[0_32px_90px_rgba(10,10,10,0.14)] sm:p-2.5">
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-3 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-fg-secondary/20"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute -right-1 top-28 h-12 w-px rounded-full bg-fg-secondary/20"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute -left-1 top-24 h-8 w-px rounded-full bg-fg-secondary/20"
                      />
                      <div className="relative h-full overflow-hidden rounded-[1.9rem] border border-fg-secondary/8 bg-surface-light p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.62)] sm:p-3">
                        <div className="relative h-full w-full overflow-hidden rounded-[1.45rem] bg-bg-secondary shadow-[0_14px_36px_rgba(10,10,10,0.12)]">
                          <Image
                            alt={t(`items.${activeReview.id}.imageAlt`)}
                            className="object-contain object-center [filter:grayscale(20%)_contrast(1.1)]"
                            fill
                            priority={activeIndex === 0}
                            quality={100}
                            sizes="(min-width: 1024px) 300px, 74vw"
                            src={activeReview.image}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          <div
            aria-label={t("paginationGroupLabel")}
            className="mt-12 flex items-center justify-center gap-3"
            role="group"
          >
            {REVIEW_ITEMS.map((review, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={review.id}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={t("paginationLabel", { number: index + 1 })}
                  className={`h-6 w-9 cursor-pointer transition-opacity duration-500 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary ${
                    isActive ? "opacity-100" : "opacity-35 hover:opacity-65"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  <span
                    className={`block h-px w-full transition-colors duration-500 ${
                      isActive ? "bg-fg-secondary" : "bg-fg-secondary/40"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </motion.section>
    </MotionConfig>
  );
}
