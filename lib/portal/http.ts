import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/path";

export function go(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function requestLocale() {
  const value = (await cookies()).get("NEXT_LOCALE")?.value ?? "";
  return isLocale(value) ? value : defaultLocale;
}

export async function localizedPath(path: string) {
  const locale = await requestLocale();
  const [pathname, query] = path.split("?");
  const href = localePath(locale, pathname || "/");
  return query ? `${href}?${query}` : href;
}

export async function goPortal(request: Request, path: string) {
  return go(request, await localizedPath(path));
}
