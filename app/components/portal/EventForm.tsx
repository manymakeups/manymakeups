"use client";

import { useMemo, useRef, useState } from "react";
import { DeleteFileButton } from "@/app/components/portal/FileActions";
import { isImageType } from "@/lib/portal/files";
import {
  CONTRACTOR_INSPIRATION,
  PERSON_SERVICE_OPTIONS,
  WHO_OPTIONS,
  personInspirationKey,
  type EventDetails,
  type PortalFile,
} from "@/lib/portal/types";

function fileHref(clientId: string, id: string) {
  return `/api/portal/file?client=${clientId}&id=${id}`;
}

function filesFor(files: PortalFile[], key: string) {
  if (key === CONTRACTOR_INSPIRATION) {
    return files.filter(
      (file) => file.label === CONTRACTOR_INSPIRATION || file.label === "Inspiración",
    );
  }
  return files.filter((file) => file.label === key);
}

function InspirationPicker({
  personKey,
  files,
  clientId,
}: {
  personKey: string;
  files: PortalFile[];
  clientId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const shown = filesFor(files, personKey);

  async function upload() {
    const chosen = inputRef.current?.files;
    if (!chosen?.length) return;
    const body = new FormData();
    body.set("person", personKey);
    for (const file of chosen) body.append("files", file);
    setBusy(true);
    await fetch("/api/portal/inspiration", { method: "POST", body });
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="field-label">
        Inspiraciones
        <input
          ref={inputRef}
          className="field"
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
        />
      </label>
      <button
        className="btn-atelier self-start"
        type="button"
        disabled={busy}
        onClick={upload}
      >
        {busy ? "Subiendo…" : "Adjuntar fotos"}
      </button>
      {shown.length ? (
        <ul className="grid gap-3 sm:grid-cols-3">
          {shown.map((file) => (
            <li key={file.id} className="border border-ink/10 bg-white/40 p-2">
              {isImageType(file.mime) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fileHref(clientId, file.id)}
                  alt=""
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : null}
              <p className="mt-2 truncate text-xs">{file.name}</p>
              <DeleteFileButton id={file.id} kind="inspiration" label="Quitar" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

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
        <div className="mt-4 flex flex-col gap-4">
          <label className="field-label">
            Notas para la prueba
            <textarea
              className="field min-h-24"
              name={`people.${index}.trialNotes`}
              defaultValue={person.trialNotes}
            />
          </label>
          <label className="field-label">
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
        </div>
      ) : null}
      <div className="mt-4">
        <InspirationPicker
          personKey={personInspirationKey(index)}
          files={inspiration}
          clientId={clientId}
        />
      </div>
    </fieldset>
  );
}

export function EventForm({
  event,
  action,
  submitLabel,
  clientId,
  inspiration,
}: {
  event: EventDetails;
  action: string;
  submitLabel: string;
  clientId: string;
  inspiration: PortalFile[];
}) {
  const initial = Math.min(20, Math.max(1, event.peopleCount || 1));
  const [count, setCount] = useState(initial);
  const people = useMemo(() => {
    return Array.from({ length: count }, (_, i) => event.people?.[i] ?? {
      who: "",
      service: "Maquillaje y peinado",
      wantsTrial: false,
      trialNotes: "",
      skinNotes: "",
      notes: "",
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

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="field-label mb-1">Servicios de la contratante</legend>
        <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" name="makeup" defaultChecked={event.makeup} />
          Maquillaje
        </label>
        <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" name="hair" defaultChecked={event.hair} />
          Peinado
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
      <InspirationPicker
        personKey={CONTRACTOR_INSPIRATION}
        files={inspiration}
        clientId={clientId}
      />

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
          <PersonCard
            key={i}
            index={i}
            person={person}
            clientId={clientId}
            inspiration={inspiration}
          />
        ))}
      </div>

      <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
