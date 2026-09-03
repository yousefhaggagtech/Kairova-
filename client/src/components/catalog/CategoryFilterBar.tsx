"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { Product } from "@/domain/entities/api";
import type { Locale } from "@/src/i18n/config";

export const CATALOG_CATEGORY_FILTERS = [
  { labelKey: "all", value: "all" },
  { labelKey: "watches", value: "watches" },
  { labelKey: "perfume", value: "perfume" },
  { labelKey: "accessories", value: "accessories" },
  { labelKey: "belts", value: "belts" },
  { labelKey: "wallets", value: "wallets" },
] as const;

export type CatalogCategoryFilterValue =
  (typeof CATALOG_CATEGORY_FILTERS)[number]["value"];

export type CatalogCategoryValue = Exclude<
  CatalogCategoryFilterValue,
  "all"
>;

export const CATALOG_CATEGORY_VALUES = CATALOG_CATEGORY_FILTERS.filter(
  (filter) => filter.value !== "all",
).map((filter) => filter.value) as CatalogCategoryValue[];

const WOMEN_CATALOG_CATEGORY_FILTERS = CATALOG_CATEGORY_FILTERS.filter(
  (filter) => filter.value !== "belts" && filter.value !== "wallets",
);

type CategoryFilterBarProps = {
  gender: Product["gender"];
};

export function getCatalogSectionId(
  gender: Product["gender"],
  category: CatalogCategoryFilterValue,
) {
  return `${gender}-catalog-${category}`;
}

export function getCatalogCategoryFilters(gender: Product["gender"]) {
  return gender === "women"
    ? WOMEN_CATALOG_CATEGORY_FILTERS
    : CATALOG_CATEGORY_FILTERS;
}

export function getCatalogCategoryValues(gender: Product["gender"]) {
  return getCatalogCategoryFilters(gender)
    .filter((filter) => filter.value !== "all")
    .map((filter) => filter.value) as CatalogCategoryValue[];
}

export default function CategoryFilterBar({ gender }: CategoryFilterBarProps) {
  const t = useTranslations("catalog");
  const locale = useLocale() as Locale;
  const [activeCategory, setActiveCategory] =
    useState<CatalogCategoryFilterValue>("all");
  const categoryFilters = getCatalogCategoryFilters(gender);
  const isRtl = locale === "ar";

  useEffect(() => {
    let intersectionObserver: IntersectionObserver | null = null;
    let animationFrameId: number | null = null;

    const connectObserver = () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(() => {
        const sectionElements = categoryFilters.map((category) => ({
          value: category.value,
          element: document.getElementById(
            getCatalogSectionId(gender, category.value),
          ),
        })).filter(
          (
            section,
          ): section is {
            value: CatalogCategoryFilterValue;
            element: HTMLElement;
          } => Boolean(section.element),
        );

        intersectionObserver?.disconnect();

        if (sectionElements.length === 0) {
          return;
        }

        intersectionObserver = new IntersectionObserver(
          (entries) => {
            const visibleEntry = entries
              .filter((entry) => entry.isIntersecting)
              .sort((firstEntry, secondEntry) => {
                return (
                  Math.abs(firstEntry.boundingClientRect.top) -
                  Math.abs(secondEntry.boundingClientRect.top)
                );
              })[0];

            if (!visibleEntry) {
              return;
            }

            const activeSection = sectionElements.find(
              (section) => section.element === visibleEntry.target,
            );

            if (activeSection) {
              setActiveCategory(activeSection.value);
            }
          },
          {
            rootMargin: "-30% 0px -55% 0px",
            threshold: 0,
          },
        );

        sectionElements.forEach((section) =>
          intersectionObserver?.observe(section.element),
        );
      });
    };

    connectObserver();

    const mutationObserver = new MutationObserver(connectObserver);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      intersectionObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, [categoryFilters, gender]);

  const handleCategoryClick = (
    event: MouseEvent<HTMLAnchorElement>,
    category: CatalogCategoryFilterValue,
  ) => {
    event.preventDefault();
    const targetElement = document.getElementById(
      getCatalogSectionId(gender, category),
    );

    if (!targetElement) {
      return;
    }

    setActiveCategory(category);
    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${targetElement.id}`);
  };

  return (
    <nav
      aria-label={t("categoryFilterLabel", {
        collection: t(gender === "men" ? "menCollection" : "womenCollection"),
      })}
      className={`mb-20 w-full max-w-full overflow-hidden px-4 py-7 sm:px-6 md:px-10 ${
        isRtl ? "font-display-ar" : "font-display-en"
      }`}
      dir="ltr"
    >
      <ul
        className={`mx-auto flex w-auto max-w-full flex-wrap justify-center gap-x-4 gap-y-3 text-center text-body-lg font-medium leading-heading text-black sm:grid sm:w-full sm:flex-nowrap sm:gap-x-4 sm:gap-y-6 lg:text-h3 ${
          categoryFilters.length === 4
            ? "sm:grid-cols-4"
            : "sm:grid-cols-6"
        }`}
        dir="ltr"
      >
        {categoryFilters.map((category) => {
          const isActive = category.value === activeCategory;

          return (
            <li
              key={category.value}
              className="w-auto min-w-0 sm:overflow-hidden"
            >
              <a
                aria-current={isActive ? "location" : undefined}
                className={`group inline-flex min-h-11 w-auto min-w-0 cursor-pointer items-center justify-center px-1 text-center transition-[color] duration-300 ease-out focus-visible:outline-none sm:w-full ${
                  isActive
                    ? "text-black"
                    : "hover:text-hover-muted focus-visible:text-hover-muted"
                }`}
                href={`#${getCatalogSectionId(gender, category.value)}`}
                onClick={(event) => handleCategoryClick(event, category.value)}
              >
                <span
                  className={`relative inline-flex min-w-0 max-w-full justify-center whitespace-nowrap border-b pb-3 transition-[border-color] duration-500 ease-out ${
                    isActive ? "font-semibold" : ""
                  } ${
                    isActive
                      ? "border-black"
                      : "border-black/15 group-hover:border-hover-muted group-focus-visible:border-hover-muted"
                  }`}
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  {t(category.labelKey)}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
