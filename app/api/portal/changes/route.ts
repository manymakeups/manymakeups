import { goPortal } from "@/lib/portal/http";
import { clientLabel, notifyStudio } from "@/lib/portal/notify";
import { requireClient } from "@/lib/portal/session";
import { addStudioNotice, getClient } from "@/lib/portal/store";
import { personLine } from "@/lib/portal/notice-text";

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
  const heading =
    scope === "acompanante"
      ? person
        ? personLine(person, personIndex ?? 0)
        : `Acompañante ${(personIndex ?? 0) + 1}`
      : "Contratante";
  await addStudioNotice(client.id, {
    kind: "cambio",
    scope,
    personIndex,
    message: `${heading}\n\n${message}`,
  });
  await notifyStudio(`Cambio solicitado · ${clientLabel(client)}`, [heading, "", message]);
  return goPortal(request, `${back}&ok=cambio`);
}
