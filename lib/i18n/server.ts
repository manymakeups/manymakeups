import { headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";
import { stripLocale } from "./path";

export async function getLocale(): Promise<Locale> {
  const header = (await headers()).get("x-locale") ?? defaultLocale;
  return isLocale(header) ? header : defaultLocale;
}

export async function getRequestPathname() {
  const header = (await headers()).get("x-pathname") ?? "/";
  return stripLocale(header);
}
