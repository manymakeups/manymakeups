import { site } from "@/lib/site";
import { isEmail, newId, normalizeEmail, randomToken } from "@/lib/portal/crypto";
import { stampInvite } from "@/lib/portal/invite";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { deleteClient, getClientByEmail, saveClient } from "@/lib/portal/store";
import { emptyEvent, emptyPayments } from "@/lib/portal/types";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  if (String(form.get("intent") ?? "") === "delete") {
    const id = String(form.get("id") ?? "");
    if (!(await deleteClient(id))) return go(request, "/privado/novias?error=datos");
    return go(request, "/privado/novias?ok=eliminada");
  }
  const name = String(form.get("name") ?? "").trim();
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (!name || !isEmail(email)) return go(request, "/privado/novias?error=datos");
  if (await getClientByEmail(email)) return go(request, "/privado/novias?error=existe");
  const token = randomToken();
  const client = {
    id: newId(),
    email,
    name,
    passwordHash: null,
    inviteTokenHash: null,
    inviteExpiresAt: null,
    createdAt: new Date().toISOString(),
    event: emptyEvent(name),
    payments: emptyPayments(),
    inspiration: [],
    documents: [],
    workPhotos: [],
    appointments: [],
    history: [],
  };
  stampInvite(client, token);
  await saveClient(client);
  const invite = `${site.url}/area-novia/activar?token=${encodeURIComponent(token)}`;
  return go(request, `/privado/novias?invite=${encodeURIComponent(invite)}&client=${client.id}`);
}
