import { dateLocale, getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { contractedServiceNames, serviceAmountDue } from "./budget";
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
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const planning = client.event.planning;
  const people = [
    {
      id: "contractor",
      label: slotLabel(client, "contractor"),
      service: contractedServiceNames(client.event).join(" y "),
    },
    ...client.event.people.map((person, index) => ({
      id: `g:${index}`,
      label: slotLabel(client, `g:${index}`),
      service: person.service?.trim() ?? "",
    })),
  ];
  const rows: { label: string; value: string }[] = [];
  if (planning.location) rows.push({ label: t.planningLocation, value: planning.location });
  if (client.event.eventDate) {
    rows.push({
      label: t.mailDate,
      value: new Date(`${client.event.eventDate}T12:00:00`).toLocaleDateString(dateLocale(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });
  }
  const due = serviceAmountDue(client);
  if (due > 0) {
    const amount = new Intl.NumberFormat(dateLocale(locale), { style: "currency", currency: "EUR" }).format(due);
    rows.push({ label: t.planningPending.split(":")[0].trim(), value: amount });
  }
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
  const due = serviceAmountDue(client);
  const href = `${clientPanelUrl(client, "contratante")}&sec=planning`;
  const mail = brandedClientEmail({
    lang: locale,
    blocks: [
      { text: interpolate(t.planningMailHello, { name }) },
      { text: t.planningMailIntro },
      ...(rows.length ? [{ rows }] : []),
      ...(due > 0 ? [{ text: t.planningCashNote, muted: true as const }] : []),
      { href, label: t.planningTab },
    ],
    signoff: [t.recoverMailSignoff],
  });
  return notifyEmail(client.email, t.planningMailSubject, mail.text, mail.html);
}
