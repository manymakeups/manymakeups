import type { Metadata } from "next";
import { locales, type Locale } from "./config";
import { localePath } from "./path";
import { getLocale } from "./server";

const ogLocales: Record<Locale, string> = {
  es: "es_ES",
  en: "en_GB",
  fr: "fr_FR",
};

export function languageMap(path: string) {
  return {
    es: localePath("es", path),
    en: localePath("en", path),
    fr: localePath("fr", path),
    "x-default": localePath("es", path),
  };
}

export async function pageMeta({
  path,
  title,
  description,
  absolute = false,
}: {
  path: string;
  title: string;
  description: string;
  absolute?: boolean;
}): Promise<Metadata> {
  const locale = await getLocale();
  const canonical = localePath(locale, path);
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: languageMap(path),
    },
    openGraph: {
      url: canonical,
      title,
      description,
      locale: ogLocales[locale],
    },
  };
}

export { locales };
