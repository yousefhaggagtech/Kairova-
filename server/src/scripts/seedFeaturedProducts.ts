import { pathToFileURL } from "node:url";

import mongoose, { Types } from "mongoose";

import { connectDB } from "../config/db.js";
import Category, {
  type CategoryGender,
  type ICategory,
} from "../models/Category.js";
import Product, { type IProduct } from "../models/Product.js";
import ProductImage, { type IProductImage } from "../models/ProductImage.js";
import type { LocalizedString } from "../types/localized.js";

type CatalogCategoryKey = "accessories" | "perfume" | "watches";

type CategorySeed = {
  name: LocalizedString;
  slug: string;
};

type ParentCategorySeed = CategorySeed & {
  subcategories: Record<string, CategorySeed>;
};

type FeaturedProductSeed = {
  categoryKey: CatalogCategoryKey;
  description: LocalizedString;
  gender: CategoryGender;
  image: {
    alt: LocalizedString;
    url: string;
  };
  name: LocalizedString;
  price: number;
  sku: string;
  slug: string;
  stockQuantity: number;
  subcategoryKey: string;
};

type SeedResult = {
  productsCreated: number;
  productsUpdated: number;
};

const categorySeeds: Record<
  CategoryGender,
  Record<CatalogCategoryKey, ParentCategorySeed>
> = {
  men: {
    watches: {
      name: { ar: "ساعات", en: "Watches" },
      slug: "men-watches",
      subcategories: {
        classic: {
          name: { ar: "ساعات كلاسيكية", en: "Classic Watches" },
          slug: "men-watches-classic-watches",
        },
        sport: {
          name: { ar: "ساعات رياضية", en: "Sport Watches" },
          slug: "men-watches-sport-watches",
        },
      },
    },
    perfume: {
      name: { ar: "عطور", en: "Perfume" },
      slug: "men-perfume",
      subcategories: {
        eauDeParfum: {
          name: { ar: "ماء عطر", en: "Eau de Parfum" },
          slug: "men-perfume-eau-de-parfum",
        },
      },
    },
    accessories: {
      name: { ar: "إكسسوارات", en: "Accessories" },
      slug: "men-accessories",
      subcategories: {
        bracelets: {
          name: { ar: "أساور", en: "Bracelets" },
          slug: "men-accessories-bracelets",
        },
        cufflinks: {
          name: { ar: "أزرار أكمام", en: "Cufflinks" },
          slug: "men-accessories-cufflinks",
        },
      },
    },
  },
  women: {
    watches: {
      name: { ar: "ساعات", en: "Watches" },
      slug: "women-watches",
      subcategories: {
        classic: {
          name: { ar: "ساعات كلاسيكية", en: "Classic Watches" },
          slug: "women-watches-classic-watches",
        },
        fashion: {
          name: { ar: "ساعات عصرية", en: "Fashion Watches" },
          slug: "women-watches-fashion-watches",
        },
      },
    },
    perfume: {
      name: { ar: "عطور", en: "Perfume" },
      slug: "women-perfume",
      subcategories: {
        eauDeParfum: {
          name: { ar: "ماء عطر", en: "Eau de Parfum" },
          slug: "women-perfume-eau-de-parfum",
        },
      },
    },
    accessories: {
      name: { ar: "إكسسوارات", en: "Accessories" },
      slug: "women-accessories",
      subcategories: {
        bracelets: {
          name: { ar: "أساور", en: "Bracelets" },
          slug: "women-accessories-bracelets",
        },
        earrings: {
          name: { ar: "أقراط", en: "Earrings" },
          slug: "women-accessories-earrings",
        },
        necklaces: {
          name: { ar: "قلائد", en: "Necklaces" },
          slug: "women-accessories-necklaces",
        },
      },
    },
  },
};

