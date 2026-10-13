import { checkPassword, isEmail, normalizeEmail } from "@/lib/portal/crypto";
import { goPortal, requestLocale } from "@/lib/portal/http";
import { setSessionCookie } from "@/lib/portal/session";
import { getClientByEmail, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = normalizeEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");
  if (!isEmail(email) || !password) {
    return goPortal(request, "/area-novia?error=datos");
  }
  const client = await getClientByEmail(email);
  if (!client?.passwordHash || !(await checkPassword(password, client.passwordHash))) {
    return goPortal(request, "/area-novia?error=acceso");
  }
  const locale = await requestLocale();
  if (client.locale !== locale) {
    client.locale = locale;
    await saveClient(client);
  }
  await setSessionCookie({
    sub: client.id,
    role: "client",
    email: client.email,
    name: client.event.clientName || client.name,
  });
  return goPortal(request, "/area-novia/panel");
}
