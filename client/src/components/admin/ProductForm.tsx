"use client";

import type { AxiosError } from "axios";
import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  useAddProductImage,
  useCreateProduct,
  useRemoveProductImage,
  useSetPrimaryProductImage,
  useUpdateProduct,
} from "@/application/hooks/useAdminProducts";
import { useCategories } from "@/application/hooks/useCategories";
import { useImageUpload } from "@/application/hooks/useImageUpload";
import OptimizedProductImage from "@/components/media/OptimizedProductImage";
import type {
  Category,
  LocalizedString,
  Product,
  ProductImage,
} from "@/domain/entities/api";
import { Link, useRouter } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";
type ProductGender = "men" | "women";
type ErrorResponse = {
  message?: string;
};

type UploadedImage = {
  fileName: string;
  url: string;
  publicId: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product;
};

function isProductImage(image: Product["images"][number]): image is ProductImage {
  return typeof image === "object" && image !== null && "url" in image;
}

function getRelationId(relation: Category | string | null) {
  if (!relation) {
    return "";
  }

  return typeof relation === "string" ? relation : relation._id;
}

function getParentCategoryId(category: Category) {
  return getRelationId(category.parentCategory);
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;

  return axiosError.response?.data?.message || fallback;
}

function getCategoryName(category: Category, locale: SupportedLocale) {
  return category.name[locale] || category.name.en;
}

