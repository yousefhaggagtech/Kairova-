import mongoose, { Types } from "mongoose";

import { connectDB } from "../config/db.js";
import Category, { type CategoryGender, type ICategory } from "../models/Category.js";
import Product from "../models/Product.js";
import { generateSlug } from "../features/_shared/slug.js";
import type { LocalizedString } from "../types/localized.js";

type CatalogParent = {
  name: LocalizedString;
  subcategories: LocalizedString[];
};

const catalog = {
  men: [
    {
      name: { ar: "\u0633\u0627\u0639\u0627\u062a", en: "Watches" },
      subcategories: [
        { ar: "\u0633\u0627\u0639\u0627\u062a \u0643\u0644\u0627\u0633\u064a\u0643\u064a\u0629", en: "Classic Watches" },
        { ar: "\u0633\u0627\u0639\u0627\u062a \u0631\u064a\u0627\u0636\u064a\u0629", en: "Sport Watches" },
        { ar: "\u0633\u0627\u0639\u0627\u062a \u0630\u0643\u064a\u0629", en: "Smart Watches" },
      ],
    },
    {
      name: { ar: "\u0623\u062d\u0632\u0645\u0629", en: "Belts" },
      subcategories: [
        { ar: "\u0623\u062d\u0632\u0645\u0629 \u062c\u0644\u062f\u064a\u0629", en: "Leather Belts" },
        { ar: "\u0623\u062d\u0632\u0645\u0629 \u0631\u0633\u0645\u064a\u0629", en: "Formal Belts" },
        { ar: "\u0623\u062d\u0632\u0645\u0629 \u0643\u0627\u062c\u0648\u0627\u0644", en: "Casual Belts" },
      ],
    },
    {
      name: { ar: "\u0645\u062d\u0627\u0641\u0638", en: "Wallets" },
      subcategories: [
        { ar: "\u0645\u062d\u0627\u0641\u0638 \u062b\u0646\u0627\u0626\u064a\u0629", en: "Bifold Wallets" },
        { ar: "\u062d\u0648\u0627\u0645\u0644 \u0628\u0637\u0627\u0642\u0627\u062a", en: "Card Holders" },
      ],
    },
    {
      name: { ar: "\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062a", en: "Accessories" },
      subcategories: [
        { ar: "\u0623\u0633\u0627\u0648\u0631", en: "Bracelets" },
        { ar: "\u0646\u0638\u0627\u0631\u0627\u062a \u0634\u0645\u0633\u064a\u0629", en: "Sunglasses" },
        { ar: "\u0623\u0632\u0631\u0627\u0631 \u0623\u0643\u0645\u0627\u0645", en: "Cufflinks" },
      ],
    },
    {
      name: { ar: "\u0639\u0637\u0648\u0631", en: "Perfume" },
      subcategories: [
        { ar: "\u0645\u0627\u0621 \u0639\u0637\u0631", en: "Eau de Parfum" },
        { ar: "\u0645\u0627\u0621 \u062a\u0648\u0627\u0644\u064a\u062a", en: "Eau de Toilette" },
      ],
    },
  ],
  women: [
    {
      name: { ar: "\u0633\u0627\u0639\u0627\u062a", en: "Watches" },
      subcategories: [
        { ar: "\u0633\u0627\u0639\u0627\u062a \u0643\u0644\u0627\u0633\u064a\u0643\u064a\u0629", en: "Classic Watches" },
        { ar: "\u0633\u0627\u0639\u0627\u062a \u0639\u0635\u0631\u064a\u0629", en: "Fashion Watches" },
        { ar: "\u0633\u0627\u0639\u0627\u062a \u0630\u0643\u064a\u0629", en: "Smart Watches" },
      ],
    },
    {
      name: { ar: "\u0623\u062d\u0632\u0645\u0629", en: "Belts" },
      subcategories: [
        { ar: "\u0623\u062d\u0632\u0645\u0629 \u062c\u0644\u062f\u064a\u0629", en: "Leather Belts" },
        { ar: "\u0623\u062d\u0632\u0645\u0629 \u062e\u0635\u0631", en: "Waist Belts" },
      ],
    },
    {
      name: { ar: "\u0645\u062d\u0627\u0641\u0638", en: "Wallets" },
      subcategories: [
        { ar: "\u0645\u062d\u0627\u0641\u0638 \u0637\u0648\u064a\u0644\u0629", en: "Long Wallets" },
        { ar: "\u062d\u0648\u0627\u0645\u0644 \u0628\u0637\u0627\u0642\u0627\u062a", en: "Card Holders" },
      ],
    },
    {
      name: { ar: "\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062a", en: "Accessories" },
      subcategories: [
        { ar: "\u0623\u0633\u0627\u0648\u0631", en: "Bracelets" },
        { ar: "\u0646\u0638\u0627\u0631\u0627\u062a \u0634\u0645\u0633\u064a\u0629", en: "Sunglasses" },
        { ar: "\u0642\u0644\u0627\u0626\u062f", en: "Necklaces" },
        { ar: "\u0623\u0642\u0631\u0627\u0637", en: "Earrings" },
        { ar: "\u0623\u0648\u0634\u062d\u0629", en: "Scarves" },
      ],
    },
    {
      name: { ar: "\u0639\u0637\u0648\u0631", en: "Perfume" },
      subcategories: [
        { ar: "\u0645\u0627\u0621 \u0639\u0637\u0631", en: "Eau de Parfum" },
        { ar: "\u0631\u0630\u0627\u0630 \u0644\u0644\u062c\u0633\u0645", en: "Body Mist" },
      ],
    },
  ],
} satisfies Record<CategoryGender, CatalogParent[]>;

