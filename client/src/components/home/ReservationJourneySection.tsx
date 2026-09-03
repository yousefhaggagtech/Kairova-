"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import type { Locale } from "@/src/i18n/config";

const steps = [
  {
    id: "reserve",
    number: "01",
    icon: ReserveIcon,
  },
  {
    id: "verify",
    number: "02",
    icon: VerifyIcon,
  },
  {
    id: "own",
    number: "03",
    icon: OwnIcon,
  },
] as const;

const editorialEase: [number, number, number, number] = [0.19, 1, 0.22, 1];
const hiddenRouteSegments = new Set(["admin", "auth", "login"]);

export default function ReservationJourneySection() {
  const t = useTranslations("home.reservationJourney");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const isRtl = locale === "ar";
  const pathSegments = pathname.split("/").filter(Boolean);
  const routeSegment =
    pathSegments[0] === locale ? pathSegments[1] : pathSegments[0];
  const isProductDetailPage = /\/product\/[^/]+\/?$/.test(pathname);
  const shouldReduceMotion = useReducedMotion();

  if (routeSegment && hiddenRouteSegments.has(routeSegment)) {
    return null;
  }

  const surfaceClassName = isProductDetailPage
    ? "border-t border-border-subtle bg-bg-absolute text-fg-primary"
    : "bg-bg-secondary text-fg-secondary";
  const eyebrowClassName = isProductDetailPage
    ? "text-fg-muted"
    : "text-fg-secondary/55";
  const headingClassName = isProductDetailPage
    ? "text-fg-primary"
    : "text-fg-secondary";
  const bodyClassName = isProductDetailPage
    ? "text-fg-muted"
    : "text-fg-secondary/68";
  const mutedClassName = isProductDetailPage
    ? "text-fg-muted"
    : "text-fg-secondary/45";
  const dividerClassName = isProductDetailPage
    ? "bg-border-subtle"
    : "bg-fg-secondary/10";
  const iconShellClassName = isProductDetailPage
    ? "border-border-subtle bg-surface-dark shadow-[0_10px_30px_rgba(255,255,255,0.03)] group-hover:border-fg-primary/28 group-hover:bg-bg-absolute"
    : "border-fg-secondary/12 bg-bg-secondary shadow-[0_10px_30px_rgba(10,10,10,0.06)] group-hover:border-fg-secondary/22 group-hover:bg-surface-light";
  const iconClassName = isProductDetailPage
    ? "text-fg-primary"
    : "text-fg-secondary";

  return (
    <motion.section
      aria-labelledby="reservation-journey-heading"
      className={`${surfaceClassName} px-4 py-24 sm:px-6 sm:py-32 md:px-10 lg:py-40`}
      data-section="reservation-journey"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-[var(--max-content)]">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className={`text-caption font-medium ${eyebrowClassName} ${
              isRtl ? "" : "uppercase tracking-[0.32em]"
            }`}
          >
            {t("eyebrow")}
          </p>
          <h2
            id="reservation-journey-heading"
            className={`mt-5 text-h2 leading-heading sm:text-h1 ${headingClassName}`}
          >
            {t("title")}
          </h2>
          <p className={`mx-auto mt-5 max-w-2xl text-body-lg leading-body ${bodyClassName}`}>
            {t("subtitle")}
          </p>
        </div>

        <div className="relative mt-16 lg:mt-20">
          <div
            className={`absolute left-1/2 top-10 hidden h-px w-[72%] -translate-x-1/2 lg:block ${dividerClassName}`}
          />

          <motion.div
            className="grid gap-8 md:gap-10 lg:grid-cols-3"
            initial="hidden"
            variants={containerVariants}
            whileInView="show"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <motion.article
                  key={step.id}
                  className={`group relative ${
                    isRtl ? "lg:text-right" : "lg:text-left"
                  }`}
                  custom={index}
                  initial="hidden"
                  variants={stepVariants}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                  whileInView="show"
                >
                  <div
                    className={`relative flex items-start gap-5 lg:block lg:text-center ${
                      isRtl ? "lg:items-end" : "lg:items-start"
                    }`}
                  >
                    <div
                      className={`absolute bottom-0 left-7 top-0 w-px lg:hidden ${dividerClassName}`}
                    />

                    <motion.div
                      animate={shouldReduceMotion ? undefined : { scale: 1.04 }}
                      className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${iconShellClassName}`}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
                    >
                      <Icon className={`h-7 w-7 stroke-[1.5] ${iconClassName}`} />
                    </motion.div>

                    <div className={`relative z-10 flex-1 pt-2 ${isRtl ? "lg:pt-6" : "lg:pt-6"}`}>
                      <p className={`text-caption font-medium ${mutedClassName}`}>
                        {step.number}
                      </p>
                      <h3 className={`mt-3 text-h3 leading-heading ${headingClassName}`}>
                        {t(`steps.${step.id}.label`)}
                      </h3>
                      <p className={`mt-4 max-w-md text-body-lg leading-body lg:max-w-none ${bodyClassName}`}>
                        {t(`steps.${step.id}.text`)}
                      </p>
                    </div>
                  </div>

                  {!isLast && (
                    <div className={`hidden h-px w-full lg:block ${dividerClassName}`} />
                  )}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: editorialEase,
      staggerChildren: 0.18,
      delayChildren: 0.08,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 26 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: index * 0.12,
      ease: editorialEase,
    },
  }),
};

function ReserveIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 7.5h7a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3V10.5a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 7.5V6.6a2.4 2.4 0 0 1 4.8 0v.9M8.5 10.5h7M9.5 14.5h2.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VerifyIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 8.5A2.5 2.5 0 0 1 9.5 6h5A2.5 2.5 0 0 1 17 8.5v3.6A2.5 2.5 0 0 1 14.5 14.5H12l-3 3v-3H9.5A2.5 2.5 0 0 1 7 12.1V8.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m10 10.3 1.1 1.2 2.9-3.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OwnIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 9.5h10l-1 9H8l-1-9Zm5-2.5a2.2 2.2 0 0 1 2.2 1.7H9.8A2.2 2.2 0 0 1 12 7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.8 9.5 9.5 6.8A2 2 0 0 1 11.4 5h1.2a2 2 0 0 1 1.9 1.8l.7 2.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
