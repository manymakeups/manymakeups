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

export function planningText(client: ClientRecord, planning: EventPlanning) {
  const t = getPortalCopy(clientLocale(client));
  const lines: string[] = [];
  if (planning.location) lines.push(`${t.planningLocation}: ${planning.location}`);
  if (planning.arrivalTime) lines.push(`${t.planningArrival}: ${planning.arrivalTime}`);
  if (planning.setPrep) lines.push(`${t.planningSet}: ${planning.setPrep}`);
  const slots = planning.slots.filter((slot) => slot.time || slot.note);
  if (slots.length) {
    lines.push("", t.planningSchedule);
    for (const slot of slots) {
      const who = slotLabel(client, slot.id);
      lines.push([slot.time, who, slot.note].filter(Boolean).join(" · "));
    }
  }
  if (planning.breaks) lines.push("", `${t.planningBreaks}: ${planning.breaks}`);
  if (planning.packUp) lines.push(`${t.planningPack}: ${planning.packUp}`);
  if (planning.notes) lines.push("", `${t.planningNotes}: ${planning.notes}`);
  return lines.join("\n");
}

export async function mailPlanning(client: ClientRecord) {
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const name = mailName(client.event, client.name);
  const body = planningText(client, client.event.planning);
  const href = `${clientPanelUrl(client, "contratante")}&sec=planning`;
  const mail = brandedClientEmail({
    lang: locale,
    blocks: [
      { text: interpolate(t.planningMailHello, { name }) },
      { text: t.planningMailIntro },
      ...(body ? [{ text: body }] : []),
      { href, label: t.planningTab },
    ],
    signoff: [t.recoverMailSignoff],
  });
  return notifyEmail(client.email, t.planningMailSubject, mail.text, mail.html);
}
