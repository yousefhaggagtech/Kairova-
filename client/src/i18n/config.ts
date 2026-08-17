export const locales = ["ar", "en"] as const;
export const defaultLocale = "ar" as const;
export const localePrefix = "as-needed" as const;

export type Locale = (typeof locales)[number];
