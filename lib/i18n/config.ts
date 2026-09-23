export const locales = ["es", "en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const localeLabels: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  fr: "FR",
};

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