export const featuredProducts = [
  {
    slug: "kairova-royal-automatic-silver-men-watch",
    name: {
      ar: "Kairova رويال أوتوماتيك",
      en: "Kairova Royal Automatic",
    },
    description: {
      ar: "ساعة أوتوماتيكية فاخرة بهيكل فضي مصقول وميناء متوازن يمنح الإطلالة الرسمية حضورًا هادئًا.",
      en: "A polished silver automatic watch with a balanced dial and a composed formal presence.",
    },
    gender: "men",
    categoryKey: "watches",
    subcategoryKey: "classic",
    price: 8800,
    sku: "KRV-FEAT-001",
    stockQuantity: 12,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-royal-automatic-silver-men-watch.jpeg?updatedAt=1787938134070",
      alt: {
        ar: "ساعة Kairova رويال أوتوماتيك الفضية للرجال",
        en: "Kairova Royal Automatic silver men watch",
      },
    },
  },
  {
    slug: "kairova-legacy-automatic-silver-men-watch",
    name: {
      ar: "Kairova ليجاسي أوتوماتيك",
      en: "Kairova Legacy Automatic",
    },
    description: {
      ar: "تصميم أوتوماتيكي كلاسيكي بلمسة فضية نظيفة، مصنوع ليبقى جزءًا ثابتًا من خزانة الرجل اليومية.",
      en: "A clean silver automatic design made to become a lasting part of a daily menswear rotation.",
    },
    gender: "men",
    categoryKey: "watches",
    subcategoryKey: "classic",
    price: 7600,
    sku: "KRV-FEAT-002",
    stockQuantity: 10,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-legacy-automatic-silver-men-watch.jpeg?updatedAt=1787938287575",
      alt: {
        ar: "ساعة Kairova ليجاسي أوتوماتيك الفضية للرجال",
        en: "Kairova Legacy Automatic silver men watch",
      },
    },
  },
  {
    slug: "kairova-apex-chronograph-silver-men-watch",
    name: {
      ar: "Kairova أبيكس كرونوغراف",
      en: "Kairova Apex Chronograph",
    },
    description: {
      ar: "ساعة كرونوغراف فضية بخطوط حادة وتفاصيل عملية تناسب اليوم النشط والمناسبات المسائية.",
      en: "A sharp silver chronograph with practical details for active days and evening occasions.",
    },
    gender: "men",
    categoryKey: "watches",
    subcategoryKey: "sport",
    price: 6900,
    sku: "KRV-FEAT-003",
    stockQuantity: 9,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-apex-chronograph-silver-men-watch.jpeg?updatedAt=1787938287884",
      alt: {
        ar: "ساعة Kairova أبيكس كرونوغراف الفضية للرجال",
        en: "Kairova Apex Chronograph silver men watch",
      },
    },
  },
  {
    slug: "kairova-sovereign-oud-eau-de-parfum-men-perfume",
    name: {
      ar: "Kairova سوفيرين عود",
      en: "Kairova Sovereign Oud",
    },
    description: {
      ar: "عطر عود رجالي عميق يوازن بين الخشب الدافئ واللمسة الدخانية لثبات فاخر.",
      en: "A deep oud fragrance balancing warm woods and a smoky trace for a luxurious finish.",
    },
    gender: "men",
    categoryKey: "perfume",
    subcategoryKey: "eauDeParfum",
    price: 2950,
    sku: "KRV-FEAT-004",
    stockQuantity: 15,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-sovereign-oud-eau-de-parfum-men-perfume.jpeg?updatedAt=1787938411787",
      alt: {
        ar: "عطر Kairova سوفيرين عود للرجال",
        en: "Kairova Sovereign Oud eau de parfum for men",
      },
    },
  },
  {
    slug: "kairova-noir-leather-100ml-men-perfume",
    name: {
      ar: "Kairova نوار ليذر",
      en: "Kairova Noir Leather",
    },
    description: {
      ar: "عطر جلدي داكن بحجم 100 مل، يفتح بنفحات نظيفة ثم يستقر على قاعدة دافئة وواثقة.",
      en: "A dark 100ml leather scent that opens cleanly before settling into a warm, confident base.",
    },
    gender: "men",
    categoryKey: "perfume",
    subcategoryKey: "eauDeParfum",
    price: 2650,
    sku: "KRV-FEAT-005",
    stockQuantity: 14,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-noir-leather-100ml-men-perfume.jpeg?updatedAt=1787938412049",
      alt: {
        ar: "عطر Kairova نوار ليذر 100 مل للرجال",
        en: "Kairova Noir Leather 100ml men perfume",
      },
    },
  },
  {
    slug: "kairova-bloom-vanilla-100ml-women-perfume",
    name: {
      ar: "Kairova بلوم فانيلا",
      en: "Kairova Bloom Vanilla",
    },
    description: {
      ar: "عطر نسائي بحجم 100 مل يمزج الفانيلا الناعمة مع لمسة زهرية مشرقة لحضور رقيق.",
      en: "A 100ml women fragrance blending soft vanilla with a luminous floral trace.",
    },
    gender: "women",
    categoryKey: "perfume",
    subcategoryKey: "eauDeParfum",
    price: 2450,
    sku: "KRV-FEAT-006",
    stockQuantity: 16,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-bloom-vanilla-100ml-women-perfume.jpeg?updatedAt=1787938411471",
      alt: {
        ar: "عطر Kairova بلوم فانيلا 100 مل للنساء",
        en: "Kairova Bloom Vanilla 100ml women perfume",
      },
    },
  },
  {
    slug: "kairova-titan-braided-leather-silver-men-bracelet",
    name: {
      ar: "Kairova تايتن جلد مضفر",
      en: "Kairova Titan Braided Leather",
    },
    description: {
      ar: "سوار رجالي من الجلد المضفر بتفاصيل فضية، مصمم ليضيف طبقة فاخرة دون مبالغة.",
      en: "A braided leather bracelet with silver details, designed to add quiet texture to a look.",
    },
    gender: "men",
    categoryKey: "accessories",
    subcategoryKey: "bracelets",
    price: 1850,
    sku: "KRV-FEAT-007",
    stockQuantity: 18,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-titan-braided-leather-silver-men-bracelet.jpeg?updatedAt=1787938525463",
      alt: {
        ar: "سوار Kairova تايتن من الجلد المضفر للرجال",
        en: "Kairova Titan braided leather silver men bracelet",
      },
    },
  },
  {
    slug: "kairova-monarch-silver-onyx-men-cufflinks",
    name: {
      ar: "Kairova مونارك أونيكس",
      en: "Kairova Monarch Onyx Cufflinks",
    },
    description: {
      ar: "أزرار أكمام رجالية بلمسة فضية وحجر أونيكس داكن لإكمال القمصان الرسمية بدقة.",
      en: "Silver-tone cufflinks with dark onyx detail, made to finish formal shirts with precision.",
    },
    gender: "men",
    categoryKey: "accessories",
    subcategoryKey: "cufflinks",
    price: 2100,
    sku: "KRV-FEAT-008",
    stockQuantity: 13,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-monarch-silver-onyx-men-cufflinks.jpeg?updatedAt=1787938525725",
      alt: {
        ar: "أزرار أكمام Kairova مونارك أونيكس للرجال",
        en: "Kairova Monarch silver onyx men cufflinks",
      },
    },
  },
  {
    slug: "kairova-aura-mesh-gold-women-watch",
    name: {
      ar: "Kairova أورا ميش",
      en: "Kairova Aura Mesh",
    },
    description: {
      ar: "ساعة نسائية بسوار شبكي ذهبي وميناء ناعم يمنح الإطلالة اليومية لمعة راقية.",
      en: "A women watch with a gold mesh bracelet and soft dial, bringing polish to everyday styling.",
    },
    gender: "women",
    categoryKey: "watches",
    subcategoryKey: "fashion",
    price: 5900,
    sku: "KRV-FEAT-009",
    stockQuantity: 11,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-aura-mesh-gold-women-watch.jpeg?updatedAt=1787938288552",
      alt: {
        ar: "ساعة Kairova أورا ميش الذهبية للنساء",
        en: "Kairova Aura Mesh gold women watch",
      },
    },
  },
  {
    slug: "kairova-elise-diamond-gold-women-watch",
    name: {
      ar: "Kairova إليز دايموند",
      en: "Kairova Elise Diamond",
    },
    description: {
      ar: "ساعة ذهبية نسائية بتفاصيل براقة حول الميناء، مصممة للحظات التي تحتاج لمسة احتفالية.",
      en: "A gold women watch with bright dial details, designed for moments that call for celebration.",
    },
    gender: "women",
    categoryKey: "watches",
    subcategoryKey: "classic",
    price: 8400,
    sku: "KRV-FEAT-010",
    stockQuantity: 8,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-elise-diamond-gold-women-watch.jpeg?updatedAt=1787938288475",
      alt: {
        ar: "ساعة Kairova إليز دايموند الذهبية للنساء",
        en: "Kairova Elise Diamond gold women watch",
      },
    },
  },
  {
    slug: "kairova-celeste-petite-gold-women-watch",
    name: {
      ar: "Kairova سيليست بيتيت",
      en: "Kairova Celeste Petite",
    },
    description: {
      ar: "ساعة ذهبية صغيرة الحجم بإحساس خفيف وتفاصيل متوازنة تناسب المعصم الناعم.",
      en: "A petite gold watch with a light feel and balanced detailing for an elegant wrist profile.",
    },
    gender: "women",
    categoryKey: "watches",
    subcategoryKey: "fashion",
    price: 6200,
    sku: "KRV-FEAT-011",
    stockQuantity: 10,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/watches/kairova-celeste-petite-gold-women-watch.jpeg?updatedAt=1787938288174",
      alt: {
        ar: "ساعة Kairova سيليست بيتيت الذهبية للنساء",
        en: "Kairova Celeste Petite gold women watch",
      },
    },
  },
  {
    slug: "kairova-elixir-jasmine-intense-women-perfume",
    name: {
      ar: "Kairova إلكسير ياسمين",
      en: "Kairova Elixir Jasmine",
    },
    description: {
      ar: "عطر ياسمين نسائي مكثف يفتتح بنفحات زهرية واضحة ويستقر على دفء ناعم.",
      en: "An intense jasmine fragrance with a clear floral opening and a soft warm drydown.",
    },
    gender: "women",
    categoryKey: "perfume",
    subcategoryKey: "eauDeParfum",
    price: 2850,
    sku: "KRV-FEAT-012",
    stockQuantity: 14,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-elixir-jasmine-intense-women-perfume.jpeg?updatedAt=1787938412858",
      alt: {
        ar: "عطر Kairova إلكسير ياسمين للنساء",
        en: "Kairova Elixir Jasmine intense women perfume",
      },
    },
  },
  {
    slug: "kairova-velvet-rose-eau-de-parfum-women-perfume",
    name: {
      ar: "Kairova فيلفت روز",
      en: "Kairova Velvet Rose",
    },
    description: {
      ar: "عطر وردي مخملي يجمع بين الرقة والعمق لملمس عطري أنثوي وطويل الحضور.",
      en: "A velvet rose fragrance combining softness and depth for a feminine, lasting presence.",
    },
    gender: "women",
    categoryKey: "perfume",
    subcategoryKey: "eauDeParfum",
    price: 2700,
    sku: "KRV-FEAT-013",
    stockQuantity: 15,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-velvet-rose-eau-de-parfum-women-perfume.jpeg?updatedAt=1787938412471",
      alt: {
        ar: "عطر Kairova فيلفت روز للنساء",
        en: "Kairova Velvet Rose eau de parfum for women",
      },
    },
  },
  {
    slug: "kairova-absolute-amber-intense-men-perfume",
    name: {
      ar: "Kairova أبسولوت عنبر",
      en: "Kairova Absolute Amber",
    },
    description: {
      ar: "عطر عنبري رجالي كثيف بطبقات دافئة تمنح حضورًا واضحًا من أول رشة.",
      en: "An intense amber fragrance with warm layers that create presence from the first spray.",
    },
    gender: "men",
    categoryKey: "perfume",
    subcategoryKey: "eauDeParfum",
    price: 3100,
    sku: "KRV-FEAT-014",
    stockQuantity: 12,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/perfumes/kairova-absolute-amber-intense-men-perfume.jpeg?updatedAt=1787938411136",
      alt: {
        ar: "عطر Kairova أبسولوت عنبر للرجال",
        en: "Kairova Absolute Amber intense men perfume",
      },
    },
  },
  {
    slug: "kairova-luna-crystal-pendant-gold-women-necklace",
    name: {
      ar: "Kairova لونا كريستال",
      en: "Kairova Luna Crystal Pendant",
    },
    description: {
      ar: "قلادة نسائية ذهبية بتعليقة كريستالية تضيف نقطة ضوء رقيقة فوق الإطلالات الهادئة.",
      en: "A gold women necklace with a crystal pendant that adds a precise point of light.",
    },
    gender: "women",
    categoryKey: "accessories",
    subcategoryKey: "necklaces",
    price: 1900,
    sku: "KRV-FEAT-015",
    stockQuantity: 17,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-luna-crystal-pendant-gold-women-necklace.jpeg?updatedAt=1787938525283",
      alt: {
        ar: "قلادة Kairova لونا كريستال الذهبية للنساء",
        en: "Kairova Luna Crystal Pendant gold women necklace",
      },
    },
  },
  {
    slug: "kairova-verona-pearl-charm-silver-women-bracelet",
    name: {
      ar: "Kairova فيرونا بيرل تشارم",
      en: "Kairova Verona Pearl Charm",
    },
    description: {
      ar: "سوار نسائي فضي بتعليقة لؤلؤية رقيقة، مناسب للتنسيق اليومي أو الهدايا الخاصة.",
      en: "A silver women bracelet with a delicate pearl charm, suited for daily styling or gifting.",
    },
    gender: "women",
    categoryKey: "accessories",
    subcategoryKey: "bracelets",
    price: 1750,
    sku: "KRV-FEAT-016",
    stockQuantity: 16,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-verona-pearl-charm-silver-women-bracelet.jpeg?updatedAt=1787938525041",
      alt: {
        ar: "سوار Kairova فيرونا بيرل تشارم الفضي للنساء",
        en: "Kairova Verona Pearl Charm silver women bracelet",
      },
    },
  },
  {
    slug: "kairova-solaris-hoop-gold-women-earrings",
    name: {
      ar: "Kairova سولاريس هوب",
      en: "Kairova Solaris Hoop",
    },
    description: {
      ar: "أقراط حلقية ذهبية بلمعة نظيفة وحجم متوازن يضيف لمسة نهائية فاخرة.",
      en: "Gold hoop earrings with a clean shine and balanced profile for a polished finish.",
    },
    gender: "women",
    categoryKey: "accessories",
    subcategoryKey: "earrings",
    price: 1650,
    sku: "KRV-FEAT-017",
    stockQuantity: 19,
    image: {
      url: "https://ik.imagekit.io/1pscfy7oah/kiarova/accessories/kairova-solaris-hoop-gold-women-earrings.jpeg?updatedAt=1787938524934",
      alt: {
        ar: "أقراط Kairova سولاريس هوب الذهبية للنساء",
        en: "Kairova Solaris Hoop gold women earrings",
      },
    },
  },
] satisfies FeaturedProductSeed[];

