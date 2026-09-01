"use client";

import { motion, MotionConfig } from "framer-motion";
import type { FocusEvent } from "react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useCartStore } from "@/application/store/cartStore";
import OptimizedProductImage from "@/components/media/OptimizedProductImage";
import type { Product, ProductImage } from "@/domain/entities/api";
import type { Locale } from "@/src/i18n/config";
import { Link } from "@/src/i18n/navigation";

function isProductImage(image: ProductImage): image is ProductImage {
  return typeof image === "object" && image !== null && "url" in image;
}

const luxuryEase: [number, number, number, number] = [0.19, 1, 0.22, 1];

const cardVariants = {
  rest: {
    scale: 1,
  },
  active: {
    scale: 1.02,
    transition: {
      duration: 0.7,
      ease: luxuryEase,
    },
  },
};

const primaryImageVariants = {
  rest: {
    opacity: 1,
    scale: 1,
  },
  active: (hasSecondaryImage: boolean) => ({
    opacity: hasSecondaryImage ? 0 : 1,
    scale: hasSecondaryImage ? 1.015 : 1.035,
    transition: {
      duration: 0.82,
      ease: luxuryEase,
    },
  }),
};

const secondaryImageVariants = {
  rest: {
    opacity: 0,
    scale: 1.025,
    y: 10,
  },
  active: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.82,
      ease: luxuryEase,
    },
  },
};

const ctaRevealVariants = {
  rest: {
    opacity: 0,
    y: 18,
  },
  active: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.56,
      ease: luxuryEase,
      delay: 0.04,
    },
  },
};

const imageVeilVariants = {
  rest: {
    opacity: 0,
  },
  active: {
    opacity: 1,
    transition: {
      duration: 0.56,
      ease: luxuryEase,
    },
  },
};

function getProductImages(product: Product) {
  return [...product.images]
    .filter(isProductImage)
    .sort((firstImage, secondImage) => firstImage.order - secondImage.order);
}

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const tCatalog = useTranslations("catalog");
  const tCheckout = useTranslations("checkout");
  const addItem = useCartStore((state) => state.addItem);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [hasJustAdded, setHasJustAdded] = useState(false);

  const isActive = isHovered || isFocusedWithin;
  const isRtl = locale === "ar";
  const images = getProductImages(product);
  const primaryImage = images.find((image) => image.isPrimary) || images[0];
  const secondaryImage = images.find(
    (image) => image._id !== primaryImage?._id,
  );
  const productName = product.name[locale] || product.name.en;
  const formattedPrice = new Intl.NumberFormat(
    locale === "ar" ? "ar-EG" : "en-EG",
    {
      maximumFractionDigits: 0,
    },
  ).format(product.price);
  const price = isRtl
    ? `${formattedPrice} ${tCatalog("egp")}`
    : `${tCatalog("egp")} ${formattedPrice}`;
  const inStock = product.stockQuantity > 0;

  useEffect(() => {
    if (!hasJustAdded) {
      return;
    }

    const timeoutId = window.setTimeout(() => setHasJustAdded(false), 1800);

    return () => window.clearTimeout(timeoutId);
  }, [hasJustAdded]);

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      !(nextFocusedElement instanceof Node) ||
      !event.currentTarget.contains(nextFocusedElement)
    ) {
      setIsFocusedWithin(false);
    }
  };

  const handleAddToCart = () => {
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
    setHasJustAdded(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.article
        animate={isActive ? "active" : "rest"}
        className={`relative isolate origin-center ${
          isRtl ? "font-body-ar" : "font-body-en"
        }`}
        initial="rest"
        onBlurCapture={handleBlurCapture}
        onFocusCapture={() => setIsFocusedWithin(true)}
        onHoverEnd={() => setIsHovered(false)}
        onHoverStart={() => setIsHovered(true)}
        variants={cardVariants}
      >
        <div className="relative mb-4 overflow-hidden">
          <Link
            href={`/product/${product.slug}`}
            className="block cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-light dark:bg-surface-dark">
              {primaryImage ? (
                <>
                  <motion.div
                    className="absolute inset-0"
                    custom={Boolean(secondaryImage)}
                    variants={primaryImageVariants}
                  >
                    <OptimizedProductImage
                      src={primaryImage.url}
                      alt={primaryImage.alt[locale] || productName}
                      fill
                      variant="card"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </motion.div>

                  {secondaryImage ? (
                    <motion.div
                      className="absolute inset-0"
                      variants={secondaryImageVariants}
                    >
                      <OptimizedProductImage
                        src={secondaryImage.url}
                        alt={secondaryImage.alt[locale] || productName}
                        fill
                        variant="card"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
                    </motion.div>
                  ) : null}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center px-4 text-center text-caption text-fg-muted">
                  {tCatalog("noImage")}
                </div>
              )}

              <motion.div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-bg-primary/62 via-bg-primary/24 to-transparent"
                variants={imageVeilVariants}
              />
            </div>
          </Link>

          <motion.div
            className={`absolute inset-x-0 bottom-0 z-20 px-3 pb-3 sm:px-4 sm:pb-4 ${
              isActive ? "pointer-events-auto" : "pointer-events-none"
            }`}
            variants={ctaRevealVariants}
          >
            <motion.button
              type="button"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="w-full cursor-pointer border border-fg-primary/75 bg-transparent px-4 py-3 text-center text-caption font-medium text-fg-primary backdrop-blur-[2px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-primary disabled:cursor-not-allowed disabled:opacity-65"
              transition={{ duration: 0.42, ease: luxuryEase }}
              whileFocus={
                inStock
                  ? {
                      backgroundColor: "var(--color-fg-primary)",
                      borderColor: "var(--color-fg-primary)",
                      color: "var(--color-fg-secondary)",
                    }
                  : undefined
              }
              whileHover={
                inStock
                  ? {
                      backgroundColor: "var(--color-fg-primary)",
                      borderColor: "var(--color-fg-primary)",
                      color: "var(--color-fg-secondary)",
                    }
                  : undefined
              }
            >
              {inStock
                ? hasJustAdded
                  ? tCatalog("addedToCart")
                  : tCheckout("addToCart")
                : tCatalog("outOfStock")}
            </motion.button>
          </motion.div>
        </div>

        <div className="text-start">
          <h3
            className={`text-body-lg font-medium leading-heading tracking-normal text-fg-secondary dark:text-fg-primary ${
              isRtl ? "font-display-ar" : "font-display-en"
            }`}
          >
            <Link
              href={`/product/${product.slug}`}
              className="cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary"
            >
              {productName}
            </Link>
          </h3>
          <p
            className={`mt-1 text-caption font-medium leading-body text-fg-muted ${
              isRtl ? "font-body-ar" : "font-body-en"
            }`}
          >
            {price}
          </p>
        </div>
      </motion.article>
    </MotionConfig>
  );
}
