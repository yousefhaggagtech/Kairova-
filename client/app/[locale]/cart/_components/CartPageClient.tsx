"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { useCartStore, type CartItem } from "@/application/store/cartStore";
import OptimizedProductImage from "@/components/media/OptimizedProductImage";
import type { Locale } from "@/src/i18n/config";
import { Link, useRouter } from "@/src/i18n/navigation";

type CartPageClientProps = {
  locale: Locale;
};

const EMPTY_CART_IMAGE_SRC =
  "https://ik.imagekit.io/1pscfy7oah/kiarova/kairova-solaris-emerald-pendant-gold-women-necklace.jpeg?tr=w-1600,q-100";

const SERVICE_STEPS = [
  { id: "reserve", number: "01" },
  { id: "confirm", number: "02" },
  { id: "receive", number: "03" },
] as const;

function formatCurrency(amount: number, locale: Locale, egpLabel: string) {
  const formattedAmount = new Intl.NumberFormat(
    locale === "ar" ? "ar-EG" : "en-EG",
    {
      maximumFractionDigits: 0,
    },
  ).format(amount);

  return locale === "ar"
    ? `${formattedAmount} ${egpLabel}`
    : `${egpLabel} ${formattedAmount}`;
}

function QuantityControls({
  item,
  onUpdateQuantity,
}: {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}) {
  const t = useTranslations("checkout");

  return (
    <div className="inline-grid h-11 grid-cols-[2.75rem_3.25rem_2.75rem] overflow-hidden border border-border-light bg-bg-secondary text-fg-secondary">
      <button
        type="button"
        aria-label={t("decreaseQuantity")}
        className="flex h-full items-center justify-center text-body-lg transition-colors hover:bg-surface-light focus-visible:bg-surface-light focus-visible:outline-none"
        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
      >
        -
      </button>
      <span className="flex h-full items-center justify-center border-x border-border-light text-body font-medium">
        {item.quantity}
      </span>
      <button
        type="button"
        aria-label={t("increaseQuantity")}
        disabled={item.quantity >= item.stockQuantity}
        className="flex h-full items-center justify-center text-body-lg transition-colors hover:bg-surface-light focus-visible:bg-surface-light focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
      >
        +
      </button>
    </div>
  );
}