function getId(document: { _id: unknown }) {
  return (document._id as Types.ObjectId).toString();
}

function toObjectId(id: string) {
  return new Types.ObjectId(id);
}

function getOptionalId(id: unknown) {
  return id ? String(id) : null;
}

async function ensureCategory(
  gender: CategoryGender,
  seed: CategorySeed,
  parentCategory: ICategory | null,
): Promise<ICategory> {
  const parentCategoryId = parentCategory ? getId(parentCategory) : null;
  const categoryQuery = {
    gender,
    "name.en": seed.name.en,
    parentCategory: parentCategoryId,
  };
  const existing =
    (await Category.findOne({ ...categoryQuery, deletedAt: null })) ||
    (await Category.findOne(categoryQuery));

  if (existing) {
    if (existing.slug !== seed.slug) {
      const slugOwner = await Category.findOne({ slug: seed.slug });

      if (slugOwner && getId(slugOwner) !== getId(existing)) {
        throw new Error(`Category slug conflict for "${seed.slug}"`);
      }
    }

    existing.name = seed.name;
    existing.slug = seed.slug;
    existing.deletedAt = null;
    await existing.save();
    return existing;
  }

  const existingBySlug = await Category.findOne({ slug: seed.slug });

  if (existingBySlug) {
    if (
      existingBySlug.gender !== gender ||
      getOptionalId(existingBySlug.parentCategory) !== parentCategoryId
    ) {
      throw new Error(`Category slug conflict for "${seed.slug}"`);
    }

    existingBySlug.name = seed.name;
    existingBySlug.deletedAt = null;
    await existingBySlug.save();
    return existingBySlug;
  }

  return Category.create({
    name: seed.name,
    slug: seed.slug,
    gender,
    parentCategory: parentCategoryId,
  } as unknown as ICategory);
}

