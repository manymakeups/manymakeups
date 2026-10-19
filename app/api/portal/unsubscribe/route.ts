import { goPortal } from "@/lib/portal/http";
import { fullName } from "@/lib/portal/names";
import { notifyEmail } from "@/lib/portal/notify";
import { getClient, saveClient } from "@/lib/portal/store";
import { unsubscribeMatches } from "@/lib/portal/unsubscribe";
import { site } from "@/lib/site";

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
  if (kind === "comercial") {
    const name = fullName(client.event, client.name);
    await notifyEmail(
      site.email,
      `Baja de difusión · ${name}`,
      `${name} (${client.email}) se ha dado de baja de las comunicaciones comerciales. Comprueba en Difusión que el check de no enviar está marcado.`,
    );
  }
  return goPortal(request, `${back}&ok=1`);
}
