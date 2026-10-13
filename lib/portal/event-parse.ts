import {
  emptyAttendee,
  type Attendee,
  type EventDetails,
  type EventType,
} from "./types";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function flag(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

function eventType(value: string): EventType {
  if (value === "evento" || value === "otro") return value;
  return "boda";
}

function peopleFromForm(form: FormData, count: number, fallback: Attendee[]): Attendee[] {
  return Array.from({ length: count }, (_, i) => {
    const prev = fallback[i] ?? emptyAttendee();
    return {
      who: text(form.get(`people.${i}.who`)) || prev.who,
      service: text(form.get(`people.${i}.service`)) || prev.service,
      budgetAmount: text(form.get(`people.${i}.budgetAmount`)),
      budgetNumber: text(form.get(`people.${i}.budgetNumber`)),
    };
  });
}

export function eventFromForm(form: FormData, fallback: EventDetails): EventDetails {
  const peopleRaw = Number.parseInt(text(form.get("peopleCount")), 10);
  const peopleCount = Number.isFinite(peopleRaw) && peopleRaw > 0 ? Math.min(20, peopleRaw) : 1;
  return {
    clientName: text(form.get("clientName")) || fallback.clientName,
    partnerName: text(form.get("partnerName")),
    phone: text(form.get("phone")),
    eventType: eventType(text(form.get("eventType"))),
    eventDate: text(form.get("eventDate")),
    venue: text(form.get("venue")),
    gettingReadyPlace: text(form.get("gettingReadyPlace")),
    gettingReadyTime: text(form.get("gettingReadyTime")),
    ceremonyTime: text(form.get("ceremonyTime")),
    peopleCount,
    people: peopleFromForm(form, peopleCount, fallback.people ?? []),
    makeup: flag(form.get("makeup")),
    hair: flag(form.get("hair")),
    glitterBar: flag(form.get("glitterBar")),
    beautyCorner: flag(form.get("beautyCorner")),
    trialNotes: text(form.get("trialNotes")),
    skinNotes: text(form.get("skinNotes")),
    notes: text(form.get("notes")),
  };
}