export default function ProductForm({ mode, product }: ProductFormProps) {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const t = useTranslations("admin");
  const [name, setName] = useState<LocalizedString>(() => ({
    ar: product?.name.ar || "",
    en: product?.name.en || "",
  }));
  const [description, setDescription] = useState<LocalizedString>(() => ({
    ar: product?.description.ar || "",
    en: product?.description.en || "",
  }));
  const [gender, setGender] = useState<ProductGender>(
    () => product?.gender ?? "men",
  );
  const [categoryId, setCategoryId] = useState(() =>
    product ? getRelationId(product.category) : "",
  );
  const [subcategoryId, setSubcategoryId] = useState(() =>
    product ? getRelationId(product.subcategory) : "",
  );
  const [price, setPrice] = useState(() =>
    product ? String(product.price) : "",
  );
  const [stockQuantity, setStockQuantity] = useState(() =>
    product ? String(product.stockQuantity) : "",
  );
  const [newImages, setNewImages] = useState<UploadedImage[]>([]);
  const [formError, setFormError] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useCategories({
    gender,
  });
  const { upload, uploading, error: uploadError } = useImageUpload();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const addProductImage = useAddProductImage();
  const removeProductImage = useRemoveProductImage();
  const setPrimaryProductImage = useSetPrimaryProductImage();

  const existingImages = useMemo(
    () => product?.images.filter(isProductImage) ?? [],
    [product],
  );
  const parentCategories = useMemo(
    () => categories.filter((category) => !getParentCategoryId(category)),
    [categories],
  );
  const subcategories = useMemo(
    () =>
      categories.filter(
        (category) => getParentCategoryId(category) === categoryId,
      ),
    [categories, categoryId],
  );

  const saving =
    createProduct.isPending ||
    updateProduct.isPending ||
    addProductImage.isPending;
  const imageActionPending =
    removeProductImage.isPending || setPrimaryProductImage.isPending;
  const pageTitle =
    mode === "create" ? t("newProduct") : t("editProduct");
  const submitLabel =
    mode === "create" ? t("createProduct") : t("updateProduct");

  const handleGenderChange = (nextGender: ProductGender) => {
    setGender(nextGender);
    setCategoryId("");
    setSubcategoryId("");
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setFormError("");

    for (const file of files) {
      const result = await upload(file);

      if (result) {
        setNewImages((images) => [
          ...images,
          {
            fileName: file.name,
            url: result.url,
            publicId: result.publicId,
          },
        ]);
      }
    }

    event.target.value = "";
  };

  const removeNewImage = (index: number) => {
    setNewImages((images) => images.filter((_image, idx) => idx !== index));
  };

  const moveNewImage = (index: number, offset: -1 | 1) => {
    setNewImages((images) => {
      const target = index + offset;

      if (target < 0 || target >= images.length) {
        return images;
      }

      const nextImages = [...images];
      [nextImages[index], nextImages[target]] = [
        nextImages[target],
        nextImages[index],
      ];

      return nextImages;
    });
  };

  const handleExistingImageRemove = async (imageId: string) => {
    if (!product || !window.confirm(t("confirmDelete"))) {
      return;
    }

    setFormError("");

    try {
      await removeProductImage.mutateAsync({
        productId: product._id,
        imageId,
      });
    } catch (error) {
      setFormError(getErrorMessage(error, t("deleteFailed")));
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!product) {
      return;
    }

    setFormError("");

    try {
      await setPrimaryProductImage.mutateAsync({
        productId: product._id,
        imageId,
      });
    } catch (error) {
      setFormError(getErrorMessage(error, t("updateFailed")));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const priceValue = Number(price);
    const stockValue = Number(stockQuantity);

    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setFormError(t("invalidPrice"));
      return;
    }

    if (!Number.isInteger(stockValue) || stockValue < 0) {
      setFormError(t("invalidStock"));
      return;
    }

    if (!subcategoryId) {
      setFormError(t("subcategoryRequired"));
      return;
    }

    const payload = {
      name: {
        ar: name.ar.trim(),
        en: name.en.trim(),
      },
      description: {
        ar: description.ar.trim(),
        en: description.en.trim(),
      },
      gender,
      categoryId,
      subcategoryId,
      price: priceValue,
      stockQuantity: stockValue,
    };

    try {
      const savedProduct =
        mode === "create"
          ? await createProduct.mutateAsync(payload)
          : await updateProduct.mutateAsync({
              id: product!._id,
              data: payload,
            });
      const hasPrimaryImage = existingImages.some((image) => image.isPrimary);

      for (let index = 0; index < newImages.length; index += 1) {
        const image = newImages[index];

        await addProductImage.mutateAsync({
          productId: savedProduct._id,
          data: {
            url: image.url,
            publicId: image.publicId,
            alt: payload.name,
            isPrimary: !hasPrimaryImage && index === 0,
            order: existingImages.length + index,
          },
        });
      }

      setNewImages([]);
      router.push("/admin/products");
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          mode === "create" ? t("createFailed") : t("updateFailed"),
        ),
      );
    }
  };

  return (
    <section className="w-full max-w-3xl">
      <Link href="/admin/products" className="mb-6 inline-flex min-h-11 items-center underline">
        {t("backToProducts")}
      </Link>

      <h2 className="mb-6 break-words text-3xl leading-heading sm:text-h2">{pageTitle}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-caption" htmlFor="name-en">
              {t("nameEn")}
            </label>
            <input
              id="name-en"
              type="text"
              value={name.en}
              onChange={(event) =>
                setName((value) => ({ ...value, en: event.target.value }))
              }
              required
              minLength={2}
              maxLength={100}
              className="min-h-12 w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
            />
          </div>

          <div>
            <label className="mb-2 block text-caption" htmlFor="name-ar">
              {t("nameAr")}
            </label>
            <input
              id="name-ar"
              type="text"
              value={name.ar}
              onChange={(event) =>
                setName((value) => ({ ...value, ar: event.target.value }))
              }
              required
              minLength={2}
              maxLength={100}
              dir="rtl"
              className="min-h-12 w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-caption" htmlFor="description-en">
            {t("descEn")}
          </label>
          <textarea
            id="description-en"
            value={description.en}
            onChange={(event) =>
              setDescription((value) => ({
                ...value,
                en: event.target.value,
              }))
            }
            required
            maxLength={2000}
            rows={4}
            className="min-h-32 w-full border border-border-light bg-transparent px-3 py-3 dark:border-border-subtle"
          />
        </div>

        <div>
          <label className="mb-2 block text-caption" htmlFor="description-ar">
            {t("descAr")}
          </label>
          <textarea
            id="description-ar"
            value={description.ar}
            onChange={(event) =>
              setDescription((value) => ({
                ...value,
                ar: event.target.value,
              }))
            }
            required
            maxLength={2000}
            rows={4}
            dir="rtl"
            className="min-h-32 w-full border border-border-light bg-transparent px-3 py-3 dark:border-border-subtle"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-caption">{t("gender")}</legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="radio"
                value="men"
                checked={gender === "men"}
                onChange={() => handleGenderChange("men")}
              />
              {t("men")}
            </label>
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="radio"
                value="women"
                checked={gender === "women"}
                onChange={() => handleGenderChange("women")}
              />
              {t("women")}
            </label>
          </div>
        </fieldset>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-caption" htmlFor="category">
              {t("category")}
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setSubcategoryId("");
              }}
              required
              className="kairova-select min-h-12 w-full border px-3 py-2"
            >
              <option value="">{t("selectCategory")}</option>
              {parentCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {getCategoryName(category, locale)}
                </option>
              ))}
            </select>
            {categoriesLoading && (
              <p className="mt-2 text-caption text-fg-muted">{t("loading")}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-caption" htmlFor="subcategory">
              {t("subcategory")}
            </label>
            <select
              id="subcategory"
              value={subcategoryId}
              onChange={(event) => setSubcategoryId(event.target.value)}
              required
              disabled={!categoryId}
              className="kairova-select min-h-12 w-full border px-3 py-2 disabled:opacity-50"
            >
              <option value="">
                {categoryId && subcategories.length === 0
                  ? t("noSubcategories")
                  : t("selectSubcategory")}
              </option>
              {subcategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {getCategoryName(category, locale)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-caption" htmlFor="price">
              {t("price")}
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              min={0}
              step="0.01"
              className="min-h-12 w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
            />
          </div>

          <div>
            <label className="mb-2 block text-caption" htmlFor="stock">
              {t("stock")}
            </label>
            <input
              id="stock"
              type="number"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              required
              min={0}
              step={1}
              className="min-h-12 w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
            />
          </div>
        </div>

        <section className="space-y-4 border border-border-light p-4 dark:border-border-subtle">
          <h3 className="text-h3 leading-heading">{t("images")}</h3>

          {mode === "edit" && existingImages.length > 0 && (
            <div className="space-y-3">
              <p className="text-caption text-fg-muted">
                {t("existingImages")}
              </p>
              {existingImages.map((image) => (
                <div
                  key={image._id}
                  className="flex flex-col gap-3 border border-border-light p-3 dark:border-border-subtle sm:flex-row sm:items-center"
                >
                  <div className="relative h-20 w-20 shrink-0 bg-surface-light dark:bg-surface-dark">
                    <OptimizedProductImage
                      src={image.url}
                      alt={image.alt[locale] || image.alt.en || name.en}
                      fill
                      variant="thumbnail"
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-caption">
                    {image.isPrimary ? (
                      <span>{t("primary")}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleSetPrimary(image._id)}
                        disabled={imageActionPending}
                        className="inline-flex min-h-11 items-center underline disabled:opacity-50"
                      >
                        {t("setPrimary")}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleExistingImageRemove(image._id)}
                    disabled={imageActionPending}
                    className="inline-flex min-h-11 items-center border border-red-700 px-3 py-2 text-red-700 disabled:opacity-50 dark:border-red-300 dark:text-red-300"
                  >
                    {t("delete")}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="mb-2 block text-caption" htmlFor="image-upload">
              {t("addImages")}
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => void handleFileSelect(event)}
              disabled={uploading || saving}
              className="min-h-12 w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
            />
            {uploading && (
              <p className="mt-2 text-caption text-fg-muted">
                {t("uploading")}
              </p>
            )}
            {uploadError && (
              <p className="mt-2 text-caption text-red-600">{uploadError}</p>
            )}
          </div>

          {newImages.length > 0 && (
            <div className="space-y-3">
              <p className="text-caption text-fg-muted">{t("newImages")}</p>
              {newImages.map((image, index) => (
                <div
                  key={`${image.publicId}-${index}`}
                  className="flex flex-col gap-3 border border-border-light p-3 dark:border-border-subtle sm:flex-row sm:items-center"
                >
                  <div className="relative h-20 w-20 shrink-0 bg-surface-light dark:bg-surface-dark">
                    <OptimizedProductImage
                      src={image.url}
                      alt={image.fileName}
                      fill
                      variant="thumbnail"
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <p className="flex-1 break-all text-caption">
                    {image.fileName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => moveNewImage(index, -1)}
                      disabled={index === 0}
                      className="inline-flex min-h-11 items-center border border-border-light px-3 py-2 disabled:opacity-50 dark:border-border-subtle"
                    >
                      {t("moveUp")}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveNewImage(index, 1)}
                      disabled={index === newImages.length - 1}
                      className="inline-flex min-h-11 items-center border border-border-light px-3 py-2 disabled:opacity-50 dark:border-border-subtle"
                    >
                      {t("moveDown")}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="inline-flex min-h-11 items-center border border-red-700 px-3 py-2 text-red-700 dark:border-red-300 dark:text-red-300"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {formError && <p className="text-body text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={saving || uploading}
          className="min-h-12 w-full border border-fg-secondary bg-fg-secondary px-4 py-3 text-bg-secondary disabled:opacity-50 dark:border-fg-primary dark:bg-fg-primary dark:text-bg-primary"
        >
          {saving ? t("processing") : submitLabel}
        </button>
      </form>
    </section>
  );
}
