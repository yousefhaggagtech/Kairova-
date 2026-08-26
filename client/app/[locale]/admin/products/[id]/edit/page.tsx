"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { useAdminProduct } from "@/application/hooks/useAdminProducts";
import ProductForm from "@/components/admin/ProductForm";

function getId(idParam: string | string[] | undefined) {
  return Array.isArray(idParam) ? idParam[0] : idParam || "";
}

export default function EditProductPage() {
  const params = useParams();
  const productId = getId(params.id);
  const t = useTranslations("admin");
  const { data: product, isError, isLoading } = useAdminProduct(productId);

  if (isLoading) {
    return <p className="py-8 text-body text-fg-muted">{t("loading")}</p>;
  }

  if (isError || !product) {
    return (
      <p className="py-8 text-body text-fg-muted">{t("productNotFound")}</p>
    );
  }

  return <ProductForm mode="edit" product={product} />;
}
