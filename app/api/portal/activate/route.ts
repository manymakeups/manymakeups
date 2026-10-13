import { hashPassword, hashToken, passwordIssue } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { setSessionCookie } from "@/lib/portal/session";
import { getClientByInviteHash, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (!token) return go(request, "/area-novia?error=invitacion");
  if (password !== confirm) {
    return go(request, `/area-novia/activar?token=${encodeURIComponent(token)}&error=clave`);
  }
  if (passwordIssue(password)) {
    return go(request, `/area-novia/activar?token=${encodeURIComponent(token)}&error=requisito`);
  }
  const client = await getClientByInviteHash(hashToken(token));
  if (!client) return go(request, "/area-novia?error=invitacion");
  client.passwordHash = await hashPassword(password);
  client.inviteTokenHash = null;
  client.inviteExpiresAt = null;
  await saveClient(client);
  await setSessionCookie({
    sub: client.id,
    role: "client",
    email: client.email,
    name: client.event.clientName || client.name,
  });
  return go(request, "/area-novia/panel");
}
