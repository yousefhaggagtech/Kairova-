"use client";

import { useLocale } from "next-intl";

import type { Locale } from "@/src/i18n/config";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale: Locale = locale === "ar" ? "en" : "ar";
  const label = nextLocale.toUpperCase();

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      as={nextLocale === "ar" ? "/" : undefined}
      onMouseEnter={() => router.prefetch(pathname, { locale: nextLocale })}
      onFocus={() => router.prefetch(pathname, { locale: nextLocale })}
      className="inline-flex h-10 min-w-10 items-center justify-center border border-border-light ps-3 pe-3 text-caption font-medium transition-colors hover:bg-surface-light"
      aria-label={`Switch language to ${label}`}
    >
      {label}
    </Link>
  );
}
