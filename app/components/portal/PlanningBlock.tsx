import { BrandLogo } from "@/app/components/BrandLogo";
import { PlanningExtras } from "@/app/components/portal/PlanningExtras";
import { SubTabs } from "@/app/components/portal/SubTabs";
import { contractedServiceNames, serviceAmountDue } from "@/lib/portal/budget";
import { companionHeading, fullName } from "@/lib/portal/names";
import { planningTimeline, sidePlanningRows } from "@/lib/portal/planning-timeline";
import type { Locale } from "@/lib/i18n/config";
import { dateLocale, interpolate, portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import type { Attendee, ClientRecord, EventDetails, EventPlanning, SidePlanning } from "@/lib/portal/types";

function peopleOf(eventName: string, event: EventDetails, people: Attendee[], copy: PortalCopy) {
  return [
    {
      id: "contractor",
      label: fullName(event, eventName) || copy.contractor,
      service: contractedServiceNames(event).join(" y "),
    },
    ...people.map((person, index) => ({
      id: `g:${index}`,
      label: companionHeading(person, copy.whoOptions, interpolate(copy.guestN, { n: index + 1 })),
      service: person.service?.trim() ?? "",
    })),
  ];
}

export function PlanningView({
  planning,
  eventName,
  event,
  people,
  copy,
  locale = "es",
  client,
}: {
  planning: EventPlanning;
  eventName: string;
  event: EventDetails;
  people: Attendee[];
  copy: PortalCopy;
  locale?: Locale;
  client?: Pick<ClientRecord, "history" | "payments"> | null;
}) {
  const timeline = planningTimeline(planning, peopleOf(eventName, event, people, copy), copy);
  const due = client ? serviceAmountDue(client) : 0;
  const amount =
    due > 0
      ? new Intl.NumberFormat(dateLocale(locale), { style: "currency", currency: "EUR" }).format(due)
      : "";
  const eventDate = event.eventDate
    ? new Date(`${event.eventDate}T12:00:00`).toLocaleDateString(dateLocale(locale), {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const filled = Boolean(
    planning.location || planning.address || planning.notes || timeline.length || amount || eventDate,
  );
  return (
    <div className="flex max-w-2xl flex-col gap-6 text-sm">
      <a className="btn-atelier self-start" href="/api/portal/planning-pdf?plan=evento">
        {copy.planningDownload}
      </a>
      <div className="flex justify-center">
        <BrandLogo size="block" className="size-40" />
      </div>
      {!filled ? <p className="text-center text-sm text-ash">{copy.planningEmpty}</p> : null}
      {planning.location ? <p className="text-center uppercase tracking-[0.14em] text-ink">{planning.location}</p> : null}
      {planning.address ? <p className="text-center text-ink">{planning.address}</p> : null}
      {eventDate ? <p className="text-center text-ink">{eventDate}</p> : null}
      {amount ? (
        <div className="border-y border-ink/10 py-4 text-center">
          <p className="font-serif text-xl text-ink">{interpolate(copy.planningPending, { amount })}</p>
          <p className="mt-2 leading-6 text-ash">{copy.planningCashNote}</p>
        </div>
      ) : null}
      {timeline.length ? (
        <ul className="divide-y divide-ink/10 border border-ink/10">
          {timeline.map((row) => (
            <li key={row.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-4">
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-gilt">{row.when}</p>
              <div>
                <p className="font-serif text-xl">{row.label}</p>
                {row.note ? <p className="mt-1 whitespace-pre-wrap text-ash">{row.note}</p> : null}
              </div>
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

function SidePlanningView({
  title,
  plan,
  copy,
  download,
}: {
  title: string;
  plan: SidePlanning;
  copy: PortalCopy;
  download: "glitter" | "beauty";
}) {
  const rows = sidePlanningRows({ ...plan, on: true }, title, copy);
  return (
    <div className="flex max-w-2xl flex-col gap-6 text-sm">
      <a className="btn-atelier self-start" href={`/api/portal/planning-pdf?plan=${download}`}>
        {copy.planningDownload}
      </a>
      <div className="flex flex-col gap-3 leading-6 text-ink">
        <p className="font-serif text-xl">{copy.premiumMailTimesTitle}</p>
        <p>{copy.premiumMailTimes}</p>
        <p>
          <strong>{copy.premiumMailImportant}</strong> {copy.premiumMailImportantBody}
        </p>
      </div>
      {!rows.length && !plan.location && !plan.address ? <p className="text-center text-ash">{copy.planningEmpty}</p> : null}
      {plan.location ? <p className="text-center uppercase tracking-[0.14em] text-ink">{plan.location}</p> : null}
      {plan.address ? <p className="text-center text-ink">{plan.address}</p> : null}
      <SideSchedule title={title} rows={rows} />
    </div>
  );
}

export function ClientPlanning(props: {
  planning: EventPlanning;
  eventName: string;
  event: EventDetails;
  people: Attendee[];
  copy: PortalCopy;
  locale?: Locale;
  client?: Pick<ClientRecord, "history" | "payments"> | null;
  initial?: string;
}) {
  const { planning, event, copy, initial, ...view } = props;
  const main = <PlanningView {...view} planning={planning} event={event} copy={copy} />;
  const extras = [
    event.glitterBar ? { id: "glitter", label: copy.glitterBar, plan: planning.glitter } : null,
    event.beautyCorner ? { id: "beauty", label: copy.beautyCorner, plan: planning.beauty } : null,
  ].filter((item) => item !== null);
  if (!extras.length) return main;
  return (
    <SubTabs
      initial={initial}
      tabs={[
        { id: "evento", label: copy.planningTab, body: main },
        ...extras.map((item) => ({
          id: item.id,
          label: item.label,
          body: (
            <SidePlanningView
              title={item.label}
              plan={item.plan}
              copy={copy}
              download={item.id === "beauty" ? "beauty" : "glitter"}
            />
          ),
        })),
      ]}
    />
  );
}

function SideSchedule({ title, rows }: { title: string; rows: { id: string; label: string; when: string; note: string }[] }) {
  if (!rows.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-serif text-2xl text-ink">{title}</h3>
      <ul className="divide-y divide-ink/10 border border-ink/10">
        {rows.map((row) => (
          <li key={row.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-4">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-gilt">{row.when}</p>
            <div>
              <p className="font-serif text-xl">{row.label}</p>
              {row.note ? <p className="mt-1 whitespace-pre-wrap text-ash">{row.note}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
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
  event: EventDetails;
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
        Dirección
        <input className="field" name="address" defaultValue={planning.address} />
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
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className="field-label">
                  Desde
                  <input className="field" name={`slotTime.${person.id}`} type="time" defaultValue={slot?.time || ""} />
                </label>
                <label className="field-label">
                  Hasta
                  <input className="field" name={`slotEnd.${person.id}`} type="time" defaultValue={slot?.endTime || ""} />
                </label>
              </div>
              <label className="field-label mt-3">
                Notas
                <input className="field" name={`slotNote.${person.id}`} defaultValue={slot?.note || ""} />
              </label>
            </fieldset>
          );
        })}
      </div>
      <PlanningExtras extras={planning.extras} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="field-label">
          Descanso desde
          <input className="field" name="breakTime" type="time" defaultValue={planning.breakTime} />
        </label>
        <label className="field-label">
          Descanso hasta
          <input className="field" name="breakEnd" type="time" defaultValue={planning.breakEnd} />
        </label>
      </div>
      <label className="field-label">
        Nota del descanso
        <textarea className="field min-h-20" name="breaks" defaultValue={planning.breaks} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="field-label">
          Fin de servicio desde
          <input className="field" name="packUpTime" type="time" defaultValue={planning.packUpTime} />
        </label>
        <label className="field-label">
          Fin de servicio hasta
          <input className="field" name="packUpEnd" type="time" defaultValue={planning.packUpEnd} />
        </label>
      </div>
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
