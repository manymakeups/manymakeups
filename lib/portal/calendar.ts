import { createHash } from "node:crypto";
import { site } from "@/lib/site";
import { secretsEqual } from "./crypto";
import type { ClientRecord } from "./types";

export type StudioEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  clientName: string;
  clientId: string;
  place: string;
  notes: string;
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function weekdayLabels() {
  return WEEKDAYS;
}

function calendarSecret() {
  return process.env.AUTH_SECRET || "";
}

export function calendarFeedToken() {
  const secret = calendarSecret();
  if (!secret) return "";
  return createHash("sha256").update(`studio-calendar:${secret}`).digest("hex").slice(0, 40);
}

export function calendarFeedPath() {
  const token = calendarFeedToken();
  return token ? `/api/studio/calendar/${token}` : "";
}

export function calendarFeedUrls() {
  const path = calendarFeedPath();
  if (!path) return null;
  const https = `${site.url}${path}`;
  return { https, webcal: https.replace(/^https:/, "webcal:") };
}

export function validCalendarToken(token: string) {
  const expected = calendarFeedToken();
  return Boolean(expected) && secretsEqual(token, expected);
}

export function madridToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseMonth(value: string | undefined, today = madridToday()) {
  const match = /^(\d{4})-(\d{2})$/.exec(value || "");
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const [year, month] = today.split("-").map(Number);
  return { year, month };
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function monthLabel(year: number, month: number) {
  const label = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function dayLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<string | null> = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

function celebrationTitle(type: string) {
  if (type === "boda") return "Boda";
  if (type === "evento") return "Evento";
  return "Celebración";
}

export function studioEvents(clients: ClientRecord[]): StudioEvent[] {
  const items: StudioEvent[] = [];
  for (const client of clients) {
    const clientName = client.event.clientName || client.name;
    for (const appointment of client.appointments) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(appointment.date)) continue;
      items.push({
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        title: appointment.title || "Cita",
        clientName,
        clientId: client.id,
        place: appointment.place,
        notes: appointment.notes,
      });
    }
    const eventDate = client.event.eventDate;
    const already = client.appointments.some(
      (appointment) => appointment.date === eventDate && appointment.title === "Evento",
    );
    if (/^\d{4}-\d{2}-\d{2}$/.test(eventDate) && !already) {
      items.push({
        id: `celebracion-${client.id}`,
        date: eventDate,
        time: client.event.ceremonyTime || client.event.gettingReadyTime || "",
        title: celebrationTitle(client.event.eventType),
        clientName,
        clientId: client.id,
        place: client.event.venue,
        notes: "",
      });
    }
  }
  return items.sort((a, b) => `${a.date}${a.time}${a.clientName}`.localeCompare(`${b.date}${b.time}${b.clientName}`));
}

function icsEscape(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
}

function stamp(date: string, time?: string) {
  const compact = date.replaceAll("-", "");
  if (!time) return compact;
  return `${compact}T${time.replace(":", "")}00`;
}

function plusHour(date: string, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + (minutes || 0) + 60;
  const carry = total >= 24 * 60 ? 1 : 0;
  const mins = total % (24 * 60);
  const nextTime = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  if (!carry) return { date, time: nextTime };
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + 1));
  return {
    date: shifted.toISOString().slice(0, 10),
    time: nextTime,
  };
}

export function studioCalendarIcs(events: StudioEvent[]) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Many Makeups//Agenda//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Many Makeups",
    "X-WR-TIMEZONE:Europe/Madrid",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Madrid",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
  for (const event of events) {
    const summary = `${event.title} · ${event.clientName}`;
    const description = [event.notes, event.place].filter(Boolean).join("\n");
    lines.push("BEGIN:VEVENT", `UID:${event.id}@manymakeups.com`, `DTSTAMP:${now}`, `SUMMARY:${icsEscape(summary)}`);
    if (event.time) {
      const end = plusHour(event.date, event.time);
      lines.push(
        `DTSTART;TZID=Europe/Madrid:${stamp(event.date, event.time)}`,
        `DTEND;TZID=Europe/Madrid:${stamp(end.date, end.time)}`,
      );
    } else {
      const [year, month, day] = event.date.split("-").map(Number);
      const next = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
      lines.push(`DTSTART;VALUE=DATE:${stamp(event.date)}`, `DTEND;VALUE=DATE:${stamp(next)}`);
    }
    if (event.place) lines.push(`LOCATION:${icsEscape(event.place)}`);
    if (description) lines.push(`DESCRIPTION:${icsEscape(description)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
