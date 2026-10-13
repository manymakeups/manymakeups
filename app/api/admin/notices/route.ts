import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { markNoticeRead } from "@/lib/portal/store";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const next = String(form.get("next") ?? "/privado/novias");
  if (id) await markNoticeRead(id);
  return go(request, next.startsWith("/privado") ? next : "/privado/novias");
}
