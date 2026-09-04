import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import "../globals.css";
import Footer from "../../src/components/layout/Footer";
import Navbar from "../../src/components/layout/Navbar";
import QueryProvider from "../../src/application/providers/QueryProvider";
import ReservationJourneySection from "../../src/components/home/ReservationJourneySection";
import type {
  ApiResponse,
  FeaturedProduct,
} from "../../src/domain/entities/api";
import { locales } from "../../src/i18n/config";
import { fraunces, inter, plexArabic } from "../../src/lib/fonts";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const LOCAL_API_BASE_URL = "http://localhost:4000";
const FEATURED_PRODUCTS_REVALIDATE_SECONDS = 300;
let hasLoggedFeaturedProductsLoadFailure = false;

function getApiBaseUrl() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    LOCAL_API_BASE_URL
  ).replace(/\/+$/, "");
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function logFeaturedProductsLoadFailure(message: string) {
  if (hasLoggedFeaturedProductsLoadFailure) {
    return;
  }

  hasLoggedFeaturedProductsLoadFailure = true;
  console.warn(message);
}

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/products/featured`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: FEATURED_PRODUCTS_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      logFeaturedProductsLoadFailure(
        `Failed to load featured products for navbar: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const payload = (await response.json()) as ApiResponse<{
      products: FeaturedProduct[];
    }>;

    return payload.data?.products ?? [];
  } catch (error) {
    logFeaturedProductsLoadFailure(
      `Failed to load featured products for navbar: ${getErrorMessage(error)}`,
    );
    return [];
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";
  const featuredProducts = await getFeaturedProducts();

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fraunces.variable} ${plexArabic.variable} ${inter.variable}`}
    >
      <body className="min-h-screen">
        <NextIntlClientProvider locale={locale}>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar featuredProducts={featuredProducts} />
              <main className="flex-1">{children}</main>
              <ReservationJourneySection />
              <Footer />
            </div>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
