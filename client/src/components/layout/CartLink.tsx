"use client";

import { useTranslations } from "next-intl";

import { useCartStore } from "@/application/store/cartStore";
import { Link } from "@/src/i18n/navigation";

export default function CartLink() {
  const t = useTranslations("checkout");
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <Link
      href="/cart"
      className="inline-flex h-11 min-w-11 items-center justify-center border border-border-light ps-3 pe-3 text-caption font-medium transition-colors hover:bg-surface-light"
      aria-label={t("yourCart")}
    >
      {hasHydrated ? itemCount : 0}
    </Link>
  );
}
