"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { Product, ProductImage } from "@/domain/entities/api";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";

function isProductImage(image: ProductImage): image is ProductImage {
  return typeof image === "object" && image !== null && "url" in image;
}

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("catalog");
  const images = product.images.filter(isProductImage);
  const primaryImage = images.find((image) => image.isPrimary) || images[0];
  const productName = product.name[locale] || product.name.en;

  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <div className="relative mb-3 aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt[locale] || productName}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-caption text-fg-muted">
            {t("noImage")}
          </div>
        )}
      </div>
      <h3 className="text-body-lg font-medium">{productName}</h3>
      <p className="mt-1 text-body text-fg-muted">
        {t("price")}: {product.price.toLocaleString(locale)} {t("egp")}
      </p>
      <p className="mt-1 text-caption text-fg-muted">
        {product.stockQuantity > 0 ? t("inStock") : t("outOfStock")}
      </p>
    </Link>
  );
}

