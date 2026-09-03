"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useCartStore } from "@/application/store/cartStore";
import OptimizedProductImage from "@/components/media/OptimizedProductImage";
import { Link, useRouter } from "@/src/i18n/navigation";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SupportedLocale = "ar" | "en";

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="20"
      viewBox="0 0 32 32"
      width="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m8 8 16 16M24 8 8 24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const t = useTranslations("catalog");
  const tCheckout = useTranslations("checkout");
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const total = useCartStore((state) => state.getTotal());

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  function handleCheckout() {
    onClose();
    router.push("/checkout");
  }

  return (
    <div
      className={`fixed inset-0 z-[70] transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <button
        type="button"
        aria-label={tCheckout("closeCart")}
        className={`absolute inset-0 bg-bg-primary/45 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        data-open={isOpen}
        className="kairova-cart-drawer absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-bg-secondary text-fg-secondary shadow-[0_0_32px_rgba(10,10,10,0.16)] transition-transform duration-300 ease-out"
      >
        <header className="flex min-h-20 items-center justify-between border-b border-border-light px-5">
          <h2 id="cart-drawer-title" className="text-h3 leading-heading">
            {tCheckout("yourCart")}
          </h2>
          <button
            type="button"
            aria-label={tCheckout("closeCart")}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center transition-colors hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-5">
          {!hasHydrated ? (
            <p className="text-body text-fg-muted">{t("loading")}</p>
          ) : items.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <p className="mb-5 text-body-lg">{tCheckout("emptyCart")}</p>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center px-3 text-body text-fg-muted underline transition-colors hover:text-hover-muted"
                onClick={onClose}
              >
                {tCheckout("continueShopping")}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <article
                  key={item.productId}
                  className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-3 border-b border-border-light pb-5 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-4"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-[84px] bg-surface-light sm:h-[88px]"
                    onClick={onClose}
                  >
                    {item.imageUrl ? (
                      <OptimizedProductImage
                        src={item.imageUrl}
                        alt={item.name[locale] || item.name.en}
                        fill
                        variant="thumbnail"
                        sizes="88px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-caption text-fg-muted">
                        {t("noImage")}
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
                      <Link
                        href={`/product/${item.slug}`}
                        className="break-words text-body transition-colors hover:text-hover-muted"
                        onClick={onClose}
                      >
                        {item.name[locale] || item.name.en}
                      </Link>
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center text-caption text-fg-muted underline transition-colors hover:text-hover-muted"
                        onClick={() => removeItem(item.productId)}
                      >
                        {tCheckout("remove")}
                      </button>
                    </div>

                    <p className="mt-1 text-caption text-fg-muted">
                      {item.price.toLocaleString(locale)} {t("egp")}
                    </p>

                    <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="inline-grid h-11 grid-cols-[2.75rem_3rem_2.75rem] overflow-hidden border border-border-light">
                        <button
                          type="button"
                          aria-label={tCheckout("decreaseQuantity")}
                          className="h-full border-e border-border-light transition-colors hover:bg-surface-light"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <span className="flex h-full items-center justify-center text-center text-body">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={tCheckout("increaseQuantity")}
                          disabled={item.quantity >= item.stockQuantity}
                          className="h-full border-s border-border-light transition-colors hover:bg-surface-light disabled:opacity-50"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <p className="text-body font-medium">
                        {(item.price * item.quantity).toLocaleString(locale)}{" "}
                        {t("egp")}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {hasHydrated && items.length > 0 ? (
          <footer className="border-t border-border-light px-5 py-5">
            <div className="mb-5 flex items-center justify-between text-body-lg">
              <span>{tCheckout("total")}</span>
              <span className="font-medium">
                {total.toLocaleString(locale)} {t("egp")}
              </span>
            </div>
            <button
              type="button"
              className="min-h-12 w-full cursor-pointer bg-fg-secondary px-4 py-3 text-bg-secondary transition-opacity hover:opacity-90"
              onClick={handleCheckout}
            >
              {tCheckout("proceedToCheckout")}
            </button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
