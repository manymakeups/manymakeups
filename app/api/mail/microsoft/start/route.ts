import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { beginLogin, hotmailMailError } from "@/lib/portal/microsoft-mail";
import { requireAdmin } from "@/lib/portal/session";
import { site } from "@/lib/site";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.redirect(new URL("/privado", site.url));
  try {
    const login = beginLogin();
    (await cookies()).set("mm_ms_oauth", `${login.state}.${login.verifier}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });
    return NextResponse.redirect(login.url);
  } catch (err) {
    const pub = hotmailMailError(err);
    return NextResponse.redirect(new URL(`/privado/correo?hotmail=${encodeURIComponent(pub.error)}`, site.url));
  }
}
