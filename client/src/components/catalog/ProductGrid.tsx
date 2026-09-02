"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useCategories } from "@/application/hooks/useCategories";
import { useProducts } from "@/application/hooks/useProducts";
import type { Category, Product } from "@/domain/entities/api";
import type { Locale } from "@/src/i18n/config";

import {
  getCatalogCategoryValues,
  getCatalogSectionId,
  type CatalogCategoryValue,
} from "./CategoryFilterBar";
import ProductCard from "./ProductCard";

type CollectionProductGridProps = {
  gender: Product["gender"];
  isLoading?: never;
  products?: never;
};

type ControlledProductGridProps = {
  gender?: never;
  isLoading?: boolean;
  products: Product[];
};

type ProductGridProps = CollectionProductGridProps | ControlledProductGridProps;

type ProductGridContentProps = {
  isLoading?: boolean;
  products: Product[];
};

type ProductSection = {
  products: Product[];
  value: CatalogCategoryValue;
};

const skeletonCount = 6;
const luxuryEase: [number, number, number, number] = [0.19, 1, 0.22, 1];
const gridClassName =
  "grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 xl:gap-16";
const carouselItemClassName =
  "min-w-[min(82vw,21rem)] snap-start sm:min-w-[19rem] md:min-w-[20rem] xl:min-w-[22rem]";

function getParentCategoryId(parentCategory: Category["parentCategory"]) {
  if (!parentCategory) {
    return "";
  }

  return typeof parentCategory === "string"
    ? parentCategory
    : parentCategory._id;
}

function getRelationId(relation: Category | string | null | undefined) {
  if (!relation) {
    return "";
  }

  return typeof relation === "string" ? relation : relation._id;
}

function getRelationSlug(relation: Category | string | null | undefined) {
  if (!relation || typeof relation === "string") {
    return "";
  }

  return relation.slug;
}

function normalizeCategorySlug(slug: string, gender: Product["gender"]) {
  const genderPrefix = `${gender}-`;
  const slugWithoutGender = slug.startsWith(genderPrefix)
    ? slug.slice(genderPrefix.length)
    : slug;

  return slugWithoutGender === "perfumes" ? "perfume" : slugWithoutGender;
}

function getCategoryValue(category: Category, gender: Product["gender"]) {
  if (getParentCategoryId(category.parentCategory)) {
    return null;
  }

  const normalizedSlug = normalizeCategorySlug(category.slug, gender);
  const categoryValues = getCatalogCategoryValues(gender);

  return categoryValues.includes(normalizedSlug as CatalogCategoryValue)
    ? (normalizedSlug as CatalogCategoryValue)
    : null;
}

function getProductCategoryValue(
  product: Product,
  categories: Category[],
  gender: Product["gender"],
) {
  const populatedSlug = getRelationSlug(product.category);

  if (populatedSlug) {
    const normalizedSlug = normalizeCategorySlug(populatedSlug, gender);
    const categoryValues = getCatalogCategoryValues(gender);

    return categoryValues.includes(normalizedSlug as CatalogCategoryValue)
      ? (normalizedSlug as CatalogCategoryValue)
      : null;
  }

  const productCategoryId = getRelationId(product.category);
  const category = categories.find(
    (candidate) => candidate._id === productCategoryId,
  );

  return category ? getCategoryValue(category, gender) : null;
}

function buildProductSections(
  products: Product[],
  categories: Category[],
  gender: Product["gender"],
): ProductSection[] {
  return getCatalogCategoryValues(gender).map((value) => ({
    value,
    products: products.filter(
      (product) => getProductCategoryValue(product, categories, gender) === value,
    ),
  }));
}

