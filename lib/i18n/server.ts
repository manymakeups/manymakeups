import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";
import { stripLocale } from "./path";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get("NEXT_LOCALE")?.value ?? defaultLocale;
  return isLocale(value) ? value : defaultLocale;
}

export async function getRequestPathname() {
  const value = (await cookies()).get("x-pathname")?.value ?? "/";
  return stripLocale(value);
}
