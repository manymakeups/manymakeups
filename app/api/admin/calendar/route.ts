import { fetchCalendarEvents, normalizeCalendarUrl } from "@/lib/portal/calendar";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { setStudioCalendarUrl } from "@/lib/portal/store";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  if (form.get("clear") === "1") {
    await setStudioCalendarUrl("");
    return go(request, "/privado/calendario?ok=quitado");
  }
  const normalized = normalizeCalendarUrl(String(form.get("url") ?? ""));
  if (normalized === null) return go(request, "/privado/calendario?error=enlace");
  if (!normalized) {
    await setStudioCalendarUrl("");
    return go(request, "/privado/calendario?ok=quitado");
  }
  const check = await fetchCalendarEvents(normalized);
  if (check.error) return go(request, "/privado/calendario?error=descarga");
  await setStudioCalendarUrl(normalized);
  return go(request, "/privado/calendario?ok=enlace");
}
