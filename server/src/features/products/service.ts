import { Types, type QueryFilter, type UpdateQuery } from "mongoose";

import Category, { type ICategory } from "../../models/Category.js";
import Product, {
  type IProduct,
  type ProductGender,
} from "../../models/Product.js";
import ProductImage, {
  type IProductImage,
} from "../../models/ProductImage.js";
import type { LocalizedString } from "../../types/localized.js";
import AppError from "../../utils/AppError.js";
import { generateSlug } from "../_shared/slug.js";
import { deleteImage } from "../uploads/service.js";

interface CreateProductInput {
  name: LocalizedString;
  description: LocalizedString;
  gender: ProductGender;
  categoryId: string;
  subcategoryId?: string | null;
  price: number;
  stockQuantity: number;
  lowStockThreshold?: number;
}

interface ProductListFilters {
  gender?: ProductGender;
  categoryId?: string;
  subcategoryId?: string | null;
}

type ProductUpdates = Partial<{
  name: LocalizedString;
  description: LocalizedString;
  gender: ProductGender;
  categoryId: string;
  category: string;
  subcategoryId: string | null;
  subcategory: string | null;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
}>;

interface ProductImageInput {
  url: string;
  publicId: string;
  alt?: LocalizedString;
  isPrimary?: boolean;
  order?: number;
}

const categorySelect = "name slug";
const productPopulate = [
  { path: "category", select: categorySelect },
  { path: "subcategory", select: categorySelect },
  {
    path: "images",
    match: { deletedAt: null },
    select: "url publicId isPrimary order alt",
    options: { sort: { order: 1, createdAt: 1 } },
  },
];

const toObjectId = (id: string, message: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(message, 400);
  }

  return new Types.ObjectId(id);
};

const getCategoryId = (updates: ProductUpdates): string | undefined =>
  updates.categoryId ?? updates.category;

const getSubcategoryId = (
  updates: ProductUpdates,
): string | null | undefined => {
  if (updates.subcategoryId !== undefined) {
    return updates.subcategoryId;
  }

  return updates.subcategory;
};

const validateCategory = async (
  categoryId: string,
  gender: ProductGender,
): Promise<ICategory> => {
  const category = await Category.findOne({
    _id: toObjectId(categoryId, "Invalid category id"),
    deletedAt: null,
  });

  if (!category) {
    throw new AppError("Category not found", 400);
  }

  if (category.gender !== gender) {
    throw new AppError("Category gender must match product gender", 400);
  }

  return category;
};

const validateSubcategory = async (
  subcategoryId: string | null | undefined,
  categoryId: string,
): Promise<Types.ObjectId | null> => {
  if (!subcategoryId) {
    return null;
  }

  const subcategoryObjectId = toObjectId(
    subcategoryId,
    "Invalid subcategory id",
  );
  const subcategory = await Category.findOne({
    _id: subcategoryObjectId,
    deletedAt: null,
  });

  if (!subcategory) {
    throw new AppError("Subcategory not found", 400);
  }

  if (subcategory.parentCategory?.toString() !== categoryId) {
    throw new AppError("Subcategory must belong to category", 400);
  }

  return subcategoryObjectId;
};

const categoryCodeFromSlug = (slug: string): string => {
  const code = slug.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();

  return code.padEnd(3, "X");
};

const generateSku = async (
  gender: ProductGender,
  categoryId: string,
  categorySlug: string,
): Promise<string> => {
  const prefix = `KRV-${gender.toUpperCase()}-${categoryCodeFromSlug(
    categorySlug,
  )}`;
  let sequence =
    (await Product.countDocuments({
      gender,
      category: toObjectId(categoryId, "Invalid category id"),
    })) + 1;
  let sku = `${prefix}-${String(sequence).padStart(3, "0")}`;

  while (await Product.exists({ sku })) {
    sequence += 1;
    sku = `${prefix}-${String(sequence).padStart(3, "0")}`;
  }

  return sku;
};

