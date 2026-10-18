import { getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { clientLocale, clientPanelUrl } from "./client-mail";
import { brandedClientEmail } from "./mail-html";
import { companionHeading, fullName, mailName } from "./names";
import { notifyEmail } from "./notify";
import type { ClientRecord, EventPlanning } from "./types";

function slotLabel(client: ClientRecord, id: string) {
  const t = getPortalCopy(clientLocale(client));
  if (id === "contractor") return fullName(client.event, client.name) || t.contractor;
  const index = Number(id.slice(2));
  const person = client.event.people[index];
  if (!person) return "";
  return companionHeading(person, t.whoOptions, interpolate(t.guestN, { n: index + 1 }));
}

function planningRows(client: ClientRecord, planning: EventPlanning) {
  const t = getPortalCopy(clientLocale(client));
  const rows: { label: string; value: string }[] = [];
  if (planning.location) rows.push({ label: t.planningLocation, value: planning.location });
  if (planning.arrivalTime) rows.push({ label: t.planningArrival, value: planning.arrivalTime });
  if (planning.setPrep) rows.push({ label: t.planningSet, value: planning.setPrep });
  for (const slot of planning.slots) {
    if (!slot.time && !slot.note) continue;
    rows.push({
      label: slotLabel(client, slot.id) || t.planningSchedule,
      value: [slot.time, slot.note].filter(Boolean).join(" · "),
    });
  }
  if (planning.breaks) rows.push({ label: t.planningBreaks, value: planning.breaks });
  if (planning.packUp) rows.push({ label: t.planningPack, value: planning.packUp });
  if (planning.notes) rows.push({ label: t.planningNotes, value: planning.notes });
  return rows;
}

export async function mailPlanning(client: ClientRecord) {
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const name = mailName(client.event, client.name);
  const rows = planningRows(client, client.event.planning);
  const href = `${clientPanelUrl(client, "contratante")}&sec=planning`;
  const mail = brandedClientEmail({
    lang: locale,
    blocks: [
      { text: interpolate(t.planningMailHello, { name }) },
      { text: t.planningMailIntro },
      ...(rows.length ? [{ rows }] : []),
      { href, label: t.planningTab },
    ],
    signoff: [t.recoverMailSignoff],
  });
  return notifyEmail(client.email, t.planningMailSubject, mail.text, mail.html);
}
