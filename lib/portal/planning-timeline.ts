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

export function planningTimeline(
  planning: EventPlanning,
  people: { id: string; label: string }[],
  copy: PortalCopy,
): TimelineRow[] {
  const rows: TimelineRow[] = [];
  const at = (time: string) => interpolate(copy.planningAt, { time: clock(time) });
  if (planning.arrivalTime) {
    rows.push({
      id: "arrival",
      label: copy.planningArrivalShort,
      when: at(planning.arrivalTime),
      note: "",
      minutes: minutesOf(planning.arrivalTime),
    });
  }
  const start = clock(planning.setPrepStart);
  const end = clock(planning.setPrepEnd);
  if (start || end || planning.setPrep) {
    const when =
      start && end ? interpolate(copy.planningFromTo, { start, end }) : start ? at(start) : end ? at(end) : "";
    rows.push({
      id: "set",
      label: copy.planningSet,
      when,
      note: planning.setPrep,
      minutes: minutesOf(start || end),
    });
  }
  for (const person of people) {
    const slot = planning.slots.find((item) => item.id === person.id);
    if (!slot || (!slot.time && !slot.note)) continue;
    rows.push({
      id: person.id,
      label: person.label,
      when: slot.time ? at(slot.time) : "",
      note: slot.note,
      minutes: minutesOf(slot.time),
    });
  }
  if (planning.breakTime || planning.breaks) {
    rows.push({
      id: "break",
      label: copy.planningBreaks,
      when: planning.breakTime ? at(planning.breakTime) : "",
      note: planning.breaks,
      minutes: minutesOf(planning.breakTime),
    });
  }
  for (const extra of planning.extras) {
    if (!extra.label && !extra.time && !extra.note) continue;
    rows.push({
      id: extra.id,
      label: extra.label || copy.planningExtra,
      when: extra.time ? at(extra.time) : "",
      note: extra.note,
      minutes: minutesOf(extra.time),
    });
  }
  if (planning.packUpTime || planning.packUp) {
    rows.push({
      id: "pack",
      label: copy.planningPack,
      when: planning.packUpTime ? at(planning.packUpTime) : "",
      note: planning.packUp,
      minutes: minutesOf(planning.packUpTime),
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
