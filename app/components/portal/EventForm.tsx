"use client";

import { useMemo, useState } from "react";
import { SERVICE_OPTIONS, type EventDetails } from "@/lib/portal/types";

export function EventForm({
  event,
  action,
  submitLabel,
}: {
  event: EventDetails;
  action: string;
  submitLabel: string;
}) {
  const initial = Math.min(20, Math.max(1, event.peopleCount || 1));
  const [count, setCount] = useState(initial);
  const people = useMemo(() => {
    return Array.from({ length: count }, (_, i) => event.people?.[i] ?? {
      who: i === 0 ? event.clientName : "",
      service: "Maquillaje y peinado",
      budgetAmount: "",
      budgetNumber: "",
    });
  }, [count, event]);

  return (
    <form action={action} method="post" className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Tu nombre
          <input className="field" name="clientName" defaultValue={event.clientName} required />
        </label>
        <label className="field-label">
          Nombre de tu pareja
          <input className="field" name="partnerName" defaultValue={event.partnerName} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Teléfono
          <input className="field" name="phone" type="tel" defaultValue={event.phone} />
        </label>
        <label className="field-label">
          Tipo de evento
          <select className="field" name="eventType" defaultValue={event.eventType}>
            <option value="boda">Boda</option>
            <option value="evento">Evento</option>
            <option value="otro">Otro</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Fecha
          <input className="field" name="eventDate" type="date" defaultValue={event.eventDate} />
        </label>
        <label className="field-label">
          Lugar de la celebración
          <input className="field" name="venue" defaultValue={event.venue} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Dónde os preparáis
          <input className="field" name="gettingReadyPlace" defaultValue={event.gettingReadyPlace} />
        </label>
        <label className="field-label">
          Hora de prepararos
          <input className="field" name="gettingReadyTime" type="time" defaultValue={event.gettingReadyTime} />
        </label>
      </div>
      <label className="field-label">
        Hora de ceremonia o inicio
        <input className="field" name="ceremonyTime" type="time" defaultValue={event.ceremonyTime} />
      </label>
      <label className="field-label max-w-xs">
        Nº de personas a atender
        <input
          className="field"
          name="peopleCount"
          type="number"
          min={1}
          max={20}
          value={count}
          required
          onChange={(event) => setCount(Math.min(20, Math.max(1, Number(event.target.value) || 1)))}
        />
      </label>

      <div className="mt-2 flex flex-col gap-6">
        {people.map((person, i) => (
          <fieldset key={i} className="border border-ink/10 bg-linen/30 p-4">
            <legend className="px-1 text-[0.68rem] uppercase tracking-[0.18em] text-gilt">
              {i === 0 ? "Persona 1 · Tú" : `Persona ${i + 1} · Acompañante`}
            </legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="field-label">
                Quién es
                <input
                  className="field"
                  name={`people.${i}.who`}
                  defaultValue={person.who}
                  placeholder={i === 0 ? "Nombre y rol (novia, clienta…)" : "Nombre y rol (madre, madrina…)"}
                  required
                />
              </label>
              <label className="field-label">
                Servicio
                <select className="field" name={`people.${i}.service`} defaultValue={person.service}>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Importe del presupuesto
                <input
                  className="field"
                  name={`people.${i}.budgetAmount`}
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={person.budgetAmount}
                  placeholder="€"
                />
              </label>
              <label className="field-label">
                Nº de presupuesto
                <input
                  className="field"
                  name={`people.${i}.budgetNumber`}
                  defaultValue={person.budgetNumber}
                />
              </label>
            </div>
          </fieldset>
        ))}
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="field-label mb-1">Extras del evento</legend>
        <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" name="makeup" defaultChecked={event.makeup} />
          Maquillaje (grupo / extras)
        </label>
        <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" name="hair" defaultChecked={event.hair} />
          Peinado (grupo / extras)
        </label>
        <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" name="glitterBar" defaultChecked={event.glitterBar} />
          Glitter Bar
        </label>
        <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" name="beautyCorner" defaultChecked={event.beautyCorner} />
          Beauty Corner
        </label>
      </fieldset>
      <label className="field-label">
        Notas para la prueba
        <textarea className="field min-h-24" name="trialNotes" defaultValue={event.trialNotes} />
      </label>
      <label className="field-label">
        Piel, alergias o sensibilidad
        <textarea className="field min-h-24" name="skinNotes" defaultValue={event.skinNotes} />
      </label>
      <label className="field-label">
        Lo que quieras que sepa
        <textarea className="field min-h-28" name="notes" defaultValue={event.notes} />
      </label>
      <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
