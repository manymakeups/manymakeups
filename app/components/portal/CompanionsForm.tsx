"use client";

import { useMemo, useState } from "react";
import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import {
  PERSON_SERVICE_OPTIONS,
  WHO_OPTIONS,
  personInspirationKey,
  type EventDetails,
  type PortalFile,
} from "@/lib/portal/types";

function PersonCard({
  index,
  person,
  clientId,
  inspiration,
}: {
  index: number;
  person: EventDetails["people"][number];
  clientId: string;
  inspiration: PortalFile[];
}) {
  const [wantsTrial, setWantsTrial] = useState(Boolean(person.wantsTrial));
  const knownWho = (WHO_OPTIONS as readonly string[]).includes(person.who);

  return (
    <fieldset className="border border-ink/10 bg-linen/30 p-4">
      <legend className="px-1 text-[0.68rem] uppercase tracking-[0.18em] text-gilt">
        Persona {index + 1}
      </legend>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Quién es
          <select className="field" name={`people.${index}.who`} defaultValue={person.who} required>
            <option value="">Elige…</option>
            {!knownWho && person.who ? <option value={person.who}>{person.who}</option> : null}
            {WHO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Servicio
          <select
            className="field"
            name={`people.${index}.service`}
            defaultValue={person.service || "Maquillaje y peinado"}
          >
            {PERSON_SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 field-label">
        Alergias o sensibilidad
        <textarea
          className="field min-h-24"
          name={`people.${index}.skinNotes`}
          defaultValue={person.skinNotes}
        />
      </label>
      <label className="field-label">
        Lo que quieras que sepa
        <textarea
          className="field min-h-24"
          name={`people.${index}.notes`}
          defaultValue={person.notes}
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
        <input
          type="checkbox"
          name={`people.${index}.wantsTrial`}
          checked={wantsTrial}
          onChange={(event) => setWantsTrial(event.target.checked)}
        />
        Quiere prueba
      </label>
      {wantsTrial ? (
        <label className="mt-4 field-label">
          Notas para la prueba
          <textarea
            className="field min-h-24"
            name={`people.${index}.trialNotes`}
            defaultValue={person.trialNotes}
          />
        </label>
      ) : null}
      <div className="mt-4">
        <PhotoPicker
          personKey={personInspirationKey(index)}
          files={inspiration}
          clientId={clientId}
          action="/api/portal/inspiration"
          tab="acompanantes"
        />
      </div>
    </fieldset>
  );
}

export function CompanionsForm({
  event,
  action,
  clientId,
  inspiration,
}: {
  event: EventDetails;
  action: string;
  clientId: string;
  inspiration: PortalFile[];
}) {
  const initial = Math.min(20, Math.max(0, event.peopleCount || 0));
  const [count, setCount] = useState(initial);
  const people = useMemo(() => {
    return Array.from({ length: count }, (_, i) => event.people?.[i] ?? {
      who: "",
      service: "Maquillaje y peinado",
      wantsTrial: false,
      trialNotes: "",
      skinNotes: "",
      notes: "",
      productsUsed: "",
      budgetAmount: "",
      budgetNumber: "",
    });
  }, [count, event]);

  return (
    <form action={action} method="post" className="flex flex-col gap-4">
      <label className="field-label max-w-xs">
        Nº de personas a atender
        <input
          className="field"
          name="peopleCount"
          type="number"
          min={0}
          max={20}
          value={count}
          required
          onChange={(event) => setCount(Math.min(20, Math.max(0, Number(event.target.value) || 0)))}
        />
      </label>
      <div className="mt-2 flex flex-col gap-6">
        {people.map((person, i) => (
          <PersonCard
            key={i}
            index={i}
            person={person}
            clientId={clientId}
            inspiration={inspiration}
          />
        ))}
      </div>
      {count === 0 ? (
        <p className="text-sm text-ash">Si no hay acompañantes, deja este número en 0.</p>
      ) : null}
      <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
        Guardar acompañantes
      </button>
    </form>
  );
}
