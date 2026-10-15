import { mailClient } from "@/lib/portal/client-mail";
import { companionsFromForm, peopleFields } from "@/lib/portal/event-parse";
import { go } from "@/lib/portal/http";
import { dropPersonFiles } from "@/lib/portal/person-index";
import { requireAdmin } from "@/lib/portal/session";
import { deletePortalFile, getClient, mutateNotices, saveClient } from "@/lib/portal/store";
import { emptyAttendee } from "@/lib/portal/types";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  const intent = String(form.get("intent") ?? "");
  if (intent === "trial-notes") {
    const index = Number(form.get("personIndex"));
    if (Number.isInteger(index) && client.event.people[index]) {
      const people = [...client.event.people];
      people[index] = { ...people[index], trialNotes: String(form.get("trialNotes") ?? "").trim() };
      client.event.people = people;
      await saveClient(client);
      const sent = await mailClient(client, "update", { tab: "acompanantes" });
      return go(
        request,
        `/privado/novias/${client.id}?tab=acompanantes&sec=${index}-comentarios&ok=ficha${sent ? "" : "&error=correo"}`,
      );
    }
    return go(request, `/privado/novias/${client.id}?tab=acompanantes`);
  }
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
  } else if (intent === "delete") {
    const index = Number(form.get("personIndex"));
    if (!Number.isInteger(index) || !client.event.people[index]) {
      return go(request, `/privado/novias/${client.id}?tab=acompanantes`);
    }
    const inspiration = dropPersonFiles(client.inspiration, index);
    const work = dropPersonFiles(client.workPhotos, index);
    client.inspiration = inspiration.keep;
    client.workPhotos = work.keep;
    client.event.people = client.event.people.filter((_, i) => i !== index);
    client.event.peopleCount = client.event.people.length;
    client.payments.guests = client.payments.guests.filter((_, i) => i !== index);
    await saveClient(client);
    await mutateNotices((notices) =>
      notices.map((notice) => {
        if (notice.clientId !== client.id || notice.personIndex == null) return notice;
        if (notice.personIndex === index) return { ...notice, personIndex: undefined };
        if (notice.personIndex > index) return { ...notice, personIndex: notice.personIndex - 1 };
        return notice;
      }),
    );
    await Promise.all(
      [...inspiration.drop, ...work.drop].map((file) => deletePortalFile(file).catch(() => undefined)),
    );
    const sent = await mailClient(client, "update", { tab: "acompanantes" });
    return go(
      request,
      `/privado/novias/${client.id}?tab=acompanantes&ok=ficha${sent ? "" : "&error=correo"}`,
    );
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
