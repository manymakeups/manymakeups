import { go } from "@/lib/portal/http";
import { googleRemovalQuery, removeStudioGoogleEvent } from "@/lib/portal/google-calendar";
import { hideCalendarEvents } from "@/lib/portal/store";
import { requireAdmin } from "@/lib/portal/session";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function withFlag(path: string, flag: string) {
  if (!flag) return path;
  const [key, value] = flag.split("=");
  const url = new URL(path, "https://www.manymakeups.com");
  if (key && value) url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const next = text(form.get("next"));
  const back = next.startsWith("/privado/calendario") ? next : "/privado/calendario";
  const removed = await removeStudioGoogleEvent(text(form.get("id")));
  await hideCalendarEvents(removed.hideIds);
  return go(request, withFlag(back, googleRemovalQuery(removed.status)));
}
