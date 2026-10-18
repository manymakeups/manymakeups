import { site } from "@/lib/site";
import { madridToday } from "./calendar";
import { hashToken, randomToken } from "./crypto";
import { dateLocale, getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { localePath } from "@/lib/i18n/path";
import { brandedClientEmail } from "./mail-html";
import { clientLocale } from "./client-mail";
import { mailName } from "./names";
import { notifyEmail } from "./notify";
import { listClients, saveClient } from "./store";
import { euros, type Appointment, type ClientRecord } from "./types";
import { unsubscribeToken } from "./unsubscribe";

const MILESTONES = [3, 7, 14, 20] as const;

function madridDay(value: string) {
  const date = value.length > 10 ? new Date(value) : new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayIndex(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function daysFrom(start: string, today: string) {
  const from = dayIndex(start);
  const to = dayIndex(today);
  if (from === null || to === null) return null;
  return to - from;
}

function footer(client: ClientRecord, kind: "recordatorios" | "comercial", label: string) {
  const locale = clientLocale(client);
  const href = `${site.url}${localePath(locale, "/area-novia/baja")}?id=${encodeURIComponent(client.id)}&tipo=${kind}&token=${encodeURIComponent(unsubscribeToken(client.id, kind))}`;
  return { href, label };
}

function formatWhen(date: string, locale: ReturnType<typeof clientLocale>) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString(dateLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function sendActivation(client: ClientRecord) {
  if (!client.inviteToken || client.remindersOptOut || client.passwordHash) return false;
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const name = mailName(client.event, client.name);
  const link = `${site.url}/area-novia/activar?token=${encodeURIComponent(client.inviteToken)}`;
  const mail = brandedClientEmail({
    lang: locale,
    blocks: [
      { text: interpolate(t.activationReminderHello, { name }) },
      { text: t.activationReminderBody },
      { href: link, label: t.activationReminderLink },
      { text: t.activationReminderClose },
    ],
    signoff: [t.recoverMailSignoff],
    footer: footer(client, "recordatorios", t.unsubRemindersFooter),
  });
  return notifyEmail(client.email, t.activationReminderSubject, mail.text, mail.html);
}

async function sendAppointment(client: ClientRecord, appointment: Appointment, token: string) {
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const name = mailName(client.event, client.name);
  const when = formatWhen(appointment.date, locale);
  const details = [
    `${t.mailService}: ${appointment.title}`,
    `${t.mailDate}: ${when}`,
    `${t.mailTime}: ${appointment.time || "—"}`,
    `${t.mailPlace}: ${appointment.place || "—"}`,
    `${t.mailAmount}: ${appointment.amount > 0 ? euros(appointment.amount) : "—"}`,
  ].join("\n");
  const confirm = `${site.url}${localePath(locale, "/area-novia/confirmar-cita")}?cliente=${encodeURIComponent(client.id)}&cita=${encodeURIComponent(appointment.id)}&token=${encodeURIComponent(token)}`;
  const mail = brandedClientEmail({
    lang: locale,
    blocks: [
      { text: interpolate(t.appointmentReminderHello, { name }) },
      { text: t.appointmentReminderIntro },
      { text: details },
      { href: confirm, label: t.appointmentReminderConfirm },
      { text: t.appointmentReminderClose },
    ],
    signoff: [t.recoverMailSignoff],
    footer: footer(client, "recordatorios", t.unsubRemindersFooter),
  });
  return notifyEmail(client.email, t.appointmentReminderSubject, mail.text, mail.html);
}

export async function runReminders() {
  const today = madridToday();
  const clients = await listClients();
  let activation = 0;
  let appointments = 0;
  for (const client of clients) {
    let dirty = false;
    if (!client.passwordHash && client.inviteToken && !client.remindersOptOut) {
      const expires = client.inviteExpiresAt ? new Date(client.inviteExpiresAt).getTime() : 0;
      const issued = madridDay(client.inviteIssuedAt || client.createdAt);
      const age = issued ? daysFrom(issued, today) : null;
      if (expires > Date.now() && age !== null && age >= 0) {
        const due = MILESTONES.filter((day) => age >= day);
        const sent = new Set(client.activationRemindersSent ?? []);
        const next = due.find((day) => !sent.has(day));
        if (next) {
          const ok = await sendActivation(client);
          if (ok) {
            sent.add(next);
            client.activationRemindersSent = [...sent];
            dirty = true;
            activation += 1;
          }
        }
      }
    }
    if (!client.remindersOptOut) {
      for (const appointment of client.appointments) {
        if (appointment.status === "anulada" || appointment.status === "hecha") continue;
        if (!appointment.date || appointment.reminder7For === appointment.date) continue;
        const left = daysFrom(today, appointment.date);
        if (left === null || left <= 0 || left > 7) continue;
        const token = randomToken();
        const ok = await sendAppointment(client, appointment, token);
        if (!ok) continue;
        appointment.reminder7For = appointment.date;
        appointment.confirmTokenHash = hashToken(token);
        dirty = true;
        appointments += 1;
      }
    }
    if (dirty) await saveClient(client);
  }
  return { activation, appointments };
}