function SkeletonBlock({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-surface-light dark:bg-surface-dark ${className}`}
    >
      <motion.div
        aria-hidden="true"
        animate={{ x: "320%" }}
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-bg-secondary/80 to-transparent dark:via-fg-primary/10"
        initial={{ x: "-140%" }}
        transition={{
          delay,
          duration: 1.7,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.25,
        }}
      />
    </div>
  );
}

export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  const shimmerDelay = (index % 4) * 0.08;

  return (
    <article aria-hidden="true" className="space-y-4">
      <SkeletonBlock className="aspect-[4/5] w-full" delay={shimmerDelay} />
      <div className="space-y-2">
        <SkeletonBlock className="h-5 w-2/3" delay={shimmerDelay + 0.08} />
        <SkeletonBlock className="h-4 w-24" delay={shimmerDelay + 0.14} />
      </div>
    </article>
  );
}

function ProductSectionsSkeleton({ gender }: { gender: Product["gender"] }) {
  return (
    <div
      className="scroll-mt-28 space-y-20 md:space-y-24"
      id={getCatalogSectionId(gender, "all")}
    >
      {getCatalogCategoryValues(gender)
        .slice(0, 3)
        .map((value, sectionIndex) => (
          <section
            className="scroll-mt-28"
            id={getCatalogSectionId(gender, value)}
            key={value}
          >
            <div className="mb-10 flex justify-center">
              <SkeletonBlock
                className="h-12 w-48"
                delay={sectionIndex * 0.08}
              />
            </div>
            <div className="flex gap-6 overflow-hidden px-10 md:gap-8 md:px-16">
              {Array.from({ length: 4 }, (_, index) => (
                <div className={carouselItemClassName} key={index}>
                  <ProductCardSkeleton index={index + sectionIndex} />
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

function ProductGridContent({
  isLoading = false,
  products,
}: ProductGridContentProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("catalog");
  const isRtl = locale === "ar";

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="product-grid-skeletons"
            animate={{ opacity: 1, y: 0 }}
            className={gridClassName}
            exit={{ opacity: 0, y: -14 }}
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.45, ease: luxuryEase }}
          >
            {Array.from({ length: skeletonCount }, (_, index) => (
              <ProductCardSkeleton key={index} index={index} />
            ))}
          </motion.div>
        ) : products.length === 0 ? (
          <motion.p
            key="product-grid-empty"
            animate={{ opacity: 1, y: 0 }}
            className={`py-20 text-center text-h3 leading-heading text-black/70 ${
              isRtl ? "font-display-ar" : "font-display-en"
            }`}
            exit={{ opacity: 0, y: -14 }}
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.55, ease: luxuryEase }}
          >
            {t("noPiecesFound")}
          </motion.p>
        ) : (
          <motion.div
            key="product-grid"
            animate={{ opacity: 1, y: 0 }}
            className={gridClassName}
            exit={{ opacity: 0, y: -14 }}
            initial={{ opacity: 0, y: 18 }}
            layout
            transition={{ duration: 0.5, ease: luxuryEase }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  initial={{ opacity: 0, y: 22 }}
                  layout
                  transition={{
                    duration: 0.55,
                    ease: luxuryEase,
                    delay: Math.min(index * 0.035, 0.18),
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

function ProductCarouselSection({
  gender,
  isRtl,
  products,
  sectionIndex,
  title,
  value,
}: {
  gender: Product["gender"];
  isRtl: boolean;
  products: Product[];
  sectionIndex: number;
  title: string;
  value: CatalogCategoryValue;
}) {
  const t = useTranslations("catalog");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollCarousel = (direction: "previous" | "next") => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const distance = Math.max(scroller.clientWidth * 0.82, 280);
    const offset = direction === "previous" ? -distance : distance;

    scroller.scrollBy({
      behavior: "smooth",
      left: offset,
    });
  };

  return (
    <motion.section
      className="scroll-mt-28"
      id={getCatalogSectionId(gender, value)}
      initial={{ opacity: 0, y: 26 }}
      layout
      transition={{
        duration: 0.7,
        ease: luxuryEase,
        delay: Math.min(sectionIndex * 0.06, 0.18),
      }}
      viewport={{ amount: 0.16, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mb-10 flex justify-center text-center">
        <h2
          className={`inline-flex max-w-full items-center justify-center gap-5 py-5 text-center text-h2 font-semibold leading-heading text-black/90 before:h-px before:w-20 before:shrink-0 before:bg-black/25 after:h-px after:w-20 after:shrink-0 after:bg-black/25 sm:gap-7 sm:py-6 sm:text-h1 sm:before:w-36 sm:after:w-36 lg:before:w-52 lg:after:w-52 ${
            isRtl ? "font-display-ar" : "font-display-en"
          }`}
        >
          {title}
        </h2>
      </div>

      {products.length === 0 ? (
        <p className="py-10 text-center text-body text-fg-muted">
          {t("noPiecesFound")}
        </p>
      ) : (
        <div className="relative px-10 md:px-16">
          <button
            aria-label={t("carouselPrevious", { category: title })}
            className="absolute top-[43%] left-0 z-20 inline-flex h-24 w-12 -translate-y-1/2 cursor-pointer items-center justify-center bg-transparent text-h1 leading-none text-black/35 transition-colors duration-300 hover:text-black focus-visible:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
            dir="ltr"
            onClick={() => scrollCarousel("previous")}
            type="button"
          >
            {"<"}
          </button>
          <button
            aria-label={t("carouselNext", { category: title })}
            className="absolute top-[43%] right-0 z-20 inline-flex h-24 w-12 -translate-y-1/2 cursor-pointer items-center justify-center bg-transparent text-h1 leading-none text-black/35 transition-colors duration-300 hover:text-black focus-visible:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
            dir="ltr"
            onClick={() => scrollCarousel("next")}
            type="button"
          >
            {">"}
          </button>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-10 z-10 w-12 bg-gradient-to-r from-bg-secondary to-transparent md:left-16"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-10 z-10 w-12 bg-gradient-to-l from-bg-secondary to-transparent md:right-16"
          />
          <div
            aria-label={t("productCarouselLabel", { category: title })}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-5 pt-2 [scrollbar-width:none] md:gap-8 [&::-webkit-scrollbar]:hidden"
            dir="ltr"
            ref={scrollerRef}
          >
            {products.map((product, index) => (
              <motion.div
                className={carouselItemClassName}
                dir={isRtl ? "rtl" : "ltr"}
                initial={{ opacity: 0, y: 24 }}
                key={product._id}
                transition={{
                  duration: 0.62,
                  ease: luxuryEase,
                  delay: Math.min(index * 0.04, 0.2),
                }}
                viewport={{ amount: 0.28, once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}

function CollectionProductSections({ gender }: { gender: Product["gender"] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("catalog");
  const isRtl = locale === "ar";
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories({ gender });
  const { data: products = [], isLoading: productsLoading } = useProducts({
    gender,
  });
  const sections = useMemo(
    () => buildProductSections(products, categories, gender),
    [categories, gender, products],
  );

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {categoriesLoading || productsLoading ? (
          <motion.div
            key="collection-products-skeletons"
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.45, ease: luxuryEase }}
          >
            <ProductSectionsSkeleton gender={gender} />
          </motion.div>
        ) : (
          <motion.div
            key="collection-products"
            animate={{ opacity: 1, y: 0 }}
            className="scroll-mt-28 space-y-20 md:space-y-24"
            exit={{ opacity: 0, y: -16 }}
            id={getCatalogSectionId(gender, "all")}
            initial={{ opacity: 0, y: 18 }}
            layout
            transition={{ duration: 0.55, ease: luxuryEase }}
          >
            {sections.map((section, sectionIndex) => (
              <ProductCarouselSection
                gender={gender}
                isRtl={isRtl}
                key={section.value}
                products={section.products}
                sectionIndex={sectionIndex}
                title={t(section.value)}
                value={section.value}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default function ProductGrid(props: ProductGridProps) {
  if ("products" in props) {
    return (
      <ProductGridContent
        isLoading={props.isLoading}
        products={props.products ?? []}
      />
    );
  }

  return <CollectionProductSections gender={props.gender} />;
}
