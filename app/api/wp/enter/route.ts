import { hashToken } from "@/lib/portal/crypto";
import { go } from "@/lib/portal/http";
import { setSessionCookie } from "@/lib/portal/session";
import { getClientByPlannerHash } from "@/lib/portal/store";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const client = token ? await getClientByPlannerHash(hashToken(token)) : null;
  const planner = client?.planners.find((item) => item.tokenHash === hashToken(token));
  if (!client || !planner) return go(request, "/wp?error=enlace");
  await setSessionCookie({
    sub: planner.id,
    role: "planner",
    email: planner.email,
    name: planner.name,
    clientId: client.id,
  });
  return go(request, "/wp");
}
