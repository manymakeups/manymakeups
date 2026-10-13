import { NextResponse } from "next/server";

export function go(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}
