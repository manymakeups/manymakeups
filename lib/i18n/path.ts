import { defaultLocale, isLocale, type Locale } from "./config";

export function stripLocale(pathname: string) {
  const match = pathname.match(/^\/(en|fr)(?=\/|$)/);
  return match ? pathname.slice(match[0].length) || "/" : pathname;
}

export function localePath(locale: Locale, path = "/") {
  const [pathname, hash] = path.split("#");
  const clean = stripLocale(pathname || "/");
  const prefixed =
    locale === defaultLocale
      ? clean
      : clean === "/"
        ? `/${locale}`
        : `/${locale}${clean}`;
  return hash ? `${prefixed}#${hash}` : prefixed;
}

export function localeFromPath(pathname: string): Locale {
  const match = pathname.match(/^\/(en|fr)(?=\/|$)/);
  if (match && isLocale(match[1])) return match[1];
  return defaultLocale;
}
