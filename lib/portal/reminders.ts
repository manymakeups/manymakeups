import { site } from "@/lib/site";
import { madridToday } from "./calendar";
import { hashToken, randomToken } from "./crypto";
import { stampInvite } from "./invite";
import { dateLocale, getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { localePath } from "@/lib/i18n/path";
import { brandedClientEmail } from "./mail-html";
import { clientLocale } from "./client-mail";
import { mailName } from "./names";
import { notifyEmail } from "./notify";
import { listClients, saveClient } from "./store";
import { euros, type Appointment, type ClientRecord } from "./types";
import { unsubscribeToken } from "./unsubscribe";

const MILESTONES = [3, 7, 14] as const;

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

function activationStage(client: ClientRecord): (typeof MILESTONES)[number] {
  const issued = madridDay(client.inviteIssuedAt || client.createdAt);
  const age = issued ? daysFrom(issued, madridToday()) : null;
  if (age !== null && age >= 14) return 14;
  if (age !== null && age >= 7) return 7;
  return 3;
}

function activationMail(client: ClientRecord, stage: (typeof MILESTONES)[number] = 3) {
  if (!client.inviteToken || client.passwordHash) return Promise.resolve(false);
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const name = mailName(client.event, client.name);
  const link = `${site.url}/area-novia/activar?token=${encodeURIComponent(client.inviteToken)}`;
  const expires = client.inviteExpiresAt
    ? new Date(client.inviteExpiresAt)
    : client.inviteIssuedAt
      ? new Date(new Date(client.inviteIssuedAt).getTime() + 21 * 24 * 60 * 60 * 1000)
      : null;
  const expiry =
    expires && !Number.isNaN(expires.getTime())
      ? expires.toLocaleDateString(dateLocale(locale), {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Europe/Madrid",
        })
      : "";
  const urgent = stage === 14;
  const week = stage === 7;
  const mail = brandedClientEmail({
    lang: locale,
    blocks: [
      {
        text: interpolate(urgent || week ? t.mailHi : t.activationReminderGreeting, { name }),
      },
      { text: urgent ? t.activationReminderUrgentBody : week ? t.activationReminderWeekBody : t.activationReminderBody },
      {
        text: urgent
          ? interpolate(t.activationReminderUrgentCta, { date: expiry })
          : week
            ? t.activationReminderWeekCta
            : t.activationReminderCta,
      },
      {
        href: link,
        label: urgent ? t.activationReminderUrgentLink : t.activationReminderLink,
      },
      {
        text: urgent ? t.activationReminderUrgentClose : week ? t.activationReminderWeekClose : t.activationReminderClose,
        muted: true,
      },
    ],
    signoff: [week || urgent ? t.recoverMailSignoff : t.activationReminderSignoff],
    footer: footer(client, "recordatorios", t.unsubRemindersFooter),
  });
  const subject = urgent
    ? interpolate(t.activationReminderUrgentSubject, { name })
    : week
      ? interpolate(t.activationReminderWeekSubject, { name })
      : t.activationReminderSubject;
  return notifyEmail(client.email, subject, mail.text, mail.html);
}

export async function deliverActivationReminder(client: ClientRecord) {
  if (client.passwordHash) return false;
  const expired = !client.inviteExpiresAt || new Date(client.inviteExpiresAt).getTime() <= Date.now();
  if (!client.inviteToken || expired) stampInvite(client, randomToken());
  return activationMail(client, activationStage(client));
}

function madridInstant(date: string, time: string) {
  const clock = /^(\d{2}):(\d{2})$/.test(time) ? time : "12:00";
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = clock.split(":").map(Number);
  if (!year || !month || !day) return null;
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(utcGuess));
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  const hourPart = parts.find((part) => part.type === "hour")?.value;
  const asUtc = Date.UTC(value("year"), value("month") - 1, value("day"), hourPart === "24" ? 0 : Number(hourPart), value("minute"));
  return new Date(utcGuess - (asUtc - utcGuess));
}

