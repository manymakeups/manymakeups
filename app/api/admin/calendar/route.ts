import { fetchCalendarEvents, normalizeCalendarUrl } from "@/lib/portal/calendar";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { setStudioCalendars } from "@/lib/portal/store";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  if (form.get("clear") === "1") {
    await setStudioCalendars("", "");
    return go(request, "/privado/calendario?ok=quitado");
  }
  const primary = normalizeCalendarUrl(String(form.get("url") ?? ""));
  const extra = normalizeCalendarUrl(String(form.get("extra") ?? ""));
  if (primary === null || extra === null) return go(request, "/privado/calendario?error=enlace");
  if (primary) {
    const check = await fetchCalendarEvents(primary);
    if (check.error) return go(request, "/privado/calendario?error=descarga");
  }
  if (extra) {
    const check = await fetchCalendarEvents(extra);
    if (check.error) return go(request, "/privado/calendario?error=descarga");
  }
  await setStudioCalendars(primary, extra);
  return go(request, "/privado/calendario?ok=enlace");
}
