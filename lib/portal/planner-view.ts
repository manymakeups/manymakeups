import { portalEs } from "@/lib/i18n/portal-messages";
import { contractedServiceNames } from "./budget";
import { companionHeading, fullName } from "./names";
import { planningTimeline, sidePlanningRows } from "./planning-timeline";
import type { ClientRecord } from "./types";

export type PlannerRow = { id: string; when: string; label: string; note: string };

export type PlannerBlock = {
  id: string;
  title: string;
  location: string;
  rows: PlannerRow[];
  notes: string;
  policy: boolean;
};

function dated(value: string) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function peopleOf(client: ClientRecord) {
  const copy = portalEs;
  return [
    {
      id: "contractor",
      label: fullName(client.event, client.name) || copy.contractor,
      service: contractedServiceNames(client.event).join(" y "),
    },
    ...client.event.people.map((person, index) => ({
      id: `g:${index}`,
      label: companionHeading(person, copy.whoOptions, `Acompañante ${index + 1}`),
      service: person.service?.trim() ?? "",
    })),
  ];
}

export function plannerService(client: ClientRecord) {
  const copy = portalEs;
  const event = client.event;
  const blocks: PlannerBlock[] = [
    {
      id: "evento",
      title: "Planning del evento",
      location: event.planning.location,
      rows: planningTimeline(event.planning, peopleOf(client), copy),
      notes: event.planning.notes,
      policy: false,
    },
  ];
  if (event.glitterBar) {
    blocks.push({
      id: "glitter",
      title: copy.glitterBar,
      location: event.planning.glitter.location,
      rows: sidePlanningRows({ ...event.planning.glitter, on: true }, copy.glitterBar, copy),
      notes: "",
      policy: true,
    });
  }
  if (event.beautyCorner) {
    blocks.push({
      id: "beauty",
      title: copy.beautyCorner,
      location: event.planning.beauty.location,
      rows: sidePlanningRows({ ...event.planning.beauty, on: true }, copy.beautyCorner, copy),
      notes: "",
      policy: true,
    });
  }
  return {
    name: fullName(event, client.name),
    stylist: event.stylist,
    date: dated(event.eventDate),
    venue: event.venue,
    services: contractedServiceNames(event).join(" · "),
    blocks,
    policyTitle: copy.premiumMailTimesTitle,
    policy: copy.premiumMailTimes,
    important: copy.premiumMailImportant,
    importantBody: copy.premiumMailImportantBody,
  };
}

export function plannerPlanningLines(client: ClientRecord) {
  const service = plannerService(client);
  const lines = [
    "Many Makeups",
    `Planning de ${service.name}`,
    "",
    `Estilista asignado: ${service.stylist || "—"}`,
    `Fecha: ${service.date || "—"}`,
    `Lugar: ${service.venue || "—"}`,
    `Servicios: ${service.services || "—"}`,
  ];
  for (const block of service.blocks) {
    lines.push("", block.title);
    if (block.location) lines.push(`Ubicación: ${block.location}`);
    if (!block.rows.length && !block.location && !block.notes) lines.push("Todavía no hay planning del día.");
    for (const row of block.rows) {
      lines.push(`${row.when || "—"}  ${row.label}`);
      if (row.note) lines.push(row.note);
    }
    if (block.notes) {
      lines.push("Notas");
      lines.push(block.notes);
    }
    if (block.policy) {
      lines.push("");
      lines.push(service.policyTitle);
      lines.push(service.policy);
      lines.push(`${service.important} ${service.importantBody}`);
    }
  }
  return lines;
}
