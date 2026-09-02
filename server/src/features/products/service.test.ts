import mongoose from "mongoose";

import Category, { type ICategory } from "../../models/Category.js";
import Product, { type IProduct } from "../../models/Product.js";
import ProductImage from "../../models/ProductImage.js";
import {
  addImage,
  createProduct,
  getProductById,
  listProducts,
  setPrimaryImage,
  softDeleteProduct,
  updateStock,
} from "./service.js";

interface SeededCategories {
  menWatches: ICategory;
  menClassicWatches: ICategory;
  menAccessories: ICategory;
  menBracelets: ICategory;
  womenWatches: ICategory;
  womenClassicWatches: ICategory;
}

const productInput = (
  overrides: Partial<Parameters<typeof createProduct>[0]> = {},
): Parameters<typeof createProduct>[0] => ({
  name: { ar: "Classic Watch AR", en: "Classic Watch" },
  description: { ar: "Arabic description", en: "English description" },
  gender: "men",
  categoryId: new mongoose.Types.ObjectId().toString(),
  subcategoryId: new mongoose.Types.ObjectId().toString(),
  price: 1200,
  stockQuantity: 10,
  ...overrides,
});

const seedCategories = async (): Promise<SeededCategories> => {
  const menWatches = await Category.create({
    name: { ar: "Men Watches AR", en: "Men Watches" },
    slug: "watches",
    gender: "men",
    parentCategory: null,
  });
  const menClassicWatches = await Category.create({
    name: { ar: "Men Classic Watches AR", en: "Men Classic Watches" },
    slug: "men-classic-watches",
    gender: "men",
    parentCategory: menWatches._id.toString(),
  } as unknown as ICategory);
  const menAccessories = await Category.create({
    name: { ar: "Men Accessories AR", en: "Men Accessories" },
    slug: "men-accessories",
    gender: "men",
    parentCategory: null,
  });
  const menBracelets = await Category.create({
    name: { ar: "Men Bracelets AR", en: "Men Bracelets" },
    slug: "men-bracelets",
    gender: "men",
    parentCategory: menAccessories._id.toString(),
  } as unknown as ICategory);
  const womenWatches = await Category.create({
    name: { ar: "Women Watches AR", en: "Women Watches" },
    slug: "women-watches",
    gender: "women",
    parentCategory: null,
  });
  const womenClassicWatches = await Category.create({
    name: { ar: "Women Classic Watches AR", en: "Women Classic Watches" },
    slug: "women-classic-watches",
    gender: "women",
    parentCategory: womenWatches._id.toString(),
  } as unknown as ICategory);

  return {
    menWatches,
    menClassicWatches,
    menAccessories,
    menBracelets,
    womenWatches,
    womenClassicWatches,
  };
};

const createSeedProduct = async (
  categories: SeededCategories,
  overrides: Partial<Parameters<typeof createProduct>[0]> = {},
): Promise<IProduct> =>
  createProduct(
    productInput({
      categoryId: categories.menWatches._id.toString(),
      subcategoryId: categories.menClassicWatches._id.toString(),
      ...overrides,
    }),
  );