function getId(category: ICategory) {
  return (category._id as Types.ObjectId).toString();
}

async function createSlug(preferredSlug: string) {
  let slug = preferredSlug || "category";
  let suffix = 2;

  while (await Category.exists({ slug })) {
    slug = `${preferredSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

async function upsertCategory(
  gender: CategoryGender,
  name: LocalizedString,
  parentCategory: ICategory | null,
) {
  const parentCategoryId = parentCategory ? getId(parentCategory) : null;
  const query: Record<string, unknown> = {
    gender,
    "name.en": name.en,
    parentCategory: parentCategoryId,
    deletedAt: null,
  };
  const existing = await Category.findOne(query);

  if (existing) {
    existing.name = name;
    await existing.save();
    return { category: existing, created: false };
  }

  const slugParts = parentCategory
    ? [gender, parentCategory.name.en, name.en]
    : [gender, name.en];
  const slug = await createSlug(generateSlug(slugParts.join(" ")));
  const category = await Category.create({
    name,
    slug,
    gender,
    parentCategory: parentCategoryId,
  } as unknown as ICategory);

  return { category, created: true };
}

async function seedCategories(): Promise<number> {
  let createdCount = 0;
  let migratedProductCount = 0;
  const firstSubcategoryByParentId = new Map<string, string>();

  try {
    await connectDB();

    for (const gender of Object.keys(catalog) as CategoryGender[]) {
      for (const parent of catalog[gender]) {
        const parentResult = await upsertCategory(gender, parent.name, null);
        if (parentResult.created) createdCount += 1;

        for (const subcategory of parent.subcategories) {
          const childResult = await upsertCategory(
            gender,
            subcategory,
            parentResult.category,
          );
          if (childResult.created) createdCount += 1;

          const parentId = getId(parentResult.category);
          if (!firstSubcategoryByParentId.has(parentId)) {
            firstSubcategoryByParentId.set(parentId, getId(childResult.category));
          }
        }
      }
    }

    for (const [parentCategoryId, subcategoryId] of firstSubcategoryByParentId) {
      const query: Record<string, unknown> = {
        category: parentCategoryId,
        deletedAt: null,
        $or: [{ subcategory: null }, { subcategory: { $exists: false } }],
      };
      const result = await Product.updateMany(query, {
        subcategory: subcategoryId,
      });
      migratedProductCount += result.modifiedCount;
    }

    console.log(
      `Catalog categories seeded. Created ${createdCount} categories. Migrated ${migratedProductCount} products.`,
    );
    return 0;
  } catch (err) {
    console.error("Failed to seed categories:", err);
    return 1;
  } finally {
    await mongoose.disconnect();
  }
}

const exitCode = await seedCategories();
process.exit(exitCode);
