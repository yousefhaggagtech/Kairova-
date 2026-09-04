import mongoose from "mongoose";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import { featuredProducts } from "./seedFeaturedProducts.js";

const navbarPath = resolve(
  process.cwd(),
  "..",
  "client",
  "src",
  "components",
  "layout",
  "Navbar.tsx",
);

function extractNavbarProductSlugs(source: string) {
  const slugs: string[] = [];
  const seenSlugs = new Set<string>();
  const productHrefPattern = /href:\s*["']\/product\/([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = productHrefPattern.exec(source))) {
    const slug = match[1];

    if (!seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      slugs.push(slug);
    }
  }

  return slugs;
}

async function getFeaturedSlugs() {
  try {
    const navbarSource = await readFile(navbarPath, "utf8");
    const navbarSlugs = extractNavbarProductSlugs(navbarSource);

    if (navbarSlugs.length > 0) {
      return navbarSlugs;
    }

    console.warn(
      "No hardcoded navbar product hrefs found. Falling back to seed product order.",
    );
  } catch (error) {
    console.warn(
      "Could not read Navbar.tsx. Falling back to seed product order.",
      error,
    );
  }

  return featuredProducts.map((product) => product.slug);
}

export async function migrateFeaturedProducts() {
  const slugs = await getFeaturedSlugs();
  const missingSlugs: string[] = [];
  let productsUpdated = 0;

  for (let index = 0; index < slugs.length; index += 1) {
    const slug = slugs[index];
    const result = await Product.updateOne(
      { slug, deletedAt: null },
      {
        $set: {
          isFeatured: true,
          featuredOrder: index + 1,
        },
      },
    );

    if (result.matchedCount === 0) {
      missingSlugs.push(slug);
    } else if (result.modifiedCount > 0) {
      productsUpdated += 1;
    }
  }

  return {
    productsMatched: slugs.length - missingSlugs.length,
    productsUpdated,
    missingSlugs,
  };
}

async function runMigrateFeaturedProducts(): Promise<number> {
  try {
    await connectDB();

    const result = await migrateFeaturedProducts();

    console.log(
      `Featured product migration matched ${result.productsMatched} products and updated ${result.productsUpdated} products.`,
    );

    if (result.missingSlugs.length > 0) {
      console.warn(
        `Missing featured product slugs: ${result.missingSlugs.join(", ")}`,
      );
    }

    return 0;
  } catch (error) {
    console.error("Failed to migrate featured products:", error);
    return 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (
  process.argv[1]?.endsWith("migrateFeaturedProducts.ts") ||
  process.argv[1]?.endsWith("migrateFeaturedProducts.js")
) {
  runMigrateFeaturedProducts().then((exitCode) => {
    process.exit(exitCode);
  });
}
