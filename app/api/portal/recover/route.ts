import { site } from "@/lib/site";
import { hashToken, isEmail, normalizeEmail, randomToken } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { clientLabel, notifyEmail, notifyStudio } from "@/lib/portal/notify";
import { getClientByEmail, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (!isEmail(email)) return go(request, "/area-novia/recuperar?ok=1");
  const client = await getClientByEmail(email);
  if (client) {
    const token = randomToken();
    client.inviteTokenHash = hashToken(token);
    client.inviteExpiresAt = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
    await saveClient(client);
    const link = `${site.url}/area-novia/activar?token=${encodeURIComponent(token)}`;
    const body = [
      "Hola,",
      "",
      "Para elegir una nueva contraseña en tu Área clientes, abre este enlace:",
      link,
      "",
      "Caduca a las tres semanas. Si no lo has pedido tú, ignóralo.",
      "",
      "Many Makeups by Ana Zarza",
    ].join("\n");
    await notifyEmail(client.email, "Recuperar contraseña · Área clientes Many Makeups", body);
    await notifyStudio(`Recuperar contraseña · ${clientLabel(client)}`, [
      "Ha pedido un enlace nuevo.",
      link,
    ]);
  }
  return go(request, "/area-novia/recuperar?ok=1");
}
