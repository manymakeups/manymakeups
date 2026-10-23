import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { finishLogin, hotmailMailError, safeEqual } from "@/lib/portal/microsoft-mail";
import { site } from "@/lib/site";

export const runtime = "nodejs";

function back(message: string) {
  const safe = message.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const html = `<!doctype html><meta charset="utf-8"><title>Hotmail</title><body style="font-family:Georgia,serif;background:#f4f1ea;color:#1a1613;padding:48px;max-width:36rem"><h1>Hotmail</h1><p>${safe}</p><p><a href="/privado/correo">Volver al correo</a></p></body>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jar = await cookies();
  const packed = jar.get("mm_ms_oauth")?.value || "";
  jar.delete("mm_ms_oauth");
  const dot = packed.indexOf(".");
  const state = dot > 0 ? packed.slice(0, dot) : "";
  const verifier = dot > 0 ? packed.slice(dot + 1) : "";
  const sent = url.searchParams.get("state") || "";
  if (!safeEqual(state, sent) || !verifier) return back("La conexión ha caducado. Vuelve al correo y pulsa Conectar Hotmail otra vez.");
  const microsoftError = url.searchParams.get("error") || "";
  if (microsoftError) {
    return back(microsoftError === "access_denied"
      ? "Has cancelado el acceso de Hotmail."
      : "Microsoft no ha completado el acceso. En Azure, abre Many Makeups Correo, entra en Permisos de API y añade Mail.Read, Mail.ReadWrite y Mail.Send.");
  }
  const code = url.searchParams.get("code") || "";
  if (!code) return back("Microsoft no ha devuelto el acceso.");
  try {
    await finishLogin(code, verifier);
  } catch (err) {
    return back(hotmailMailError(err).error);
  }
  return NextResponse.redirect(new URL("/privado/correo", site.url));
}
