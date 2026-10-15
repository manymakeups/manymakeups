"use client";

import { useMemo, useState } from "react";
import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { WorkView } from "@/app/components/portal/WorkBlock";
import { usePortalCopy } from "@/app/components/portal/usePortalCopy";
import { interpolate, type PortalCopy } from "@/lib/i18n/portal-messages";
import {
  PERSON_SERVICE_OPTIONS,
  WHO_OPTIONS,
  emptyAttendee,
  filesFor,
  personInspirationKey,
  personTrialPhotoKey,
  type Attendee,
  type EventDetails,
  type PortalFile,
} from "@/lib/portal/types";

function PersonInputs({
  index,
  person,
  copy,
}: {
  index: number;
  person: Attendee;
  copy: PortalCopy;
}) {
  const [wantsTrial, setWantsTrial] = useState(Boolean(person.wantsTrial));
  const knownWho = (WHO_OPTIONS as readonly string[]).includes(person.who);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          {copy.personName}
          <input className="field" name={`people.${index}.name`} defaultValue={person.name} />
        </label>
        <label className="field-label">
          {copy.who}
          <select className="field" name={`people.${index}.who`} defaultValue={person.who} required>
            <option value="">{copy.choose}</option>
            {!knownWho && person.who ? <option value={person.who}>{person.who}</option> : null}
            {WHO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {copy.whoOptions[option] ?? option}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label sm:col-span-2">
          {copy.service}
          <select className="field" name={`people.${index}.service`} defaultValue={person.service || "Maquillaje y peinado"}>
            {PERSON_SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {copy.serviceOptions[option] ?? option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 field-label">
        {copy.allergies}
        <textarea className="field min-h-24" name={`people.${index}.skinNotes`} defaultValue={person.skinNotes} />
      </label>
      <label className="field-label">
        {copy.extraNotes}
        <textarea className="field min-h-24" name={`people.${index}.notes`} defaultValue={person.notes} />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
        <input
          type="checkbox"
          name={`people.${index}.wantsTrial`}
          checked={wantsTrial}
          onChange={(event) => setWantsTrial(event.target.checked)}
        />
        {copy.wantsTrial}
      </label>
    </>
  );
}

function PersonCard({
  index,
  person,
  clientId,
  inspiration,
  workPhotos,
  copy,
  showInspiration,
  showTrialWork,
}: {
  index: number;
  person: EventDetails["people"][number];
  clientId: string;
  inspiration: PortalFile[];
  workPhotos: PortalFile[];
  copy?: PortalCopy;
  showInspiration: boolean;
  showTrialWork: boolean;
}) {
  const hooked = usePortalCopy();
  const t = copy ?? hooked;

  return (
    <fieldset className="border border-ink/10 bg-linen/30 p-4">
      <legend className="px-1 text-[0.68rem] uppercase tracking-[0.18em] text-gilt">
        {interpolate(t.personN, { n: index + 1 })}
      </legend>
      <div className="mt-3">
        <PersonInputs index={index} person={person} copy={t} />
        <label className="mt-4 field-label">
          {t.commentsTab}
          <textarea className="field min-h-24" name={`people.${index}.trialNotes`} defaultValue={person.trialNotes} />
        </label>
      </div>
      {person.wantsTrial && showTrialWork ? (
        <div className="mt-6 border-t border-ink/10 pt-6">
          <WorkView
            products={person.productsUsed}
            productLines={person.products}
            photos={filesFor(workPhotos, personTrialPhotoKey(index))}
            clientId={clientId}
            copy={t}
          />
        </div>
      ) : null}
      {showInspiration ? (
        <div className="mt-4">
          <PhotoPicker
            personKey={personInspirationKey(index)}
            files={inspiration}
            clientId={clientId}
            action="/api/portal/inspiration"
            tab="acompanantes"
            localize={!copy}
          />
        </div>
      ) : null}
    </fieldset>
  );
}

export function CompanionsForm({
  event,
  action,
  clientId,
  inspiration,
  workPhotos,
  copy,
  includeClientId = false,
  showInspiration = true,
  showTrialWork = true,
  submitLabel,
}: {
  event: EventDetails;
  action: string;
  clientId: string;
  inspiration: PortalFile[];
  workPhotos: PortalFile[];
  copy?: PortalCopy;
  includeClientId?: boolean;
  showInspiration?: boolean;
  showTrialWork?: boolean;
  submitLabel?: string;
}) {
  const hooked = usePortalCopy();
  const t = copy ?? hooked;
  const initial = Math.min(20, Math.max(0, event.peopleCount || 0));
  const [count, setCount] = useState(initial);
  const people = useMemo(() => {
    return Array.from({ length: count }, (_, i) => event.people?.[i] ?? emptyAttendee());
  }, [count, event]);

  return (
    <form action={action} method="post" className="flex flex-col gap-4">
      {includeClientId ? <input type="hidden" name="clientId" value={clientId} /> : null}
      <div className="flex flex-wrap items-end gap-4">
        <label className="field-label max-w-xs">
          {t.peopleCount}
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
        <button className="btn-atelier" type="button" onClick={() => setCount((value) => Math.min(20, value + 1))}>
          {t.addCompanion}
        </button>
      </div>
      <div className="mt-2 flex flex-col gap-6">
        {people.map((person, i) => (
          <PersonCard
            key={i}
            index={i}
            person={person}
            clientId={clientId}
            inspiration={inspiration}
            workPhotos={workPhotos}
            copy={copy}
            showInspiration={showInspiration}
            showTrialWork={showTrialWork}
          />
        ))}
      </div>
      {count === 0 ? <p className="text-sm text-ash">{t.noCompanions}</p> : null}
      <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
        {submitLabel || t.saveCompanions}
      </button>
    </form>
  );
}

export function PersonDataForm({
  person,
  index,
  clientId,
  action,
  submitLabel = "Guardar",
  copy,
}: {
  person: Attendee;
  index: number;
  clientId: string;
  action: string;
  submitLabel?: string;
  copy?: PortalCopy;
}) {
  const hooked = usePortalCopy();
  const t = copy ?? hooked;
  return (
    <form action={action} method="post" className="flex flex-col gap-2">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="intent" value="update" />
      <input type="hidden" name="personIndex" value={index} />
      <PersonInputs index={index} person={person} copy={t} />
      <button className="btn-atelier mt-4 self-start" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}

export function RemoveCompanionButton({
  clientId,
  index,
  name,
  label,
}: {
  clientId: string;
  index: number;
  name: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={`Eliminar a ${name}`}
        className={
          label
            ? "mb-px inline-flex min-h-11 shrink-0 items-center text-[0.68rem] uppercase tracking-[0.14em] text-ash hover:text-ink"
            : "px-1 text-xs leading-none text-ash hover:text-ink"
        }
        onClick={() => setOpen(true)}
      >
        {label ?? "×"}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-3 sm:items-center sm:p-6" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md bg-porcelain p-5 shadow-[0_20px_60px_rgba(26,22,19,0.16)] sm:p-8"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="font-serif text-3xl">Eliminar a {name}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ash">
              Se quita de la ficha, con sus inspiraciones y las fotos de la prueba. No se puede deshacer.
            </p>
            <form action="/api/admin/companions" method="post" className="mt-8 flex flex-wrap gap-3">
              <input type="hidden" name="clientId" value={clientId} />
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="personIndex" value={index} />
              <button type="button" className="btn-atelier" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-atelier btn-atelier-solid">
                Eliminar
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AddCompanionModal({
  clientId,
  action,
  copy,
  includeClientId = false,
}: {
  clientId: string;
  action: string;
  copy?: PortalCopy;
  includeClientId?: boolean;
}) {
  const hooked = usePortalCopy();
  const t = copy ?? hooked;
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 items-center text-[0.68rem] uppercase tracking-[0.14em] text-ash hover:text-ink sm:tracking-[0.18em]"
        onClick={() => setOpen(true)}
      >
        {t.addCompanion}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-3 sm:items-center sm:p-6" onClick={() => setOpen(false)}>
          <div
            className="max-h-[85dvh] w-full max-w-lg overflow-y-auto bg-porcelain p-6 shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <AddCompanionForm clientId={clientId} action={action} copy={t} includeClientId={includeClientId} plain />
            <button
              type="button"
              className="mt-4 text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AddCompanionForm({
  clientId,
  action,
  copy,
  includeClientId = false,
  plain = false,
}: {
  clientId: string;
  action: string;
  copy?: PortalCopy;
  includeClientId?: boolean;
  plain?: boolean;
}) {
  const hooked = usePortalCopy();
  const t = copy ?? hooked;
  return (
    <form action={action} method="post" className={plain ? "" : "border border-ink/10 p-5"}>
      {includeClientId ? <input type="hidden" name="clientId" value={clientId} /> : null}
      <input type="hidden" name="intent" value="add" />
      <p className="font-serif text-2xl">{t.addCompanion}</p>
      <div className="mt-4">
        <PersonInputs index={0} person={emptyAttendee()} copy={t} />
      </div>
      <button className="btn-atelier mt-4 self-start" type="submit">
        {t.addCompanion}
      </button>
    </form>
  );
}
