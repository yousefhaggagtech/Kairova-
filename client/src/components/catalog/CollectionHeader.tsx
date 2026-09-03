"use client";

import { motion, MotionConfig } from "framer-motion";
import type { Variants } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

import type { Locale } from "@/src/i18n/config";

type CollectionGender = "men" | "women";

type CollectionHeaderProps = {
  gender: CollectionGender;
  locale: Locale;
};

type CollectionMedia = {
  imagePositionClassName: string;
  src: string;
};

const COLLECTION_MEDIA: Record<CollectionGender, CollectionMedia> = {
  men: {
    imagePositionClassName: "object-[62%_50%] sm:object-center",
    src: "https://ik.imagekit.io/1pscfy7oah/kiarova/men-header.png?tr=q-100",
  },
  women: {
    imagePositionClassName: "object-[34%_50%] sm:object-center",
    src: "https://ik.imagekit.io/1pscfy7oah/kiarova/women-header.png?tr=q-100",
  },
};

const editorialEase: [number, number, number, number] = [0.19, 1, 0.22, 1];

const headerRevealVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.24,
    },
  },
};

const backgroundRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 1,
  },
  visible: {
    opacity: 1,
    scale: 1.045,
    transition: {
      duration: 1.5,
      ease: editorialEase,
    },
  },
};

const copyRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 26,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: editorialEase,
    },
  },
};

export default function CollectionHeader({
  gender,
  locale,
}: CollectionHeaderProps) {
  const t = useTranslations("catalog.collectionHeader");
  const isRtl = locale === "ar";
  const media = COLLECTION_MEDIA[gender];
  const title = t(gender === "men" ? "men.title" : "women.title");
  const subtitle = t(gender === "men" ? "men.subtitle" : "women.subtitle");
  const imageAlt = t(gender === "men" ? "men.imageAlt" : "women.imageAlt");
  const headingId = `${gender}-collection-heading`;

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        animate="visible"
        aria-labelledby={headingId}
        className={`relative isolate flex min-h-[50svh] overflow-hidden bg-bg-primary px-4 py-16 text-fg-primary sm:px-6 md:min-h-[52svh] md:px-10 ${
          isRtl ? "font-body-ar" : "font-body-en"
        }`}
        data-section={`${gender}-collection-header`}
        initial="hidden"
        variants={headerRevealVariants}
      >
        <motion.div
          className="absolute inset-0 z-0"
          variants={backgroundRevealVariants}
        >
          <Image
            alt={imageAlt}
            className={`object-cover grayscale ${media.imagePositionClassName}`}
            fill
            priority
            quality={100}
            sizes="100vw"
            src={media.src}
          />
        </motion.div>

        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-bg-primary/45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(10,10,10,0.12)_0%,rgba(10,10,10,0.4)_54%,rgba(10,10,10,0.72)_100%)]"
        />

        <motion.div
          className="relative z-20 mx-auto flex w-full max-w-[var(--max-content)] flex-col items-center justify-center text-center"
          variants={headerRevealVariants}
        >
          <motion.div
            aria-hidden="true"
            className="mb-7 h-px w-20 bg-fg-primary/45"
            variants={copyRevealVariants}
          />
          <motion.h1
            className={`max-w-5xl text-4xl leading-display text-fg-primary sm:text-h1 lg:text-display ${
              isRtl ? "font-display-ar" : "font-display-en"
            }`}
            id={headingId}
            variants={copyRevealVariants}
          >
            {title}
          </motion.h1>
          <motion.p
            className={`mt-6 max-w-2xl text-body-lg leading-body text-border-light/90 ${
              isRtl ? "font-body-ar" : "font-body-en"
            }`}
            variants={copyRevealVariants}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </motion.section>
    </MotionConfig>
  );
}