function hoursUntil(date: string, time: string) {
  const when = madridInstant(date, time);
  if (!when) return null;
  return (when.getTime() - Date.now()) / 3600000;
}

async function sendAppointment(client: ClientRecord, appointment: Appointment, token: string, soon = false) {
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const name = mailName(client.event, client.name);
  const when = formatWhen(appointment.date, locale);
  const dated = when ? when.charAt(0).toLocaleUpperCase(dateLocale(locale)) + when.slice(1) : "—";
  const hour = appointment.time ? interpolate(t.appointmentHour, { time: appointment.time }) : "—";
  const amount = appointment.amount > 0 ? euros(appointment.amount) : "—";
  const details = [
    soon ? t.appointmentReminderSoonDetails : t.appointmentReminderDetails,
    `${t.mailService}: ${appointment.title}`,
    `${t.mailDate}: ${dated}`,
    `${t.mailTime}: ${hour}`,
    `${t.mailPlace}: ${appointment.place || "—"}`,
    `${soon ? t.appointmentAmountDue : t.mailAmount}: ${amount}`,
  ].join("\n");
  const confirm = `${site.url}${localePath(locale, "/area-novia/confirmar-cita")}?cliente=${encodeURIComponent(client.id)}&cita=${encodeURIComponent(appointment.id)}&token=${encodeURIComponent(token)}`;
  const mail = brandedClientEmail({
    lang: locale,
    blocks: [
      { text: interpolate(t.mailHi, { name }) },
      { text: soon ? t.appointmentReminderSoonIntro : t.appointmentReminderIntro },
      { text: details },
      { href: confirm, label: t.appointmentReminderConfirm },
      { text: soon ? t.appointmentReminderSoonClose : t.appointmentReminderClose, muted: true },
    ],
    signoff: [soon ? t.appointmentReminderSoonSignoff : t.recoverMailSignoff],
    footer: footer(client, "recordatorios", t.unsubRemindersFooter),
  });
  const subject = soon ? t.appointmentReminderSoonSubject : interpolate(t.appointmentReminderSubject, { name });
  return notifyEmail(client.email, subject, mail.text, mail.html);
}

export async function deliverAppointmentReminder(client: ClientRecord, appointment: Appointment) {
  if (appointment.status === "anulada" || appointment.status === "hecha") return false;
  const token = randomToken();
  const hours = appointment.date ? hoursUntil(appointment.date, appointment.time) : null;
  const ok = await sendAppointment(client, appointment, token, hours !== null && hours > 0 && hours <= 48);
  if (!ok) return false;
  appointment.confirmTokenHash = hashToken(token);
  return true;
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
        const sent = new Set(client.activationRemindersSent ?? []);
        const due = MILESTONES.filter((day) => age >= day && !sent.has(day));
        const next = due.at(-1);
        if (next) {
          const ok = await activationMail(client, next);
          if (ok) {
            for (const day of MILESTONES) if (day <= next) sent.add(day);
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
        if (!appointment.date) continue;
        const hours = hoursUntil(appointment.date, appointment.time);
        const left = daysFrom(today, appointment.date);
        const soon = hours !== null && hours > 0 && hours <= 48 && appointment.reminder48For !== appointment.date;
        const week = !soon && left !== null && left > 2 && left <= 7 && appointment.reminder7For !== appointment.date;
        if (!soon && !week) continue;
        const token = randomToken();
        const ok = await sendAppointment(client, appointment, token, soon);
        if (!ok) continue;
        if (soon) appointment.reminder48For = appointment.date;
        else appointment.reminder7For = appointment.date;
        appointment.confirmTokenHash = hashToken(token);
        dirty = true;
        appointments += 1;
      }
    }
    if (dirty) await saveClient(client);
  }
  return { activation, appointments };
}
