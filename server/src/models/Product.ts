import {
  Schema,
  model,
  Document,
  type Model,
  type QueryWithHelpers,
  type Types,
} from "mongoose";

import { generateSlug } from "../features/_shared/slug.js";
import type { LocalizedString } from "../types/localized.js";
import { localizedField } from "./_fragments.js";
import Category from "./Category.js";

export type ProductGender = "men" | "women";

export interface IProduct extends Document {
  name: LocalizedString;
  description: LocalizedString;
  slug: string;
  gender: ProductGender;
  category: Types.ObjectId;
  subcategory: Types.ObjectId | null;
  price: number;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  images: Types.ObjectId[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductQueryHelpers {
  active(
    this: QueryWithHelpers<
      IProduct[],
      IProduct,
      ProductQueryHelpers,
      IProduct,
      "find"
    >,
  ): QueryWithHelpers<
    IProduct[],
    IProduct,
    ProductQueryHelpers,
    IProduct,
    "find"
  >;
}

type ProductModel = Model<IProduct, ProductQueryHelpers>;

const productSchema = new Schema<
  IProduct,
  ProductModel,
  Record<string, never>,
  ProductQueryHelpers
>(
  {
    name: localizedField,
    description: localizedField,
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["men", "women"],
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: Category.modelName,
      required: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: Category.modelName,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductImage",
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

productSchema.index({ gender: 1, category: 1 });
productSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);
productSchema.index(
  { sku: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

productSchema.query.active = function active() {
  return this.find({ deletedAt: null });
};

productSchema.pre("save", function generateProductSlug() {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = generateSlug(this.name.en);
  }
});

export const Product = model<IProduct, ProductModel>("Product", productSchema);

export default Product;
