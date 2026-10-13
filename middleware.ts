import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function localeFromPath(pathname: string) {
  const segment = pathname.split("/")[1];
  return segment === "en" || segment === "fr" ? segment : "es";
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = localeFromPath(pathname);

  let response: NextResponse;
  if (locale === "es") {
    response = NextResponse.next();
  } else {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${locale}`.length) || "/";
    response = NextResponse.rewrite(url);
  }

  response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
  response.cookies.set("x-pathname", `${pathname}${request.nextUrl.search}`, {
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|_next/data|.*\\..*).*)"],
};
