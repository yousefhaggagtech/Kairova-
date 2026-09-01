import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import type {
  ApiResponse,
  LocalizedString,
  Product,
  ProductImage,
} from "@/domain/entities/api";
import type { Locale } from "@/src/i18n/config";
import { locales } from "@/src/i18n/config";

import ProductDetailClient from "./_components/ProductDetailClient";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function isSupportedLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

function getLocalizedText(value: LocalizedString, locale: string) {
  const safeLocale = isSupportedLocale(locale) ? locale : "en";

  return value[safeLocale] || value.en || value.ar;
}

function getPrimaryImage(images: ProductImage[]) {
  return (
    images.find((image) => image.isPrimary) ||
    [...images].sort((firstImage, secondImage) => {
      return firstImage.order - secondImage.order;
    })[0]
  );
}

function getMetadataDescription(
  product: Product,
  locale: string,
  fallbackDescription: string,
) {
  const description =
    getLocalizedText(product.description, locale).trim() || fallbackDescription;

  return description.length > 160
    ? `${description.slice(0, 157).trim()}...`
    : description;
}

async function getProduct(slug: string, locale: string): Promise<Product | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const response = await fetch(
    `${baseUrl}/api/products/slug/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
    },
  ).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiResponse<{ product: Product }>;
  return payload.data?.product ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tSite = await getTranslations({ locale, namespace: "site" });
  const tProduct = await getTranslations({
    locale,
    namespace: "catalog.productDetail",
  });
  const product = await getProduct(slug, locale);

  if (!product) {
    return {
      title: `${tProduct("notFoundTitle")} | ${tSite("title")}`,
      description: tProduct("notFoundBody"),
      robots: {
        follow: false,
        index: false,
      },
    };
  }

  const productName = getLocalizedText(product.name, locale);
  const title = `${productName} | ${tSite("title")}`;
  const description = getMetadataDescription(
    product,
    locale,
    tProduct("metadataFallbackDescription"),
  );
  const primaryImage = getPrimaryImage(product.images);
  const openGraph = {
    title,
    description,
    type: "website" as const,
    ...(primaryImage?.url
      ? {
          images: [
            {
              url: primaryImage.url,
              alt: getLocalizedText(primaryImage.alt, locale) || productName,
            },
          ],
        }
      : {}),
  };

  return {
    title,
    description,
    openGraph,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProduct(slug, locale);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient initialProduct={product} slug={slug} />;
}
