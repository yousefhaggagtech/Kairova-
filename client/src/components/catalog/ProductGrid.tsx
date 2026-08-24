"use client";

import { useTranslations } from "next-intl";

import type { Product } from "@/domain/entities/api";

import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  const t = useTranslations("catalog");

  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-body text-fg-muted">
        {t("noProducts")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
