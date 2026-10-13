import { fetchCalendarEvents, isCalendlyBookingPage, normalizeCalendarUrl } from "@/lib/portal/calendar";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { setStudioCalendars } from "@/lib/portal/store";

function readFeed(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed || isCalendlyBookingPage(trimmed)) return { url: "", invalid: false };
  const url = normalizeCalendarUrl(trimmed);
  if (url === null) return { url: "", invalid: true };
  return { url, invalid: false };
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  if (form.get("clear") === "1") {
    await setStudioCalendars("", "", "");
    return go(request, "/privado/calendario?ok=quitado");
  }
  const primary = readFeed(String(form.get("url") ?? ""));
  const google = readFeed(String(form.get("google") ?? ""));
  const extra = readFeed(String(form.get("extra") ?? ""));
  if (primary.invalid || google.invalid || extra.invalid) return go(request, "/privado/calendario?error=enlace");
  for (const feed of [primary.url, google.url, extra.url]) {
    if (!feed) continue;
    const check = await fetchCalendarEvents(feed);
    if (check.error) return go(request, "/privado/calendario?error=descarga");
  }
  await setStudioCalendars(primary.url, google.url, extra.url);
  return go(request, "/privado/calendario?ok=enlace");
}
