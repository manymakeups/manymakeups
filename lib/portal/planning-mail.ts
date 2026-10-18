import { getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { clientLocale, clientPanelUrl } from "./client-mail";
import { brandedClientEmail } from "./mail-html";
import { companionHeading, fullName, mailName } from "./names";
import { notifyEmail } from "./notify";
import { planningTimeline } from "./planning-timeline";
import type { ClientRecord } from "./types";

function slotLabel(client: ClientRecord, id: string) {
  const t = getPortalCopy(clientLocale(client));
  if (id === "contractor") return fullName(client.event, client.name) || t.contractor;
  const index = Number(id.slice(2));
  const person = client.event.people[index];
  if (!person) return "";
  return companionHeading(person, t.whoOptions, interpolate(t.guestN, { n: index + 1 }));
}

function planningRows(client: ClientRecord) {
  const t = getPortalCopy(clientLocale(client));
  const planning = client.event.planning;
  const people = [
    { id: "contractor", label: slotLabel(client, "contractor") },
    ...client.event.people.map((_, index) => ({ id: `g:${index}`, label: slotLabel(client, `g:${index}`) })),
  ];
  const rows: { label: string; value: string }[] = [];
  if (planning.location) rows.push({ label: t.planningLocation, value: planning.location });
  for (const row of planningTimeline(planning, people, t)) {
    const value = [row.when, row.note].filter(Boolean).join("\n");
    if (value) rows.push({ label: row.label, value });
  }
  if (planning.notes) rows.push({ label: t.planningNotes, value: planning.notes });
  return rows;
}

export async function mailPlanning(client: ClientRecord) {
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const name = mailName(client.event, client.name);
  const rows = planningRows(client);
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