describe("product service", () => {
  it("createProduct validates category gender match", async () => {
    const categories = await seedCategories();

    await expect(
      createProduct(
        productInput({
          gender: "men",
          categoryId: categories.womenWatches._id.toString(),
        }),
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Category gender must match product gender",
    });
  });

  it("createProduct requires a subcategory", async () => {
    const categories = await seedCategories();

    await expect(
      createProduct(
        productInput({
          categoryId: categories.menWatches._id.toString(),
          subcategoryId: "",
        }),
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Subcategory is required",
    });
  });

  it("createProduct validates subcategory is child of category", async () => {
    const categories = await seedCategories();

    await expect(
      createProduct(
        productInput({
          categoryId: categories.menWatches._id.toString(),
          subcategoryId: categories.menBracelets._id.toString(),
        }),
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Subcategory must belong to category",
    });
  });

  it("createProduct generates unique SKU", async () => {
    const categories = await seedCategories();

    const firstProduct = await createSeedProduct(categories);
    const secondProduct = await createSeedProduct(categories, {
      name: { ar: "Second Watch AR", en: "Second Watch" },
    });

    expect(firstProduct.sku).toBe("KRV-MEN-WAT-001");
    expect(secondProduct.sku).toBe("KRV-MEN-WAT-002");
  });

  it("createProduct generates unique slug", async () => {
    const categories = await seedCategories();

    const firstProduct = await createSeedProduct(categories);
    const secondProduct = await createSeedProduct(categories);

    expect(firstProduct.slug).toBe("classic-watch");
    expect(secondProduct.slug).toBe("classic-watch-2");
  });

  it("listProducts filters by gender", async () => {
    const categories = await seedCategories();
    await createSeedProduct(categories);
    await createProduct(
      productInput({
        name: { ar: "Women Watch AR", en: "Women Watch" },
        gender: "women",
        categoryId: categories.womenWatches._id.toString(),
        subcategoryId: categories.womenClassicWatches._id.toString(),
      }),
    );

    const products = await listProducts({ gender: "women" });

    expect(products).toHaveLength(1);
    expect(products[0]?.gender).toBe("women");
  });

  it("listProducts filters by categoryId", async () => {
    const categories = await seedCategories();
    await createSeedProduct(categories);
    await createProduct(
      productInput({
        name: { ar: "Bracelet AR", en: "Bracelet" },
        categoryId: categories.menAccessories._id.toString(),
        subcategoryId: categories.menBracelets._id.toString(),
      }),
    );

    const products = await listProducts({
      categoryId: categories.menAccessories._id.toString(),
    });

    expect(products).toHaveLength(1);
    expect(products[0]?.name.en).toBe("Bracelet");
  });

  it("listProducts filters by search terms across product fields", async () => {
    const categories = await seedCategories();
    const classic = await createSeedProduct(categories, {
      name: { ar: "Royal Automatic Watch AR", en: "Royal Automatic Watch" },
      description: {
        ar: "Silver dial description AR",
        en: "Silver dial with bracelet detail",
      },
    });
    const bracelet = await createProduct(
      productInput({
        name: { ar: "Titan Bracelet AR", en: "Titan Bracelet" },
        description: {
          ar: "Braided accent description AR",
          en: "Braided leather accent",
        },
        categoryId: categories.menAccessories._id.toString(),
        subcategoryId: categories.menBracelets._id.toString(),
      }),
    );

    const nameResults = await listProducts({ search: "royal watch" });
    const descriptionResults = await listProducts({ search: "leather accent" });
    const skuResults = await listProducts({ search: classic.sku.toLowerCase() });
    const escapedResults = await listProducts({ search: ".*" });

    expect(nameResults).toHaveLength(1);
    expect(nameResults[0]?._id.toString()).toBe(classic._id.toString());
    expect(descriptionResults).toHaveLength(1);
    expect(descriptionResults[0]?._id.toString()).toBe(
      bracelet._id.toString(),
    );
    expect(skuResults).toHaveLength(1);
    expect(skuResults[0]?._id.toString()).toBe(classic._id.toString());
    expect(escapedResults).toHaveLength(0);
  });

  it("getProductById populates images and category", async () => {
    const categories = await seedCategories();
    const product = await createSeedProduct(categories);
    await addImage(product._id.toString(), {
      url: "https://example.com/watch.jpg",
      publicId: "watch",
      isPrimary: true,
      order: 1,
    });

    const result = await getProductById(product._id.toString());

    expect((result.category as unknown as ICategory).slug).toBe("watches");
    expect((result.images[0] as unknown as { url: string }).url).toBe(
      "https://example.com/watch.jpg",
    );
  });

  it("updateStock succeeds when stock sufficient", async () => {
    const categories = await seedCategories();
    const product = await createSeedProduct(categories, {
      stockQuantity: 4,
    });

    const result = await updateStock(product._id.toString(), 3);
    const updatedProduct = await Product.findById(product._id);

    expect(result).toBe(true);
    expect(updatedProduct?.stockQuantity).toBe(1);
  });

  it("updateStock fails when stock insufficient", async () => {
    const categories = await seedCategories();
    const product = await createSeedProduct(categories, {
      stockQuantity: 2,
    });

    const result = await updateStock(product._id.toString(), 3);
    const updatedProduct = await Product.findById(product._id);

    expect(result).toBe(false);
    expect(updatedProduct?.stockQuantity).toBe(2);
  });

  it("addImage sets isPrimary=true and unsets others", async () => {
    const categories = await seedCategories();
    const product = await createSeedProduct(categories);
    const firstImage = await addImage(product._id.toString(), {
      url: "https://example.com/first.jpg",
      publicId: "first",
      isPrimary: true,
    });
    const secondImage = await addImage(product._id.toString(), {
      url: "https://example.com/second.jpg",
      publicId: "second",
      isPrimary: true,
    });

    const images = await ProductImage.find({
      _id: { $in: [firstImage._id, secondImage._id] },
    }).sort({ url: 1 });

    expect(images.find((image) => image.publicId === "first")?.isPrimary).toBe(
      false,
    );
    expect(images.find((image) => image.publicId === "second")?.isPrimary).toBe(
      true,
    );
  });

  it("setPrimaryImage works correctly", async () => {
    const categories = await seedCategories();
    const product = await createSeedProduct(categories);
    const firstImage = await addImage(product._id.toString(), {
      url: "https://example.com/first.jpg",
      publicId: "first",
      isPrimary: true,
    });
    const secondImage = await addImage(product._id.toString(), {
      url: "https://example.com/second.jpg",
      publicId: "second",
    });

    await setPrimaryImage(product._id.toString(), secondImage._id.toString());

    const firstUpdated = await ProductImage.findById(firstImage._id);
    const secondUpdated = await ProductImage.findById(secondImage._id);

    expect(firstUpdated?.isPrimary).toBe(false);
    expect(secondUpdated?.isPrimary).toBe(true);
  });

  it("softDeleteProduct also soft-deletes related images", async () => {
    const categories = await seedCategories();
    const product = await createSeedProduct(categories);
    const image = await addImage(product._id.toString(), {
      url: "https://example.com/watch.jpg",
      publicId: "watch",
      isPrimary: true,
    });

    await softDeleteProduct(product._id.toString());

    const deletedProduct = await Product.findById(product._id);
    const deletedImage = await ProductImage.findById(image._id);

    expect(deletedProduct?.deletedAt).toBeInstanceOf(Date);
    expect(deletedImage?.deletedAt).toBeInstanceOf(Date);
  });
});
