import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import CatalogHome from "@/components/catalog/CatalogHome";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function HomePage() {
  return <CatalogHome />;
}
