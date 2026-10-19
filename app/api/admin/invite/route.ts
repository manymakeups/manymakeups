import { site } from "@/lib/site";
import { randomToken } from "@/lib/portal/crypto";
import { stampInvite } from "@/lib/portal/invite";
import { mailInvite } from "@/lib/portal/invite-mail";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  if (String(form.get("intent") ?? "") === "send") {
    if (!client.inviteToken) return go(request, "/privado/novias?error=datos");
    const invite = `${site.url}/area-novia/activar?token=${encodeURIComponent(client.inviteToken)}`;
    const sent = await mailInvite(client);
    const flag = sent ? "ok=invitacion" : "ok=invitacion&error=correo";
    return go(request, `/privado/novias?invite=${encodeURIComponent(invite)}&client=${client.id}&${flag}`);
  }
  const token = randomToken();
  stampInvite(client, token);
  await saveClient(client);
  const invite = `${site.url}/area-novia/activar?token=${encodeURIComponent(token)}`;
  return go(request, `/privado/novias?invite=${encodeURIComponent(invite)}&client=${client.id}`);
}
