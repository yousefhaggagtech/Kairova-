"use client";

import { motion, MotionConfig } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { PointerEvent } from "react";
import { useMemo, useState } from "react";

import { useProduct, useProducts } from "@/application/hooks/useProducts";
import { useCartStore } from "@/application/store/cartStore";
import OptimizedProductImage from "@/components/media/OptimizedProductImage";
import type {
  Category,
  LocalizedString,
  Product,
  ProductImage,
} from "@/domain/entities/api";
import type { Locale } from "@/src/i18n/config";
import { Link, useRouter } from "@/src/i18n/navigation";

import ProductDetailSkeleton from "./ProductDetailSkeleton";

type ProductDetailClientProps = {
  initialProduct: Product;
  slug: string;
};

type SpecRow = {
  label: string;
  value: string;
};

const DEPOSIT_PERCENTAGE = 50;
const DEPOSIT_RATE = DEPOSIT_PERCENTAGE / 100;
const luxuryEase: [number, number, number, number] = [0.19, 1, 0.22, 1];

function isProductImage(image: ProductImage): image is ProductImage {
  return typeof image === "object" && image !== null && "url" in image;
}

function getLocalizedText(value: LocalizedString, locale: Locale) {
  return value[locale] || value.en || value.ar;
}

function getRelationName(
  relation: Category | string | null | undefined,
  locale: Locale,
) {
  if (!relation || typeof relation === "string") {
    return "";
  }

  return getLocalizedText(relation.name, locale);
}

function getRelationId(relation: Category | string | null | undefined) {
  if (!relation) {
    return "";
  }

  return typeof relation === "string" ? relation : relation._id;
}

function getProductImages(product: Product) {
  return [...product.images].filter(isProductImage).sort((first, second) => {
    if (first.isPrimary !== second.isPrimary) {
      return first.isPrimary ? -1 : 1;
    }

    return first.order - second.order;
  });
}

function hasFraction(value: number) {
  return Math.round(value) !== value;
}

