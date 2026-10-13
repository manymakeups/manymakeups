import { secretsEqual } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { setSessionCookie } from "@/lib/portal/session";

export async function POST(request: Request) {
  const expected = process.env.PORTAL_ADMIN_PASSWORD ?? "";
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  if (!expected || !secretsEqual(password, expected)) {
    return go(request, "/privado?error=acceso");
  }
  await setSessionCookie({
    sub: "studio",
    role: "admin",
    email: "info@manymakeups.com",
    name: "Ana Zarza",
  });
  return go(request, "/privado/novias");
}
