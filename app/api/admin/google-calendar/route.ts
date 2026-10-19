import { go } from "@/lib/portal/http";
import {
  googleAuthUrl,
  googleCalendarConfigured,
  googleRedirectUri,
  signGoogleState,
} from "@/lib/portal/google-calendar";
import { clearGoogleCalendarLink } from "@/lib/portal/store";
import { requireAdmin } from "@/lib/portal/session";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  if (!googleCalendarConfigured()) return go(request, "/privado/calendario?error=google-config");
  const state = await signGoogleState();
  return Response.redirect(googleAuthUrl(googleRedirectUri(request), state), 302);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  await clearGoogleCalendarLink();
  return go(request, "/privado/calendario?ok=google-off");
}
