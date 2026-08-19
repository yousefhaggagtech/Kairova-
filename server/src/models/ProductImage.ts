import {
  Schema,
  model,
  Document,
  type Model,
  type QueryWithHelpers,
  type Types,
} from "mongoose";

import { localizedField } from "./_fragments.js";
import type { LocalizedString } from "../types/localized.js";

const optionalLocalizedField = {
  ar: { ...localizedField.ar, required: false, default: "" },
  en: { ...localizedField.en, required: false, default: "" },
};

export interface IProductImage extends Document {
  product: Types.ObjectId;
  url: string;
  publicId: string;
  alt: LocalizedString;
  isPrimary: boolean;
  order: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductImageQueryHelpers {
  active(
    this: QueryWithHelpers<
      IProductImage[],
      IProductImage,
      ProductImageQueryHelpers,
      IProductImage,
      "find"
    >,
  ): QueryWithHelpers<
    IProductImage[],
    IProductImage,
    ProductImageQueryHelpers,
    IProductImage,
    "find"
  >;
}

type ProductImageModel = Model<IProductImage, ProductImageQueryHelpers>;

const productImageSchema = new Schema<
  IProductImage,
  ProductImageModel,
  Record<string, never>,
  ProductImageQueryHelpers
>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    alt: optionalLocalizedField,
    isPrimary: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

productImageSchema.query.active = function active() {
  return this.find({ deletedAt: null });
};

export const ProductImage = model<IProductImage, ProductImageModel>(
  "ProductImage",
  productImageSchema,
);

export default ProductImage;
