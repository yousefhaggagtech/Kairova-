"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { useCartStore } from "@/application/store/cartStore";
import OptimizedProductImage from "@/components/media/OptimizedProductImage";
import type { Product, ProductImage } from "@/domain/entities/api";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";

function isProductImage(image: ProductImage): image is ProductImage {
  return typeof image === "object" && image !== null && "url" in image;
}

export default function ProductDetail({ product }: { product: Product }) {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("catalog");
  const tCheckout = useTranslations("checkout");
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const images = product.images.filter(isProductImage);
  const primaryImage = images.find((image) => image.isPrimary) || images[0];
  const productName = product.name[locale] || product.name.en;
  const inStock = product.stockQuantity > 0 && product.stockQuantity >= quantity;
  const addToCartButtonClass =
    "w-full border border-fg-secondary bg-fg-secondary py-4 text-bg-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:border-fg-primary dark:bg-fg-primary dark:text-bg-primary";

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: primaryImage?.url || null,
      slug: product.slug,
      stockQuantity: product.stockQuantity,
    });
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 pb-32 md:px-10">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="relative aspect-square bg-surface-light dark:bg-surface-dark">
          {primaryImage ? (
            <OptimizedProductImage
              src={primaryImage.url}
              alt={primaryImage.alt[locale] || productName}
              fill
              priority
              variant="detail"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-body text-fg-muted">
              {t("noImage")}
            </div>
          )}
        </div>

        <div>
          <h1 className="mb-4 text-h1 leading-heading">{productName}</h1>
          <p className="mb-6 text-h3 leading-heading">
            {product.price.toLocaleString(locale)} {t("egp")}
          </p>
          <p className="mb-6 whitespace-pre-line text-body leading-body text-fg-muted">
            {product.description[locale] || product.description.en}
          </p>
          <p className="mb-6 text-caption text-fg-muted">SKU: {product.sku}</p>

          <div className="mb-6">
            <label className="mb-2 block">{tCheckout("quantity")}</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="h-10 w-10 border border-border-light dark:border-border-subtle"
                aria-label={tCheckout("decreaseQuantity")}
              >
                -
              </button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.min(product.stockQuantity, value + 1),
                  )
                }
                disabled={product.stockQuantity === 0}
                className="h-10 w-10 border border-border-light disabled:opacity-50 dark:border-border-subtle"
                aria-label={tCheckout("increaseQuantity")}
              >
                +
              </button>
            </div>
            <p className="mt-2 text-caption text-fg-muted">
              {product.stockQuantity > 0
                ? `${t("inStock")} (${product.stockQuantity})`
                : t("outOfStock")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={addToCartButtonClass}
            data-testid="add-to-cart-button"
          >
            {tCheckout("addToCart")}
          </button>

          {showSuccess && (
            <div className="mt-4 bg-surface-light px-4 py-3 text-center text-body dark:bg-surface-dark">
              <p>{t("addedToCart")}</p>
              <Link href="/cart" className="mt-2 inline-block underline">
                {tCheckout("viewCart")}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border-light bg-bg-secondary p-4 dark:border-border-subtle dark:bg-bg-primary">
        <div className="mx-auto flex w-full max-w-[var(--max-content)] items-center gap-4">
          <div className="hidden flex-1 sm:block">
            <p className="text-body-lg font-medium">{productName}</p>
            <p className="text-caption text-fg-muted">
              {product.price.toLocaleString(locale)} {t("egp")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={addToCartButtonClass}
            data-testid="sticky-add-to-cart-button"
          >
            {tCheckout("addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
