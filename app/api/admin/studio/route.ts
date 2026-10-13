import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const tab = text(form.get("tab")) || "contratante";
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  if (form.has("productsUsed")) {
    client.event.productsUsed = text(form.get("productsUsed"));
  }
  client.event.people = client.event.people.map((person, i) => {
    const key = `people.${i}.productsUsed`;
    if (!form.has(key)) return person;
    return { ...person, productsUsed: text(form.get(key)) };
  });
  await saveClient(client);
  return go(request, `/privado/novias/${client.id}?tab=${encodeURIComponent(tab)}&ok=estudio`);
}
