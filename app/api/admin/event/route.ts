import { contractorFromForm } from "@/lib/portal/event-parse";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  client.event = {
    ...contractorFromForm(form, client.event),
    contractorLocked: client.event.contractorLocked,
  };
  await saveClient(client);
  return go(request, `/privado/novias/${client.id}?tab=contratante&ok=ficha`);
}
