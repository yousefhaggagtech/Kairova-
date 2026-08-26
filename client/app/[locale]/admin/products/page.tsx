"use client";

import type { AxiosError } from "axios";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import {
  useAdminProducts,
  useDeleteProduct,
} from "@/application/hooks/useAdminProducts";
import type {
  Category,
  Product,
  ProductImage,
} from "@/domain/entities/api";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";
type GenderFilter = "men" | "women" | "";
type ErrorResponse = {
  message?: string;
};

function isProductImage(image: Product["images"][number]): image is ProductImage {
  return typeof image === "object" && image !== null && "url" in image;
}

function getCategoryName(
  relation: Category | string | null,
  locale: SupportedLocale,
) {
  if (!relation || typeof relation === "string") {
    return "-";
  }

  return relation.name[locale] || relation.name.en;
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;

  return axiosError.response?.data?.message || fallback;
}

function getPrimaryImage(product: Product) {
  const images = product.images.filter(isProductImage);

  return images.find((image) => image.isPrimary) || images[0];
}

export default function AdminProductsPage() {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("admin");
  const tCatalog = useTranslations("catalog");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("");
  const [actionError, setActionError] = useState("");
  const filters = useMemo(
    () => (genderFilter ? { gender: genderFilter } : undefined),
    [genderFilter],
  );
  const { data: products = [], isError, isLoading } = useAdminProducts(filters);
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`${t("confirmDelete")} ${product.name.en}`)) {
      return;
    }

    setActionError("");

    try {
      await deleteProduct.mutateAsync(product._id);
    } catch (error) {
      setActionError(getErrorMessage(error, t("deleteFailed")));
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-h2 leading-heading">{t("products")}</h2>
          <p className="mt-2 text-body text-fg-muted">
            {products.length.toLocaleString(locale)} {t("products")}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="border border-fg-secondary bg-fg-secondary px-4 py-3 text-center text-bg-secondary dark:border-fg-primary dark:bg-fg-primary dark:text-bg-primary"
        >
          {t("addProduct")}
        </Link>
      </div>

      <div className="mb-6 max-w-xs">
        <label className="mb-2 block text-caption" htmlFor="gender-filter">
          {t("gender")}
        </label>
        <select
          id="gender-filter"
          value={genderFilter}
          onChange={(event) => setGenderFilter(event.target.value as GenderFilter)}
          className="w-full border border-border-light bg-bg-secondary px-3 py-2 dark:border-border-subtle dark:bg-bg-primary"
        >
          <option value="">{t("allGenders")}</option>
          <option value="men">{t("men")}</option>
          <option value="women">{t("women")}</option>
        </select>
      </div>

      {actionError && (
        <p className="mb-4 text-body text-red-600">{actionError}</p>
      )}

      {isLoading && (
        <p className="py-8 text-body text-fg-muted">{t("loading")}</p>
      )}

      {isError && (
        <p className="py-8 text-body text-red-600">{t("loadProductsFailed")}</p>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <p className="py-8 text-body text-fg-muted">{t("noProducts")}</p>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="overflow-x-auto border border-border-light dark:border-border-subtle">
          <table className="w-full min-w-[900px] border-collapse text-body">
            <thead className="bg-surface-light text-caption uppercase text-fg-muted dark:bg-surface-dark">
              <tr>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("images")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("nameEn")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("sku")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("price")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("stock")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("category")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("gender")}
                </th>
                <th className="border-b border-border-light px-4 py-3 text-start dark:border-border-subtle">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const primaryImage = getPrimaryImage(product);

                return (
                  <tr
                    key={product._id}
                    className="border-b border-border-light last:border-b-0 dark:border-border-subtle"
                  >
                    <td className="px-4 py-4">
                      <div className="relative h-16 w-16 bg-surface-light dark:bg-surface-dark">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={
                              primaryImage.alt[locale] ||
                              primaryImage.alt.en ||
                              product.name.en
                            }
                            fill
                            unoptimized
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-caption text-fg-muted">
                            {tCatalog("noImage")}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p>{product.name.en}</p>
                      <p className="text-caption text-fg-muted" dir="rtl">
                        {product.name.ar}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-mono text-caption">
                      {product.sku}
                    </td>
                    <td className="px-4 py-4">
                      {product.price.toLocaleString(locale)} {tCatalog("egp")}
                    </td>
                    <td className="px-4 py-4">{product.stockQuantity}</td>
                    <td className="px-4 py-4">
                      {getCategoryName(product.category, locale)}
                    </td>
                    <td className="px-4 py-4">{t(product.gender)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="underline"
                        >
                          {t("edit")}
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleDelete(product)}
                          disabled={deleteProduct.isPending}
                          className="text-red-700 underline disabled:opacity-50 dark:text-red-300"
                        >
                          {t("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
