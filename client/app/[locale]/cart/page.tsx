"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/application/store/cartStore";
import { Link } from "@/src/i18n/navigation";

type SupportedLocale = "ar" | "en";

export default function CartPage() {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("catalog");
  const tCheckout = useTranslations("checkout");
  const router = useRouter();

  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const total = useCartStore((state) => state.getTotal());

  if (!hasHydrated) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {t("loading")}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-center md:px-10">
        <h1 className="mb-4 text-h2 leading-heading">
          {tCheckout("emptyCart")}
        </h1>
        <Link href="/" className="text-fg-muted underline">
          {tCheckout("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 md:px-10">
      <h1 className="mb-8 text-h1 leading-heading">{tCheckout("yourCart")}</h1>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-6 border-b border-border-light pb-6 dark:border-border-subtle"
          >
            <div className="relative h-24 w-24 flex-shrink-0 bg-surface-light dark:bg-surface-dark">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name[locale] || item.name.en}
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-caption text-fg-muted">
                  {t("noImage")}
                </div>
              )}
            </div>
            <div className="flex-1">
              <Link href={`/product/${item.slug}`} className="text-body-lg">
                {item.name[locale] || item.name.en}
              </Link>
              <p className="mt-1 text-body text-fg-muted">
                {item.price.toLocaleString(locale)} {t("egp")}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  className="h-8 w-8 border border-border-light dark:border-border-subtle"
                  aria-label={tCheckout("decreaseQuantity")}
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  disabled={item.quantity >= item.stockQuantity}
                  className="h-8 w-8 border border-border-light disabled:opacity-50 dark:border-border-subtle"
                  aria-label={tCheckout("increaseQuantity")}
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-end">
              <p className="text-body-lg font-medium">
                {(item.price * item.quantity).toLocaleString(locale)} {t("egp")}
              </p>
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="mt-2 text-caption text-fg-muted underline"
              >
                {tCheckout("remove")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-surface-light p-6 dark:bg-surface-dark">
        <div className="mb-6 flex justify-between text-h3 leading-heading">
          <span>{tCheckout("total")}</span>
          <span>
            {total.toLocaleString(locale)} {t("egp")}
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/checkout`)}
          className="w-full bg-fg-secondary py-4 text-bg-secondary hover:opacity-90 dark:bg-fg-primary dark:text-bg-primary"
        >
          {tCheckout("proceedToCheckout")}
        </button>
      </div>
    </div>
  );
}
