import { getTranslations } from "next-intl/server";

import ProductDetail from "@/components/catalog/ProductDetail";
import type { ApiResponse, Product } from "@/domain/entities/api";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getProduct(slug: string, locale: string): Promise<Product | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const response = await fetch(`${baseUrl}/api/products/slug/${slug}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiResponse<{ product: Product }>;
  return payload.data?.product ?? null;
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProduct(slug, locale);

  if (!product) {
    const t = await getTranslations({ locale, namespace: "catalog" });

    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {t("productNotFound")}
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
