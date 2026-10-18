import { site } from "@/lib/site";
import { randomToken } from "@/lib/portal/crypto";
import { stampInvite } from "@/lib/portal/invite";
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
  const token = randomToken();
  stampInvite(client, token);
  await saveClient(client);
  const invite = `${site.url}/area-novia/activar?token=${encodeURIComponent(token)}`;
  return go(request, `/privado/novias?invite=${encodeURIComponent(invite)}&client=${client.id}`);
}
