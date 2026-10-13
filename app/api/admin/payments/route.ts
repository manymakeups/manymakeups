import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

function money(value: FormDataEntryValue | null) {
  const n = Number.parseFloat(typeof value === "string" ? value : "");
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  client.payments = {
    trial: {
      amount: money(form.get("trialAmount")),
      paid: form.get("trialPaid") === "on",
    },
    event: {
      amount: money(form.get("eventAmount")),
      paid: form.get("eventPaid") === "on",
    },
  };
  await saveClient(client);
  return go(request, `/privado/novias/${client.id}?ok=pagos`);
}
