import { fullName } from "./names";
import type { Attendee, EventDetails, StudioNotice } from "./types";

export function eventSummary(event: EventDetails) {
  const services = [
    event.makeup && "maquillaje",
    event.hair && "peinado",
    event.glitterBar && "glitter bar",
    event.beautyCorner && "beauty corner",
  ]
    .filter(Boolean)
    .join(" · ");
  return [
    `Nombre: ${fullName(event) || "—"}`,
    `Pareja: ${event.partnerName || "—"}`,
    `Teléfono: ${event.phone || "—"}`,
    `Tipo: ${event.eventType}`,
    `Fecha: ${event.eventDate || "—"}`,
    `Lugar: ${event.venue || "—"}`,
    `Preparación: ${event.gettingReadyPlace || "—"} ${event.gettingReadyTime}`.trim(),
    `Ceremonia: ${event.ceremonyTime || "—"}`,
    `Servicios: ${services || "—"}`,
    `Notas prueba: ${event.trialNotes || "—"}`,
    `Piel: ${event.skinNotes || "—"}`,
    `Notas: ${event.notes || "—"}`,
  ].join("\n");
}

export function companionsSummary(event: EventDetails) {
  const rows = event.people.map((person, i) => personLine(person, i));
  return [`Personas a atender: ${event.peopleCount}`, ...rows].join("\n");
}

export function personLine(person: Attendee, index: number) {
  const trial = person.wantsTrial ? "con prueba" : "sin prueba";
  return `${index + 1}. ${person.who || "—"} · ${person.service} · ${trial}`;
}

export function noticeTitle(notice: StudioNotice) {
  if (notice.kind === "ficha") return "Ficha guardada";
  if (notice.kind === "acompanantes") return "Acompañantes guardados";
  if (notice.scope === "acompanante") {
    const n = (notice.personIndex ?? 0) + 1;
    return `Cambio en acompañante ${n}`;
  }
  return "Pide un cambio en la ficha";
}
