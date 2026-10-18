import { PlanningExtras } from "@/app/components/portal/PlanningExtras";
import { companionHeading, fullName } from "@/lib/portal/names";
import { planningTimeline } from "@/lib/portal/planning-timeline";
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
  const timeline = planningTimeline(planning, peopleOf(eventName, event, people, copy), copy);
  const filled = Boolean(planning.location || planning.notes || timeline.length);
  return (
    <div className="flex max-w-2xl flex-col gap-6 text-sm">
      <div className="flex justify-center">
        <img src="/brand/logo.jpg" alt="Many Makeups" width={168} height={168} className="size-40" />
      </div>
      {!filled ? <p className="text-center text-sm text-ash">{copy.planningEmpty}</p> : null}
      {planning.location ? (
        <p>
          <span className="text-ash">{copy.planningLocation}</span>
          <span className="mt-1 block">{planning.location}</span>
        </p>
      ) : null}
      {timeline.length ? (
        <ul className="divide-y divide-ink/10 border border-ink/10">
          {timeline.map((row) => (
            <li key={row.id} className="px-4 py-3">
              <p className="font-serif text-xl">{row.label}</p>
              {row.when ? <p className="mt-1">{row.when}</p> : null}
              {row.note ? <p className="mt-1 whitespace-pre-wrap text-ash">{row.note}</p> : null}
            </li>
          ))}
        </ul>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Preparación del set, desde
          <input className="field" name="setPrepStart" type="time" defaultValue={planning.setPrepStart} />
        </label>
        <label className="field-label">
          Hasta
          <input className="field" name="setPrepEnd" type="time" defaultValue={planning.setPrepEnd} />
        </label>
      </div>
      <label className="field-label">
        Nota de la preparación
        <input className="field" name="setPrep" defaultValue={planning.setPrep} />
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
      <PlanningExtras extras={planning.extras} />
      <label className="field-label">
        Hora del descanso
        <input className="field" name="breakTime" type="time" defaultValue={planning.breakTime} />
      </label>
      <label className="field-label">
        Nota del descanso
        <textarea className="field min-h-20" name="breaks" defaultValue={planning.breaks} />
      </label>
      <label className="field-label">
        Fin de servicio
        <input className="field" name="packUpTime" type="time" defaultValue={planning.packUpTime} />
      </label>
      <label className="field-label">
        Nota del fin de servicio
        <input className="field" name="packUp" defaultValue={planning.packUp} />
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