const generateUniqueSlug = async (
  name: string,
  excludeProductId?: string,
): Promise<string> => {
  const baseSlug = generateSlug(name) || "product";
  let slug = baseSlug;
  let suffix = 2;

  const slugExists = async (candidate: string): Promise<boolean> => {
    const query: QueryFilter<IProduct> = {
      slug: candidate,
      deletedAt: null,
    };

    if (excludeProductId) {
      query._id = { $ne: excludeProductId };
    }

    return (await Product.exists(query)) !== null;
  };

  while (await slugExists(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

export const createProduct = async (
  input: CreateProductInput,
): Promise<IProduct> => {
  const category = await validateCategory(input.categoryId, input.gender);
  const subcategory = await validateSubcategory(
    input.subcategoryId,
    input.categoryId,
  );
  const sku = await generateSku(input.gender, input.categoryId, category.slug);
  const slug = await generateUniqueSlug(input.name.en);

  return Product.create({
    name: input.name,
    description: input.description,
    slug,
    gender: input.gender,
    category: toObjectId(input.categoryId, "Invalid category id"),
    subcategory,
    price: input.price,
    sku,
    stockQuantity: input.stockQuantity,
    lowStockThreshold: input.lowStockThreshold,
  } as unknown as IProduct);
};

export const listProducts = async (
  filters: ProductListFilters = {},
): Promise<IProduct[]> => {
  const query: Record<string, unknown> = {};

  if (filters.gender) {
    query.gender = filters.gender;
  }

  if (filters.categoryId) {
    query.category = toObjectId(filters.categoryId, "Invalid category id");
  }

  if (filters.subcategoryId !== undefined) {
    query.subcategory = filters.subcategoryId
      ? toObjectId(filters.subcategoryId, "Invalid subcategory id")
      : null;
  }

  return Product.find(query)
    .active()
    .populate({ path: "category", select: categorySelect })
    .populate({ path: "subcategory", select: categorySelect });
};

export const getProductById = async (id: string): Promise<IProduct> => {
  const product = await Product.findOne({ _id: id, deletedAt: null }).populate(
    productPopulate,
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const getProductBySlug = async (slug: string): Promise<IProduct> => {
  const product = await Product.findOne({
    slug: generateSlug(slug),
    deletedAt: null,
  }).populate(productPopulate);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const updateProduct = async (
  id: string,
  updates: ProductUpdates,
): Promise<IProduct> => {
  const product = await Product.findOne({ _id: id, deletedAt: null });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const update: UpdateQuery<IProduct> = {};
  const nextGender = updates.gender ?? product.gender;
  const nextCategoryId = getCategoryId(updates) ?? product.category.toString();
  const nextSubcategoryId =
    getSubcategoryId(updates) !== undefined
      ? getSubcategoryId(updates)
      : product.subcategory?.toString();
  const shouldValidateRelations =
    updates.gender !== undefined ||
    getCategoryId(updates) !== undefined ||
    getSubcategoryId(updates) !== undefined;

  if (shouldValidateRelations) {
    await validateCategory(nextCategoryId, nextGender);
    update.category = toObjectId(nextCategoryId, "Invalid category id");
    update.subcategory = await validateSubcategory(
      nextSubcategoryId,
      nextCategoryId,
    );
  }

  if (updates.name) {
    update.name = updates.name;
    update.slug = await generateUniqueSlug(updates.name.en, id);
  }

  if (updates.description) {
    update.description = updates.description;
  }

  if (updates.gender) {
    update.gender = updates.gender;
  }

  if (updates.price !== undefined) {
    update.price = updates.price;
  }

  if (updates.stockQuantity !== undefined) {
    update.stockQuantity = updates.stockQuantity;
  }

  if (updates.lowStockThreshold !== undefined) {
    update.lowStockThreshold = updates.lowStockThreshold;
  }

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: id, deletedAt: null },
    update,
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).populate(productPopulate);

  if (!updatedProduct) {
    throw new AppError("Product not found", 404);
  }

  return updatedProduct;
};

export const updateStock = async (
  id: string,
  quantity: number,
): Promise<boolean> => {
  if (quantity <= 0) {
    throw new AppError("Quantity must be greater than 0", 400);
  }

  const result = await Product.updateOne(
    {
      _id: id,
      deletedAt: null,
      stockQuantity: { $gte: quantity },
    },
    { $inc: { stockQuantity: -quantity } },
  );

  return result.modifiedCount === 1;
};

export const addImage = async (
  productId: string,
  imageInput: ProductImageInput,
): Promise<IProductImage> => {
  const product = await Product.findOne({ _id: productId, deletedAt: null });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (imageInput.isPrimary === true) {
    await ProductImage.updateMany(
      { product: toObjectId(productId, "Invalid product id"), deletedAt: null },
      { isPrimary: false },
    );
  }

  const image = await ProductImage.create({
    product: toObjectId(productId, "Invalid product id"),
    url: imageInput.url,
    publicId: imageInput.publicId,
    alt: imageInput.alt ?? { ar: "", en: "" },
    isPrimary: imageInput.isPrimary ?? false,
    order: imageInput.order ?? 0,
  } as unknown as IProductImage);

  await Product.updateOne(
    { _id: productId, deletedAt: null },
    { $push: { images: image._id } },
  );

  return image;
};

export const removeImage = async (
  imageId: string,
): Promise<IProductImage> => {
  const image = await ProductImage.findOne({ _id: imageId, deletedAt: null });

  if (!image) {
    throw new AppError("Product image not found", 404);
  }

  await Product.updateOne(
    { _id: image.product.toString() },
    { $pull: { images: image._id } },
  );

  image.deletedAt = new Date();
  await image.save();
  await deleteImage(image.publicId);

  return image;
};

export const setPrimaryImage = async (
  productId: string,
  imageId: string,
): Promise<IProduct> => {
  const product = await Product.findOne({ _id: productId, deletedAt: null });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const image = await ProductImage.findOne({
    _id: imageId,
    deletedAt: null,
  });

  if (!image || image.product.toString() !== product._id.toString()) {
    throw new AppError("Product image not found", 404);
  }

  await ProductImage.updateMany(
    { product: toObjectId(productId, "Invalid product id"), deletedAt: null },
    { isPrimary: false },
  );
  image.isPrimary = true;
  await image.save();

  return getProductById(productId);
};

export const softDeleteProduct = async (id: string): Promise<IProduct> => {
  const deletedAt = new Date();
  const product = await Product.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const productObjectId = toObjectId(id, "Invalid product id");
  const images = await ProductImage.find({
    product: productObjectId,
    deletedAt: null,
  }).select("publicId");

  await ProductImage.updateMany(
    { product: productObjectId, deletedAt: null },
    { deletedAt },
  );
  await Promise.all(images.map((image) => deleteImage(image.publicId)));

  return product;
};
