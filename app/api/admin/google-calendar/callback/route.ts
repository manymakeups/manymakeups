import { go } from "@/lib/portal/http";
import { connectGoogleCalendar, googleRedirectUri, readGoogleState } from "@/lib/portal/google-calendar";
import { requireAdmin } from "@/lib/portal/session";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const url = new URL(request.url);
  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code") || "";
  if (!code || !(await readGoogleState(state))) return go(request, "/privado/calendario?error=google");
  const reason = await connectGoogleCalendar(code, googleRedirectUri(request));
  if (reason) return go(request, `/privado/calendario?error=google-token&motivo=${encodeURIComponent(reason)}`);
  return go(request, "/privado/calendario?ok=google");
}