function LoadingCart({ locale }: CartPageClientProps) {
  const tCatalog = useTranslations("catalog");
  const tCheckout = useTranslations("checkout");
  const isRtl = locale === "ar";

  return (
    <div
      className="bg-bg-secondary px-4 py-16 text-fg-secondary sm:px-6 sm:py-20 md:px-10"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-[var(--max-content)]">
        <p
          className={`text-caption font-medium text-fg-secondary/55 ${
            isRtl ? "" : "uppercase tracking-[0.32em]"
          }`}
        >
          {tCheckout("cartPage.eyebrow")}
        </p>
        <h1 className="mt-5 text-3xl leading-heading sm:text-h1">
          {tCheckout("yourCart")}
        </h1>
        <p className="mt-4 text-body-lg leading-body text-fg-muted">
          {tCatalog("loading")}
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-5" aria-hidden="true">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 border-t border-border-light py-6 sm:grid-cols-[7rem_1fr]"
              >
                <div className="aspect-[4/5] bg-surface-light" />
                <div className="space-y-4 pt-2">
                  <div className="h-4 w-28 bg-surface-light" />
                  <div className="h-7 w-3/4 bg-surface-light" />
                  <div className="h-4 w-40 bg-surface-light" />
                </div>
              </div>
            ))}
          </div>
          <div className="min-h-72 border border-border-light bg-surface-light" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function EmptyCart({ locale }: CartPageClientProps) {
  const tCheckout = useTranslations("checkout");
  const isRtl = locale === "ar";

  return (
    <section
      aria-labelledby="empty-cart-heading"
      className="relative isolate overflow-hidden bg-bg-primary text-fg-primary"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 z-0">
        <Image
          alt={tCheckout("cartPage.emptyImageAlt")}
          className="object-cover object-[50%_42%] [filter:grayscale(1)_contrast(1.15)_brightness(0.56)]"
          fill
          preload
          quality={100}
          sizes="100vw"
          src={EMPTY_CART_IMAGE_SRC}
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 z-10 bg-bg-primary/48" />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(10,10,10,0.14)_0%,rgba(10,10,10,0.42)_48%,rgba(10,10,10,0.9)_100%)]"
      />

      <div className="relative z-20 mx-auto flex min-h-[72svh] w-full max-w-[var(--max-content)] flex-col justify-end px-4 pb-16 pt-20 text-start sm:px-6 md:px-10 lg:pb-20">
        <p
          className={`text-caption font-medium text-border-light/82 ${
            isRtl ? "" : "uppercase tracking-[0.32em]"
          }`}
        >
          {tCheckout("cartPage.emptyEyebrow")}
        </p>
        <h1
          id="empty-cart-heading"
          className="mt-5 max-w-3xl text-4xl leading-display sm:text-h1 lg:text-display"
        >
          {tCheckout("emptyCart")}
        </h1>
        <p className="mt-5 max-w-xl text-body-lg leading-body text-border-light/82">
          {tCheckout("cartPage.emptyBody")}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/women"
            className="inline-flex min-h-12 items-center justify-center border border-fg-primary bg-fg-primary px-7 py-3 text-caption font-medium text-fg-secondary transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-primary"
          >
            {tCheckout("cartPage.shopWomen")}
          </Link>
          <Link
            href="/men"
            className="inline-flex min-h-12 items-center justify-center border border-fg-primary/70 px-7 py-3 text-caption font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-fg-secondary focus-visible:bg-fg-primary focus-visible:text-fg-secondary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-primary"
          >
            {tCheckout("cartPage.shopMen")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CartPageClient({ locale }: CartPageClientProps) {
  const tCatalog = useTranslations("catalog");
  const tCheckout = useTranslations("checkout");
  const router = useRouter();
  const isRtl = locale === "ar";

  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const total = useCartStore((state) => state.getTotal());
  const itemCount = useCartStore((state) => state.getItemCount());
  const egpLabel = tCatalog("egp");

  if (!hasHydrated) {
    return <LoadingCart locale={locale} />;
  }

  if (items.length === 0) {
    return <EmptyCart locale={locale} />;
  }

  return (
    <div
      className="bg-bg-secondary px-4 py-16 text-fg-secondary sm:px-6 sm:py-20 md:px-10 lg:py-24"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-[var(--max-content)]">
        <section
          aria-labelledby="cart-heading"
          className="grid gap-8 border-b border-border-light pb-10 text-start lg:grid-cols-[minmax(0,0.86fr)_minmax(20rem,0.44fr)] lg:items-end"
        >
          <div>
            <p
              className={`text-caption font-medium text-fg-secondary/55 ${
                isRtl ? "" : "uppercase tracking-[0.32em]"
              }`}
            >
              {tCheckout("cartPage.eyebrow")}
            </p>
            <h1
              id="cart-heading"
              className="mt-5 max-w-4xl text-3xl leading-heading sm:text-h1"
            >
              {tCheckout("yourCart")}
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg leading-body text-fg-secondary/68">
              {tCheckout("cartPage.intro")}
            </p>
          </div>

          <div className="border border-fg-secondary/12 px-5 py-4">
            <p className="text-caption font-medium text-fg-muted">
              {tCheckout("cartPage.cartItemCount", { count: itemCount })}
            </p>
            <p className="mt-2 text-h3 leading-heading">
              {formatCurrency(total, locale, egpLabel)}
            </p>
          </div>
        </section>

        <div className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <section aria-label={tCheckout("yourCart")} className="text-start">
            <div className="divide-y divide-border-light border-y border-border-light">
              {items.map((item) => {
                const productName = item.name[locale] || item.name.en;
                const lineTotal = item.price * item.quantity;

                return (
                  <article
                    key={item.productId}
                    className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 py-6 sm:grid-cols-[7.5rem_minmax(0,1fr)] lg:grid-cols-[8.5rem_minmax(0,1fr)_minmax(9rem,auto)]"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      className="group relative aspect-[4/5] overflow-hidden bg-surface-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary"
                    >
                      {item.imageUrl ? (
                        <OptimizedProductImage
                          src={item.imageUrl}
                          alt={productName}
                          fill
                          variant="thumbnail"
                          sizes="(min-width: 1024px) 136px, (min-width: 640px) 120px, 104px"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center px-3 text-center text-caption text-fg-muted">
                          {tCatalog("noImage")}
                        </span>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <p
                        className={`text-caption font-medium text-fg-muted ${
                          isRtl ? "" : "uppercase tracking-[0.2em]"
                        }`}
                      >
                        {tCheckout("cartPage.lineItem")}
                      </p>
                      <h2 className="mt-3 text-body-lg font-medium leading-heading sm:text-h3">
                        <Link
                          href={`/product/${item.slug}`}
                          className="inline-flex min-h-11 items-center break-words transition-colors hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none"
                        >
                          {productName}
                        </Link>
                      </h2>
                      <p className="mt-3 text-body leading-body text-fg-secondary/66">
                        {tCheckout("cartPage.unitPrice")}{" "}
                        <span className="font-medium text-fg-secondary">
                          {formatCurrency(item.price, locale, egpLabel)}
                        </span>
                      </p>
                      {item.quantity >= item.stockQuantity ? (
                        <p className="mt-3 text-caption leading-body text-fg-muted">
                          {tCheckout("cartPage.stockLimit", {
                            count: item.stockQuantity,
                          })}
                        </p>
                      ) : null}
                    </div>

                    <div className="col-span-2 flex flex-col items-start gap-4 sm:col-span-1 sm:col-start-2 lg:col-start-auto lg:items-end">
                      <div className="text-start lg:text-end">
                        <p className="text-caption font-medium text-fg-muted">
                          {tCheckout("cartPage.itemTotal")}
                        </p>
                        <p className="mt-2 text-body-lg font-medium">
                          {formatCurrency(lineTotal, locale, egpLabel)}
                        </p>
                      </div>

                      <QuantityControls
                        item={item}
                        onUpdateQuantity={updateQuantity}
                      />

                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center text-caption font-medium text-fg-muted underline underline-offset-4 transition-colors hover:text-fg-secondary focus-visible:text-fg-secondary focus-visible:outline-none"
                        onClick={() => removeItem(item.productId)}
                      >
                        {tCheckout("remove")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="border border-fg-secondary/12 bg-bg-secondary p-6 text-start shadow-[0_24px_70px_rgba(10,10,10,0.08)] lg:sticky lg:top-28">
            <p
              className={`text-caption font-medium text-fg-secondary/55 ${
                isRtl ? "" : "uppercase tracking-[0.28em]"
              }`}
            >
              {tCheckout("cartPage.summaryEyebrow")}
            </p>
            <h2 className="mt-4 text-h3 leading-heading">
              {tCheckout("cartPage.summaryTitle")}
            </h2>

            <dl className="mt-7 space-y-4 border-y border-border-light py-5">
              <div className="grid grid-cols-1 gap-1 text-body sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                <dt className="text-fg-muted">{tCheckout("subtotal")}</dt>
                <dd className="break-words font-medium sm:text-end">
                  {formatCurrency(total, locale, egpLabel)}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 text-body-lg sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                <dt>{tCheckout("total")}</dt>
                <dd className="break-words font-medium sm:text-end">
                  {formatCurrency(total, locale, egpLabel)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="mt-6 min-h-12 w-full cursor-pointer bg-fg-secondary px-6 py-3 text-caption font-medium uppercase text-bg-secondary transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary"
            >
              {tCheckout("proceedToCheckout")}
            </button>

            <p className="mt-5 text-caption leading-body text-fg-muted">
              {tCheckout("cartPage.depositNote")}
            </p>

            <div className="mt-8 border-t border-border-light pt-6">
              <h3 className="text-body font-medium">
                {tCheckout("cartPage.serviceTitle")}
              </h3>
              <ol className="mt-5 space-y-4">
                {SERVICE_STEPS.map((step) => (
                  <li key={step.id} className="grid grid-cols-[2.5rem_1fr] gap-3">
                    <span className="text-caption font-medium text-fg-muted">
                      {step.number}
                    </span>
                    <span className="text-caption leading-body text-fg-secondary/70">
                      {tCheckout(`cartPage.steps.${step.id}`)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