async function ensureProductCategories(product: FeaturedProductSeed) {
  const parentSeed = categorySeeds[product.gender][product.categoryKey];
  const subcategorySeed = parentSeed.subcategories[product.subcategoryKey];

  if (!subcategorySeed) {
    throw new Error(
      `Missing ${product.gender} subcategory "${product.subcategoryKey}"`,
    );
  }

  const category = await ensureCategory(product.gender, parentSeed, null);
  const subcategory = await ensureCategory(
    product.gender,
    subcategorySeed,
    category,
  );

  return { category, subcategory };
}

async function getAvailableSku(baseSku: string, excludeProductId?: string) {
  let sku = baseSku;
  let suffix = 2;

  while (
    await Product.exists({
      sku,
      deletedAt: null,
      ...(excludeProductId ? { _id: { $ne: excludeProductId } } : {}),
    })
  ) {
    sku = `${baseSku}-${suffix}`;
    suffix += 1;
  }

  return sku;
}

async function ensurePrimaryImage(
  product: IProduct,
  seed: FeaturedProductSeed,
) {
  const productId = getId(product);
  const productObjectId = toObjectId(productId);
  const publicId = `featured-products/${seed.slug}`;
  let image = await ProductImage.findOne({
    product: productObjectId,
    publicId,
  });

  await ProductImage.updateMany(
    { product: productObjectId, deletedAt: null },
    { isPrimary: false },
  );

  if (image) {
    image.url = seed.image.url;
    image.alt = seed.image.alt;
    image.isPrimary = true;
    image.order = 0;
    image.deletedAt = null;
    await image.save();
  } else {
    image = await ProductImage.create({
      product: productObjectId,
      url: seed.image.url,
      publicId,
      alt: seed.image.alt,
      isPrimary: true,
      order: 0,
    } as unknown as IProductImage);
  }

  await Product.updateOne(
    { _id: productObjectId },
    { $addToSet: { images: image._id } },
  );
}

