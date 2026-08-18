import {
  Schema,
  model,
  Document,
  type Model,
  type QueryWithHelpers,
} from "mongoose";

import { localizedField } from "./_fragments.js";
import type { LocalizedString } from "../types/localized.js";

export type CategoryGender = "men" | "women";

export interface ICategory extends Document {
  name: LocalizedString;
  slug: string;
  gender: CategoryGender;
  parentCategory: Schema.Types.ObjectId | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryQueryHelpers {
  active(
    this: QueryWithHelpers<
      ICategory[],
      ICategory,
      CategoryQueryHelpers,
      ICategory,
      "find"
    >,
  ): QueryWithHelpers<
    ICategory[],
    ICategory,
    CategoryQueryHelpers,
    ICategory,
    "find"
  >;
}

type CategoryModel = Model<ICategory, CategoryQueryHelpers>;

const categorySchema = new Schema<
  ICategory,
  CategoryModel,
  Record<string, never>,
  CategoryQueryHelpers
>(
  {
    name: localizedField,
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["men", "women"],
      required: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

categorySchema.index({ gender: 1, parentCategory: 1 });
categorySchema.index(
  { gender: 1, "name.ar": 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

categorySchema.query.active = function active() {
  return this.find({ deletedAt: null });
};

export const Category = model<ICategory, CategoryModel>(
  "Category",
  categorySchema,
);

export default Category;