function getNumberLocale(locale: Locale) {
  return locale === "ar" ? "ar-EG" : "en-EG";
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(getNumberLocale(locale), {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrency(value: number, locale: Locale, currencyLabel: string) {
  const fractionDigits = hasFraction(value) ? 2 : 0;
  const formattedValue = new Intl.NumberFormat(getNumberLocale(locale), {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);

  return locale === "ar"
    ? `${formattedValue} ${currencyLabel}`
    : `${currencyLabel} ${formattedValue}`;
}

function getGalleryFrameClassName(index: number) {
  if (index === 0) {
    return "aspect-[4/5] md:col-span-2 lg:aspect-[6/7] lg:min-h-[72svh]";
  }

  if (index % 3 === 0) {
    return "aspect-[16/11] md:col-span-2";
  }

  return "aspect-[4/5]";
}

function ZoomableGalleryImage({
  className,
  image,
  index,
  locale,
  productName,
}: {
  className: string;
  image: ProductImage;
  index: number;
  locale: Locale;
  productName: string;
}) {
  const t = useTranslations("catalog.productDetail");
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");
  const imageNumber = formatNumber(index + 1, locale);
  const imageAlt = getLocalizedText(image.alt, locale) || productName;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setTransformOrigin(`${x}% ${y}%`);
  }

  return (
    <motion.figure
      aria-label={t("imageLabel", {
        product: productName,
        number: imageNumber,
      })}
      className={`group relative overflow-hidden bg-surface-dark ${className}`}
      initial={{ opacity: 0, scale: 0.985, y: 24 }}
      transition={{
        duration: 0.82,
        ease: luxuryEase,
        delay: Math.min(index * 0.08, 0.24),
      }}
      viewport={{ amount: 0.18, once: true }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
    >
      <div
        className="absolute inset-0"
        onPointerLeave={() => setTransformOrigin("50% 50%")}
        onPointerMove={handlePointerMove}
      >
        <OptimizedProductImage
          src={image.url}
          alt={imageAlt}
          fill
          priority={index === 0}
          variant="detail"
          sizes={
            index === 0 || index % 3 === 0
              ? "(max-width: 1024px) 100vw, 60vw"
              : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
          }
          className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.12]"
          style={{ transformOrigin }}
        />
      </div>
    </motion.figure>
  );
}

function EmptyGalleryFrame({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <motion.div
      className={`flex items-center justify-center bg-surface-dark px-6 text-center text-caption text-fg-muted ${className}`}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.6, ease: luxuryEase }}
      viewport={{ amount: 0.2, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {label}
    </motion.div>
  );
}

function SuggestionCardSkeleton() {
  return (
    <div aria-hidden="true" className="min-w-0 space-y-4">
      <div className="aspect-[4/5] animate-pulse bg-surface-dark" />
      <div className="h-4 w-4/5 animate-pulse bg-surface-dark" />
      <div className="h-3 w-24 animate-pulse bg-surface-dark" />
    </div>
  );
}

function SuggestionCard({
  currencyLabel,
  locale,
  product,
}: {
  currencyLabel: string;
  locale: Locale;
  product: Product;
}) {
  const t = useTranslations("catalog.productDetail");
  const tCatalog = useTranslations("catalog");
  const images = getProductImages(product);
  const primaryImage = images[0];
  const productName = getLocalizedText(product.name, locale);

  return (
    <motion.article
      className="min-w-0"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.58, ease: luxuryEase }}
      viewport={{ amount: 0.24, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <Link
        aria-label={t("suggestionCardLabel", { product: productName })}
        className="group block cursor-pointer text-start focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-primary"
        href={`/product/${product.slug}`}
      >
        <span className="relative block aspect-[4/5] overflow-hidden bg-surface-dark">
          {primaryImage ? (
            <OptimizedProductImage
              alt={getLocalizedText(primaryImage.alt, locale) || productName}
              className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.06] group-hover:opacity-100"
              fill
              sizes="(max-width: 768px) 58vw, (max-width: 1024px) 32vw, 18vw"
              src={primaryImage.url}
              variant="card"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-4 text-center text-caption text-fg-muted">
              {tCatalog("noImage")}
            </span>
          )}
        </span>
        <span className="mt-4 block">
          <span className="block break-words text-body-lg leading-heading text-fg-primary">
            {productName}
          </span>
          <span className="mt-2 block text-caption font-medium text-fg-muted">
            {formatCurrency(product.price, locale, currencyLabel)}
          </span>
        </span>
      </Link>
    </motion.article>
  );
}

function SameCategorySuggestions({
  currencyLabel,
  currentProduct,
  isRtl,
  locale,
}: {
  currencyLabel: string;
  currentProduct: Product;
  isRtl: boolean;
  locale: Locale;
}) {
  const t = useTranslations("catalog.productDetail");
  const categoryId = getRelationId(currentProduct.category);
  const { data: products = [], isLoading } = useProducts(
    categoryId ? { categoryId } : undefined,
    { enabled: Boolean(categoryId) },
  );
  const suggestions = products
    .filter((product) => product._id !== currentProduct._id)
    .slice(0, 4);

  if (!categoryId) {
    return null;
  }

  return (
    <section
      aria-labelledby="same-category-suggestions-heading"
      className="border-t border-border-subtle bg-bg-absolute px-4 py-16 text-fg-primary md:px-10 md:py-24"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-[var(--max-content)]">
        <motion.div
          className="flex flex-col gap-4 text-start md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 22 }}
          transition={{ duration: 0.7, ease: luxuryEase }}
          viewport={{ amount: 0.3, once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="text-caption font-medium uppercase tracking-normal text-fg-muted">
              {t("suggestionsEyebrow")}
            </p>
            <h2
              className={`mt-5 max-w-3xl break-words text-h2 leading-heading text-fg-primary ${
                isRtl ? "font-display-ar" : "font-display-en"
              }`}
              id="same-category-suggestions-heading"
            >
              {t("suggestionsTitle")}
            </h2>
          </div>
          <div
            aria-hidden="true"
            className="hidden h-px flex-1 bg-border-subtle md:block"
          />
        </motion.div>

        <div className="mt-10 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-5 md:mt-12 md:grid-cols-4 md:gap-7">
          {isLoading ? (
            Array.from({ length: 4 }, (_, index) => (
              <SuggestionCardSkeleton key={index} />
            ))
          ) : suggestions.length > 0 ? (
            suggestions.map((product) => (
              <SuggestionCard
                currencyLabel={currencyLabel}
                key={product._id}
                locale={locale}
                product={product}
              />
            ))
          ) : (
            <p className="col-span-full max-w-2xl text-body-lg leading-body text-fg-muted">
              {t("suggestionsEmpty")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function SpecificationRows({ rows }: { rows: SpecRow[] }) {
  return (
    <dl className="mt-8 border-b border-border-subtle">
      {rows.map((row) => (
        <div
          className="grid gap-2 border-t border-border-subtle py-5 text-start sm:grid-cols-[11rem_1fr]"
          key={row.label}
        >
          <dt className="break-words text-caption font-medium uppercase tracking-normal text-fg-muted">
            {row.label}
          </dt>
          <dd className="break-words text-body leading-body text-fg-primary">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ProductDetailClient({
  initialProduct,
  slug,
}: ProductDetailClientProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const tCatalog = useTranslations("catalog");
  const t = useTranslations("catalog.productDetail");
  const addItem = useCartStore((state) => state.addItem);
  const { data: queriedProduct, isError, isLoading } = useProduct(slug, {
    initialData: initialProduct,
  });
  const product = queriedProduct ?? initialProduct;
  const isRtl = locale === "ar";
  const images = useMemo(() => getProductImages(product), [product]);
  const primaryImage = images[0];
  const productName = getLocalizedText(product.name, locale);
  const productDescription = getLocalizedText(product.description, locale);
  const currencyLabel = tCatalog("egp");
  const totalPrice = product.price;
  const depositAmount = totalPrice * DEPOSIT_RATE;
  const remainingBalance = totalPrice - depositAmount;
  const depositPercentage = `${formatNumber(DEPOSIT_PERCENTAGE, locale)}%`;
  const formattedPrice = formatCurrency(totalPrice, locale, currencyLabel);
  const inStock = product.stockQuantity > 0;
  const categoryName = getRelationName(product.category, locale);
  const subcategoryName = getRelationName(product.subcategory, locale);
  const collectionName =
    product.gender === "men"
      ? tCatalog("menCollection")
      : tCatalog("womenCollection");
  const specRows = [
    {
      label: t("specs.sku"),
      value: product.sku,
    },
    {
      label: t("specs.collection"),
      value: collectionName,
    },
    {
      label: t("specs.category"),
      value: categoryName || t("notSpecified"),
    },
    {
      label: t("specs.subcategory"),
      value: subcategoryName || t("notSpecified"),
    },
    {
      label: t("specs.availability"),
      value: inStock
        ? t("specs.stockCount", {
            count: formatNumber(product.stockQuantity, locale),
          })
        : tCatalog("outOfStock"),
    },
  ];

  function handleReserve() {
    if (!inStock) {
      return;
    }

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: primaryImage?.url || null,
      slug: product.slug,
      stockQuantity: product.stockQuantity,
    });
    router.push("/cart");
  }

  if (isLoading && !queriedProduct) {
    return <ProductDetailSkeleton />;
  }

  if (isError && !queriedProduct) {
    return (
      <section className="bg-bg-absolute px-4 py-20 text-start text-fg-primary md:px-10">
        <div className="mx-auto w-full max-w-[var(--max-content)]">
          <p className="text-caption font-medium uppercase tracking-normal text-fg-muted">
            {t("notFoundEyebrow")}
          </p>
          <h1 className="mt-5 break-words text-h2 leading-heading text-fg-primary">
            {t("notFoundTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-body-lg leading-body text-fg-muted">
            {t("notFoundBody")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`bg-bg-absolute text-fg-primary ${
          isRtl ? "font-body-ar" : "font-body-en"
        }`}
      >
        <section className="mx-auto grid w-full max-w-[var(--max-content)] gap-10 px-4 py-10 md:px-10 md:py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.72fr)] lg:items-start lg:gap-16 lg:py-20">
          <div
            aria-label={t("galleryLabel", { product: productName })}
            className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-8"
            role="group"
          >
            {images.length > 0 ? (
              images.map((image, index) => (
                <ZoomableGalleryImage
                  className={getGalleryFrameClassName(index)}
                  image={image}
                  index={index}
                  key={image._id}
                  locale={locale}
                  productName={productName}
                />
              ))
            ) : (
              <EmptyGalleryFrame
                className="aspect-[4/5] md:col-span-2 lg:aspect-[6/7] lg:min-h-[72svh]"
                label={tCatalog("noImage")}
              />
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border-subtle pt-8 text-start lg:border-t-0 lg:pt-0"
              initial={{ opacity: 0, y: 22 }}
              transition={{ duration: 0.72, ease: luxuryEase, delay: 0.08 }}
            >
              <p className="text-caption font-medium uppercase tracking-normal text-fg-muted">
                {collectionName}
              </p>
              <h1
                className={`mt-5 break-words text-h2 leading-heading text-fg-primary sm:text-h1 ${
                  isRtl ? "font-display-ar" : "font-display-en"
                }`}
              >
                {productName}
              </h1>
              <p
                className={`mt-5 text-h3 leading-heading text-fg-primary ${
                  isRtl ? "font-body-ar" : "font-body-en"
                }`}
              >
                {formattedPrice}
              </p>
              <p className="mt-5 text-caption font-medium text-fg-muted">
                {inStock ? tCatalog("inStock") : tCatalog("outOfStock")}
              </p>

              <div className="mt-8 border border-border-subtle bg-surface-dark/35 p-5 md:p-6">
                <p className="mb-5 text-caption font-medium uppercase tracking-normal text-fg-muted">
                  {t("paymentBreakdown")}
                </p>
                <dl className="space-y-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                    <dt className="min-w-0 text-body text-fg-muted">
                      {t("totalPrice")}
                    </dt>
                    <dd className="text-end text-body font-medium">
                      {formatCurrency(totalPrice, locale, currencyLabel)}
                    </dd>
                  </div>
                  <div className="border-y border-border-subtle py-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                      <dt className="min-w-0 text-body font-semibold text-fg-primary">
                        {t("depositDue", {
                          percentage: depositPercentage,
                        })}
                      </dt>
                      <dd className="text-end text-body-lg font-semibold text-fg-primary">
                        {formatCurrency(depositAmount, locale, currencyLabel)}
                      </dd>
                    </div>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4">
                    <dt className="min-w-0 text-body text-fg-muted">
                      {t("remainingBalance")}
                    </dt>
                    <dd className="text-end text-body font-medium">
                      {formatCurrency(remainingBalance, locale, currencyLabel)}
                    </dd>
                  </div>
                </dl>
              </div>

              <button
                className="mt-7 w-full cursor-pointer border border-fg-primary bg-fg-primary px-6 py-4 text-center text-body font-semibold text-bg-absolute transition-colors hover:bg-transparent hover:text-fg-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-primary disabled:cursor-not-allowed disabled:border-fg-muted disabled:bg-fg-muted disabled:text-bg-absolute"
                data-testid="reserve-piece-button"
                disabled={!inStock}
                onClick={handleReserve}
                type="button"
              >
                {inStock ? t("reserveThisPiece") : tCatalog("outOfStock")}
              </button>
            </motion.div>
          </aside>
        </section>

        <section className="mx-auto w-full max-w-[var(--max-content)] border-t border-border-subtle px-4 py-16 md:px-10 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.article
              className="text-start"
              initial={{ opacity: 0, y: 26 }}
              transition={{ duration: 0.78, ease: luxuryEase }}
              viewport={{ amount: 0.22, once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <p className="text-caption font-medium uppercase tracking-normal text-fg-muted">
                {t("storyEyebrow")}
              </p>
              <h2
                className={`mt-5 break-words text-h2 leading-heading text-fg-primary ${
                  isRtl ? "font-display-ar" : "font-display-en"
                }`}
              >
                {t("storyTitle")}
              </h2>
              <div
                aria-hidden="true"
                className="mt-8 h-px w-20 bg-border-subtle"
              />
              <p className="mt-8 whitespace-pre-line text-body-lg leading-body text-fg-muted">
                {productDescription}
              </p>
            </motion.article>

            <motion.article
              className="text-start"
              initial={{ opacity: 0, y: 26 }}
              transition={{ duration: 0.78, ease: luxuryEase, delay: 0.08 }}
              viewport={{ amount: 0.22, once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <p className="text-caption font-medium uppercase tracking-normal text-fg-muted">
                {t("specsEyebrow")}
              </p>
              <h2
                className={`mt-5 break-words text-h2 leading-heading text-fg-primary ${
                  isRtl ? "font-display-ar" : "font-display-en"
                }`}
              >
                {t("specsTitle")}
              </h2>
              <SpecificationRows rows={specRows} />
            </motion.article>
          </div>
        </section>

        <SameCategorySuggestions
          currencyLabel={currencyLabel}
          currentProduct={product}
          isRtl={isRtl}
          locale={locale}
        />
      </div>
    </MotionConfig>
  );
}
