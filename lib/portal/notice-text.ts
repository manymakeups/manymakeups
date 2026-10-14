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
  const name = person.name?.trim();
  const who = person.who || "—";
  return `${index + 1}. ${name ? `${name} · ${who}` : who} · ${person.service} · ${trial}`;
}

function shown(value: string) {
  const text = value.trim();
  return text || "—";
}

export function valueChange(where: string, before: string, after: string) {
  return `De: ${where}\n\nAntes: ${shown(before)}\nAhora: ${shown(after)}`;
}

export function valueChanges(rows: { where: string; before: string; after: string }[]) {
  const changed = rows.filter((row) => shown(row.before) !== shown(row.after));
  if (!changed.length) return "";
  return changed.map((row) => valueChange(row.where, row.before, row.after)).join("\n\n");
}

function yesNo(value: boolean) {
  return value ? "Sí" : "No";
}

export function personTitle(person: Attendee | undefined, index: number) {
  if (!person) return `Acompañante ${index + 1}`;
  const name = person.name?.trim() ?? "";
  const who = person.who?.trim() ?? "";
  if (name && who) return `${name} · ${who}`;
  return name || who || `Acompañante ${index + 1}`;
}

export function eventChangeMessage(before: EventDetails, after: EventDetails) {
  const text = valueChanges([
    { where: "Datos del evento · Nombre", before: before.clientName, after: after.clientName },
    { where: "Datos del evento · Apellidos", before: before.clientLastName, after: after.clientLastName },
    { where: "Datos del evento · Pareja", before: before.partnerName, after: after.partnerName },
    { where: "Datos del evento · Teléfono", before: before.phone, after: after.phone },
    { where: "Datos del evento · Tipo", before: before.eventType, after: after.eventType },
    { where: "Datos del evento · Fecha", before: before.eventDate, after: after.eventDate },
    { where: "Datos del evento · Lugar", before: before.venue, after: after.venue },
    { where: "Datos del evento · Preparación", before: before.gettingReadyPlace, after: after.gettingReadyPlace },
    { where: "Datos del evento · Hora de preparación", before: before.gettingReadyTime, after: after.gettingReadyTime },
    { where: "Datos del evento · Ceremonia", before: before.ceremonyTime, after: after.ceremonyTime },
    { where: "Datos del evento · Maquillaje", before: yesNo(before.makeup), after: yesNo(after.makeup) },
    { where: "Datos del evento · Peinado", before: yesNo(before.hair), after: yesNo(after.hair) },
    { where: "Datos del evento · Glitter bar", before: yesNo(before.glitterBar), after: yesNo(after.glitterBar) },
    { where: "Datos del evento · Beauty corner", before: yesNo(before.beautyCorner), after: yesNo(after.beautyCorner) },
    { where: "Datos del evento · Notas de la prueba", before: before.trialNotes, after: after.trialNotes },
    { where: "Datos del evento · Piel", before: before.skinNotes, after: after.skinNotes },
    { where: "Datos del evento · Notas", before: before.notes, after: after.notes },
  ]);
  return text || valueChange("Datos del evento", "sin cambios", "sin cambios");
}

function personFieldChanges(before: Attendee, after: Attendee, where: string) {
  return valueChanges([
    { where: `${where} · Nombre`, before: before.name, after: after.name },
    { where: `${where} · Parentesco`, before: before.who, after: after.who },
    { where: `${where} · Servicio`, before: before.service, after: after.service },
    { where: `${where} · Prueba`, before: yesNo(before.wantsTrial), after: yesNo(after.wantsTrial) },
    { where: `${where} · Notas de la prueba`, before: before.trialNotes, after: after.trialNotes },
    { where: `${where} · Piel`, before: before.skinNotes, after: after.skinNotes },
    { where: `${where} · Notas`, before: before.notes, after: after.notes },
  ]);
}

export function companionsChangeMessage(before: EventDetails, after: EventDetails) {
  const lines: string[] = [];
  const count = Math.max(before.people.length, after.people.length);
  for (let index = 0; index < count; index += 1) {
    const prev = before.people[index];
    const next = after.people[index];
    if (prev && !next) {
      lines.push(valueChange(`Acompañantes · ${personTitle(prev, index)}`, personLine(prev, index), ""));
      continue;
    }
    if (!prev && next) {
      lines.push(valueChange(`Acompañantes · ${personTitle(next, index)} · Nueva`, "", personLine(next, index)));
      continue;
    }
    if (!prev || !next) continue;
    const part = personFieldChanges(prev, next, `Acompañantes · ${personTitle(prev, index)}`);
    if (part) lines.push(part);
  }
  return lines.join("\n\n") || valueChange("Acompañantes", "sin cambios", "sin cambios");
}

export function newCompanionMessage(person: Attendee, index: number) {
  return valueChange(`Acompañantes · ${personTitle(person, index)} · Nueva`, "", personLine(person, index));
}

export function inspirationPlace(label: string, people: Attendee[]) {
  const person = /^persona-(\d+)(?:-(maquillaje|peinado))?$/.exec(label);
  if (person) {
    const index = Number(person[1]);
    const look = person[2] === "peinado" ? "Peinado" : "Maquillaje";
    return `Inspiraciones · ${personTitle(people[index], index)} · ${look}`;
  }
  const look = label.includes("peinado") ? "Peinado" : "Maquillaje";
  return `Inspiraciones · Evento · ${look}`;
}

export function noticeTitle(notice: StudioNotice) {
  if (notice.kind === "ficha") return "Ficha guardada";
  if (notice.kind === "acompanantes") return "Acompañantes guardados";
  if (notice.kind === "fotos") return "Fotos de inspiración";
  if (notice.kind === "documento") return "Documentación";
  if (notice.kind === "agenda") return "Cita";
  if (notice.kind === "respuesta") return "Respuesta";
  if (notice.scope === "acompanante") {
    const n = (notice.personIndex ?? 0) + 1;
    return `Cambio en acompañante ${n}`;
  }
  return "Pide un cambio en la ficha";
}
