import { goPortal } from "@/lib/portal/http";
import { getClient, saveClient } from "@/lib/portal/store";
import { unsubscribeMatches } from "@/lib/portal/unsubscribe";

export async function POST(request: Request) {
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const kind = String(form.get("tipo") ?? "");
  const token = String(form.get("token") ?? "");
  const back = `/area-novia/baja?id=${encodeURIComponent(id)}&tipo=${encodeURIComponent(kind)}&token=${encodeURIComponent(token)}`;
  if (!unsubscribeMatches(id, kind, token)) return goPortal(request, `${back}&error=1`);
  const client = await getClient(id);
  if (!client) return goPortal(request, `${back}&error=1`);
  if (kind === "recordatorios") client.remindersOptOut = true;
  if (kind === "comercial") client.commercialOptOut = true;
  await saveClient(client);
  return goPortal(request, `${back}&ok=1`);
}
