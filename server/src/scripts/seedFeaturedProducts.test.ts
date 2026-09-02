import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import {
  featuredProducts,
  seedFeaturedProducts,
} from "./seedFeaturedProducts.js";

function getId(document: { _id: unknown }) {
  return String(document._id);
}

describe("seedFeaturedProducts", () => {
  it("creates idempotent product records for every featured navbar slug", async () => {
    const firstResult = await seedFeaturedProducts();

    expect(firstResult).toEqual({
      productsCreated: featuredProducts.length,
      productsUpdated: 0,
    });

    for (const seed of featuredProducts) {
      const product = await Product.findOne({
        slug: seed.slug,
        deletedAt: null,
      });

      expect(product).toBeTruthy();
      if (!product) {
        throw new Error(`Missing product "${seed.slug}"`);
      }

      expect(product.name.en).toBe(seed.name.en);
      expect(product.name.ar).toBe(seed.name.ar);
      expect(product.gender).toBe(seed.gender);
      expect(product.price).toBe(seed.price);
      expect(product.stockQuantity).toBe(seed.stockQuantity);

      const category = await Category.findOne({
        _id: product.category,
        deletedAt: null,
      });
      const subcategory = await Category.findOne({
        _id: product.subcategory,
        deletedAt: null,
      });
      const image = await ProductImage.findOne({
        product: product._id,
        publicId: `featured-products/${seed.slug}`,
        deletedAt: null,
      });

      expect(category).toBeTruthy();
      expect(subcategory).toBeTruthy();
      expect(image).toBeTruthy();
      if (!image) {
        throw new Error(`Missing product image "${seed.slug}"`);
      }

      expect(image.url).toBe(seed.image.url);
      expect(image.alt.en).toBe(seed.image.alt.en);
      expect(image.alt.ar).toBe(seed.image.alt.ar);
      expect(image.isPrimary).toBe(true);
      expect(
        product.images.map((productImage) => productImage.toString()),
      ).toContain(
        getId(image),
      );
    }

    const secondResult = await seedFeaturedProducts();

    expect(secondResult).toEqual({
      productsCreated: 0,
      productsUpdated: featuredProducts.length,
    });

    const firstSeed = featuredProducts[0];
    const productToPreserve = await Product.findOne({
      slug: firstSeed.slug,
      deletedAt: null,
    });

    expect(productToPreserve).toBeTruthy();
    if (!productToPreserve) {
      throw new Error(`Missing product "${firstSeed.slug}"`);
    }

    productToPreserve.price = 1234;
    productToPreserve.stockQuantity = 3;
    await productToPreserve.save();
    await seedFeaturedProducts();

    const preservedProduct = await Product.findOne({
      slug: firstSeed.slug,
      deletedAt: null,
    });

    expect(preservedProduct?.price).toBe(1234);
    expect(preservedProduct?.stockQuantity).toBe(3);
    expect(await Product.countDocuments({ deletedAt: null })).toBe(
      featuredProducts.length,
    );
    expect(await ProductImage.countDocuments({ deletedAt: null })).toBe(
      featuredProducts.length,
    );
  });
});
