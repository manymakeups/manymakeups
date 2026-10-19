import { go } from "@/lib/portal/http";
import { hideCalendarEvent } from "@/lib/portal/store";
import { requireAdmin } from "@/lib/portal/session";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const next = text(form.get("next"));
  const back = next.startsWith("/privado/calendario") ? next : "/privado/calendario";
  await hideCalendarEvent(text(form.get("id")));
  return go(request, back);
}