async function ensureProduct(seed: FeaturedProductSeed) {
  const { category, subcategory } = await ensureProductCategories(seed);
  const existing =
    (await Product.findOne({ slug: seed.slug, deletedAt: null })) ||
    (await Product.findOne({ slug: seed.slug }));
  const sku = await getAvailableSku(
    existing?.sku || seed.sku,
    existing ? getId(existing) : undefined,
  );

  if (existing) {
    existing.name = seed.name;
    existing.description = seed.description;
    existing.slug = seed.slug;
    existing.gender = seed.gender;
    existing.category = toObjectId(getId(category));
    existing.subcategory = toObjectId(getId(subcategory));
    existing.sku = sku;
    existing.price =
      typeof existing.price === "number" ? existing.price : seed.price;
    existing.stockQuantity =
      typeof existing.stockQuantity === "number"
        ? existing.stockQuantity
        : seed.stockQuantity;
    existing.lowStockThreshold =
      typeof existing.lowStockThreshold === "number"
        ? existing.lowStockThreshold
        : 5;
    existing.deletedAt = null;
    await existing.save();
    await ensurePrimaryImage(existing, seed);
    return { created: false };
  }

  const product = await Product.create({
    name: seed.name,
    description: seed.description,
    slug: seed.slug,
    gender: seed.gender,
    category: toObjectId(getId(category)),
    subcategory: toObjectId(getId(subcategory)),
    price: seed.price,
    sku,
    stockQuantity: seed.stockQuantity,
    lowStockThreshold: 5,
    images: [],
    deletedAt: null,
  } as unknown as IProduct);

  await ensurePrimaryImage(product, seed);
  return { created: true };
}

export async function seedFeaturedProducts(): Promise<SeedResult> {
  let productsCreated = 0;
  let productsUpdated = 0;

  for (const product of featuredProducts) {
    const result = await ensureProduct(product);

    if (result.created) {
      productsCreated += 1;
    } else {
      productsUpdated += 1;
    }
  }

  return { productsCreated, productsUpdated };
}

async function runSeedFeaturedProducts(): Promise<number> {
  try {
    await connectDB();

    const result = await seedFeaturedProducts();

    console.log(
      `Featured products seeded. Created ${result.productsCreated} products. Updated ${result.productsUpdated} products.`,
    );
    return 0;
  } catch (error) {
    console.error("Failed to seed featured products:", error);
    return 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const exitCode = await runSeedFeaturedProducts();
  process.exit(exitCode);
}
