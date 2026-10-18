import { companionHeading, fullName } from "@/lib/portal/names";
import { interpolate, portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import type { Attendee, EventPlanning } from "@/lib/portal/types";

function peopleOf(eventName: string, event: { clientName?: string; clientLastName?: string }, people: Attendee[], copy: PortalCopy) {
  return [
    { id: "contractor", label: fullName(event, eventName) || copy.contractor },
    ...people.map((person, index) => ({
      id: `g:${index}`,
      label: companionHeading(person, copy.whoOptions, interpolate(copy.guestN, { n: index + 1 })),
    })),
  ];
}

export function PlanningView({
  planning,
  eventName,
  event,
  people,
  copy,
}: {
  planning: EventPlanning;
  eventName: string;
  event: { clientName?: string; clientLastName?: string };
  people: Attendee[];
  copy: PortalCopy;
}) {
  const rows = peopleOf(eventName, event, people, copy);
  const slots = rows
    .map((person) => {
      const slot = planning.slots.find((item) => item.id === person.id);
      return { ...person, time: slot?.time || "", note: slot?.note || "" };
    })
    .filter((slot) => slot.time || slot.note);
  const filled =
    planning.location ||
    planning.arrivalTime ||
    planning.setPrep ||
    planning.breaks ||
    planning.packUp ||
    planning.notes ||
    slots.length;
  if (!filled) return <p className="text-sm text-ash">{copy.planningEmpty}</p>;
  return (
    <div className="flex max-w-2xl flex-col gap-6 text-sm">
      <dl className="space-y-3">
        {planning.location ? (
          <div>
            <dt className="text-ash">{copy.planningLocation}</dt>
            <dd className="mt-1">{planning.location}</dd>
          </div>
        ) : null}
        {planning.arrivalTime ? (
          <div>
            <dt className="text-ash">{copy.planningArrival}</dt>
            <dd className="mt-1">{planning.arrivalTime}</dd>
          </div>
        ) : null}
        {planning.setPrep ? (
          <div>
            <dt className="text-ash">{copy.planningSet}</dt>
            <dd className="mt-1 whitespace-pre-wrap">{planning.setPrep}</dd>
          </div>
        ) : null}
      </dl>
      {slots.length ? (
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{copy.planningSchedule}</p>
          <ul className="mt-3 divide-y divide-ink/10 border border-ink/10">
            {slots.map((slot) => (
              <li key={slot.id} className="px-4 py-3">
                <p className="font-serif text-xl">{slot.label}</p>
                {slot.time ? <p className="mt-1">{slot.time}</p> : null}
                {slot.note ? <p className="mt-1 whitespace-pre-wrap text-ash">{slot.note}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {planning.breaks ? (
        <div>
          <p className="text-ash">{copy.planningBreaks}</p>
          <p className="mt-1 whitespace-pre-wrap">{planning.breaks}</p>
        </div>
      ) : null}
      {planning.packUp ? (
        <div>
          <p className="text-ash">{copy.planningPack}</p>
          <p className="mt-1 whitespace-pre-wrap">{planning.packUp}</p>
        </div>
      ) : null}
      {planning.notes ? (
        <div>
          <p className="text-ash">{copy.planningNotes}</p>
          <p className="mt-1 whitespace-pre-wrap">{planning.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

export function PlanningForm({
  clientId,
  planning,
  eventName,
  event,
  people,
}: {
  clientId: string;
  planning: EventPlanning;
  eventName: string;
  event: { clientName?: string; clientLastName?: string };
  people: Attendee[];
}) {
  const rows = peopleOf(eventName, event, people, portalEs);
  return (
    <form action="/api/admin/planning" method="post" className="grid max-w-xl gap-4">
      <input type="hidden" name="clientId" value={clientId} />
      <label className="field-label">
        Localización
        <input className="field" name="location" defaultValue={planning.location} />
      </label>
      <label className="field-label">
        Hora de llegada
        <input className="field" name="arrivalTime" type="time" defaultValue={planning.arrivalTime} />
      </label>
      <label className="field-label">
        Preparación del set
        <input className="field" name="setPrep" defaultValue={planning.setPrep} placeholder="45 min, desde las 8:00" />
      </label>
      <div className="flex flex-col gap-3">
        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">Horario</p>
        {rows.map((person) => {
          const slot = planning.slots.find((item) => item.id === person.id);
          return (
            <fieldset key={person.id} className="border border-ink/10 p-3">
              <legend className="px-1 text-sm">{person.label}</legend>
              <input type="hidden" name="slotId" value={person.id} />
              <label className="field-label mt-2">
                Hora
                <input className="field" name={`slotTime.${person.id}`} type="time" defaultValue={slot?.time || ""} />
              </label>
              <label className="field-label mt-3">
                Notas
                <input className="field" name={`slotNote.${person.id}`} defaultValue={slot?.note || ""} />
              </label>
            </fieldset>
          );
        })}
      </div>
      <label className="field-label">
        Descansos
        <textarea className="field min-h-20" name="breaks" defaultValue={planning.breaks} />
      </label>
      <label className="field-label">
        Recogida
        <input className="field" name="packUp" defaultValue={planning.packUp} placeholder="20 min, a las 14:30" />
      </label>
      <label className="field-label">
        Notas adicionales
        <textarea className="field min-h-28" name="notes" defaultValue={planning.notes} />
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-atelier btn-atelier-solid" type="submit" name="intent" value="save">
          Guardar planning
        </button>
        <button className="btn-atelier" type="submit" name="intent" value="send">
          Guardar y enviar por mail
        </button>
      </div>
    </form>
  );
}
