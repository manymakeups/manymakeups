import { isEmail, newId, normalizeEmail, randomToken, hashToken } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { mailPlannerAccess, plannerAccessUrl } from "@/lib/portal/planner-mail";
import { fullName } from "@/lib/portal/names";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const client = await getClient(String(form.get("clientId") ?? ""));
  if (!client) return go(request, "/privado/novias?error=datos");
  const intent = String(form.get("intent") ?? "");
  if (intent === "revoke") {
    const plannerId = String(form.get("plannerId") ?? "");
    client.planners = client.planners.filter((planner) => planner.id !== plannerId);
    await saveClient(client);
    return go(request, "/privado/novias?ok=wp-quitado");
  }
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (!name || !isEmail(email)) return go(request, "/privado/novias?error=datos");
  const token = randomToken();
  const current = client.planners.find((planner) => planner.email === email);
  const planner = current ?? {
    id: newId(),
    name,
    email,
    tokenHash: "",
    createdAt: new Date().toISOString(),
  };
  planner.name = name;
  planner.tokenHash = hashToken(token);
  planner.createdAt = new Date().toISOString();
  if (!current) client.planners = [...client.planners, planner].slice(-12);
  const link = plannerAccessUrl(token);
  await saveClient(client);
  const sent = await mailPlannerAccess({
    to: email,
    clientName: fullName(client.event, client.name),
    link,
  });
  if (!sent) {
    return go(
      request,
      `/privado/novias?ok=wp&error=correo&client=${client.id}&wp=${encodeURIComponent(link)}`,
    );
  }
  return go(request, `/privado/novias?ok=wp&client=${client.id}`);
}
