import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const prefixed = new Set(["en", "fr"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];
  const locale = prefixed.has(segment) ? segment : "es";
  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);
  headers.set("x-pathname", pathname);

  if (locale === "es") {
    return NextResponse.next({ request: { headers } });
  }

  const rest = pathname.slice(`/${locale}`.length) || "/";
  const url = request.nextUrl.clone();
  url.pathname = rest;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
