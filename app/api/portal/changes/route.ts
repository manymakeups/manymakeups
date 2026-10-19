import { goPortal } from "@/lib/portal/http";
import { requireClient } from "@/lib/portal/session";
import { addStudioNotice, getClient } from "@/lib/portal/store";
import { personTitle, valueChange } from "@/lib/portal/notice-text";

export async function POST(request: Request) {
  const session = await requireClient();
  if (!session) return goPortal(request, "/area-novia");
  const client = await getClient(session.sub);
  if (!client) return goPortal(request, "/area-novia");
  const form = await request.formData();
  const message = String(form.get("message") ?? "").trim();
  const scope = String(form.get("scope") ?? "") === "acompanante" ? "acompanante" : "contratante";
  const rawIndex = Number.parseInt(String(form.get("personIndex") ?? ""), 10);
  const personIndex =
    scope === "acompanante" && Number.isFinite(rawIndex) && rawIndex >= 0 ? rawIndex : undefined;
  const back = "/area-novia/panel?tab=historico&com=nueva";
  if (message.length < 4) return goPortal(request, `${back}&error=cambio`);
  if (scope === "contratante" && !client.event.contractorLocked) {
    return goPortal(request, back);
  }
  if (scope === "acompanante" && !client.event.peopleLocked) {
    return goPortal(request, back);
  }
  const person = personIndex != null ? client.event.people[personIndex] : null;
  const where =
    scope === "acompanante"
      ? `Comunicaciones · ${personTitle(person ?? undefined, personIndex ?? 0)}`
      : "Comunicaciones · Evento";
  const detail = valueChange(where, "", message);
  await addStudioNotice(client.id, {
    kind: "cambio",
    scope,
    personIndex,
    message: `${where}\n\n${message}`,
    detail,
  });
  return goPortal(request, `${back}&ok=cambio`);
}
