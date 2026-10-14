import { newId } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import { CONTACT_TITLES, SERVICE_TITLES, type HistoryKind } from "@/lib/portal/types";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function money(value: string) {
  const amount = Number(value.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100) / 100;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  const deleteId = text(form.get("deleteId"));
  if (deleteId) {
    client.history = client.history.filter((item) => item.id !== deleteId);
  } else {
    const kind: HistoryKind = text(form.get("kind")) === "contacto" ? "contacto" : "servicio";
    const allowed: readonly string[] = kind === "contacto" ? CONTACT_TITLES : SERVICE_TITLES;
    const picked = text(form.get("title"));
    const custom = text(form.get("customTitle"));
    const title = picked === "Otro" ? custom || "Otro" : allowed.includes(picked) ? picked : allowed[0];
    client.history.push({
      id: newId(),
      kind,
      title,
      date: text(form.get("date")),
      notes: text(form.get("notes")),
      amount: kind === "servicio" ? money(text(form.get("amount"))) : 0,
    });
  }
  await saveClient(client);
  return go(request, `/privado/novias/${client.id}?tab=historico&ok=historico`);
}
