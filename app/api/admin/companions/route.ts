import { mailClient } from "@/lib/portal/client-mail";
import { companionsFromForm, peopleFields } from "@/lib/portal/event-parse";
import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import { emptyAttendee } from "@/lib/portal/types";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  const intent = String(form.get("intent") ?? "");
  if (intent === "add" && client.event.people.length < 20) {
    client.event.people = [...client.event.people, peopleFields(form, 0, emptyAttendee())];
    client.event.peopleCount = client.event.people.length;
  } else if (intent === "update") {
    const index = Number(form.get("personIndex"));
    if (Number.isInteger(index) && client.event.people[index]) {
      const people = [...client.event.people];
      people[index] = peopleFields(form, index, people[index]);
      client.event.people = people;
    }
  } else {
    client.event = {
      ...companionsFromForm(form, client.event),
      peopleLocked: client.event.peopleLocked,
    };
  }
  await saveClient(client);
  const sent = await mailClient(client, "update", { tab: "acompanantes" });
  return go(
    request,
    `/privado/novias/${client.id}?tab=acompanantes&ok=ficha${sent ? "" : "&error=correo"}`,
  );
}
