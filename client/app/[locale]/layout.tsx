import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import "../globals.css";
import Footer from "../../src/components/layout/Footer";
import Navbar from "../../src/components/layout/Navbar";
import QueryProvider from "../../src/application/providers/QueryProvider";
import ReservationJourneySection from "../../src/components/home/ReservationJourneySection";
import { locales } from "../../src/i18n/config";
import { fraunces, inter, plexArabic } from "../../src/lib/fonts";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

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
              <Navbar />
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
