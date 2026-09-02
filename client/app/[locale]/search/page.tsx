import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import SearchPageClient from "./_components/SearchPageClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

function getSearchQuery(value: string | string[] | undefined) {
  const query = Array.isArray(value) ? value[0] : value;

  return (query || "").trim().replace(/\s+/g, " ");
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const [{ locale }, queryParams] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "search.metadata" });
  const query = getSearchQuery(queryParams.q);

  return {
    title: query ? t("titleWithQuery", { query }) : t("title"),
    description: t("description"),
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const queryParams = await searchParams;

  return <SearchPageClient query={getSearchQuery(queryParams.q)} />;
}
