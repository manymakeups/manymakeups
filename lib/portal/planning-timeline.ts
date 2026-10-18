import { interpolate, type PortalCopy } from "@/lib/i18n/portal-messages";
import type { EventPlanning } from "./types";

export type TimelineRow = {
  id: string;
  label: string;
  when: string;
  note: string;
  minutes: number | null;
};

function minutesOf(value: string) {
  const match = /^(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (hours > 23 || mins > 59) return null;
  return hours * 60 + mins;
}

function clock(value: string) {
  const match = /^(\d{2}:\d{2})/.exec(value.trim());
  return match ? match[1] : "";
}

function span(start: string, end: string, copy: PortalCopy) {
  const from = clock(start);
  const to = clock(end);
  if (from && to) return interpolate(copy.planningRange, { start: from, end: to });
  if (from) return interpolate(copy.planningAt, { time: from });
  if (to) return interpolate(copy.planningAt, { time: to });
  return "";
}

export function planningTimeline(
  planning: EventPlanning,
  people: { id: string; label: string; service?: string }[],
  copy: PortalCopy,
): TimelineRow[] {
  const rows: TimelineRow[] = [];
  const setStart = clock(planning.setPrepStart);
  const setEnd = clock(planning.setPrepEnd);
  if (planning.arrivalTime && clock(planning.arrivalTime) !== setStart) {
    rows.push({
      id: "arrival",
      label: copy.planningArrivalShort,
      when: span(planning.arrivalTime, "", copy),
      note: "",
      minutes: minutesOf(planning.arrivalTime),
    });
  }
  if (setStart || setEnd || planning.setPrep) {
    rows.push({
      id: "set",
      label: copy.planningSet,
      when: span(setStart, setEnd, copy),
      note: planning.setPrep,
      minutes: minutesOf(setStart || setEnd),
    });
  }
  for (const person of people) {
    const slot = planning.slots.find((item) => item.id === person.id);
    if (!slot || (!slot.time && !slot.endTime && !slot.note)) continue;
    const service = person.service?.trim();
    rows.push({
      id: person.id,
      label: service ? `${service} ${person.label}` : person.label,
      when: span(slot.time, slot.endTime, copy),
      note: slot.note,
      minutes: minutesOf(slot.time || slot.endTime),
    });
  }
  if (planning.breakTime || planning.breakEnd || planning.breaks) {
    rows.push({
      id: "break",
      label: copy.planningBreaks,
      when: span(planning.breakTime, planning.breakEnd, copy),
      note: planning.breaks,
      minutes: minutesOf(planning.breakTime || planning.breakEnd),
    });
  }
  for (const extra of planning.extras) {
    if (!extra.label && !extra.time && !extra.endTime && !extra.note) continue;
    rows.push({
      id: extra.id,
      label: extra.label || copy.planningExtra,
      when: span(extra.time, extra.endTime, copy),
      note: extra.note,
      minutes: minutesOf(extra.time || extra.endTime),
    });
  }
  if (planning.packUpTime || planning.packUpEnd || planning.packUp) {
    rows.push({
      id: "pack",
      label: copy.planningPack,
      when: span(planning.packUpTime, planning.packUpEnd, copy),
      note: planning.packUp,
      minutes: minutesOf(planning.packUpTime || planning.packUpEnd),
    });
  }
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      if (a.row.minutes === null && b.row.minutes === null) return a.index - b.index;
      if (a.row.minutes === null) return 1;
      if (b.row.minutes === null) return -1;
      if (a.row.minutes !== b.row.minutes) return a.row.minutes - b.row.minutes;
      return a.index - b.index;
    })
    .map((item) => item.row);
}
