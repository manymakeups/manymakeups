"use client";

import { useMemo, useState } from "react";
import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { WorkView } from "@/app/components/portal/WorkBlock";
import { usePortalCopy } from "@/app/components/portal/usePortalCopy";
import { interpolate, type PortalCopy } from "@/lib/i18n/portal-messages";
import {
  PERSON_SERVICE_OPTIONS,
  WHO_OPTIONS,
  filesFor,
  personInspirationKey,
  personTrialPhotoKey,
  type EventDetails,
  type PortalFile,
} from "@/lib/portal/types";

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
  const [wantsTrial, setWantsTrial] = useState(Boolean(person.wantsTrial));
  const knownWho = (WHO_OPTIONS as readonly string[]).includes(person.who);

  return (
    <fieldset className="border border-ink/10 bg-linen/30 p-4">
      <legend className="px-1 text-[0.68rem] uppercase tracking-[0.18em] text-gilt">
        {interpolate(t.personN, { n: index + 1 })}
      </legend>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          {t.who}
          <select className="field" name={`people.${index}.who`} defaultValue={person.who} required>
            <option value="">{t.choose}</option>
            {!knownWho && person.who ? <option value={person.who}>{person.who}</option> : null}
            {WHO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t.whoOptions[option] ?? option}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          {t.service}
          <select
            className="field"
            name={`people.${index}.service`}
            defaultValue={person.service || "Maquillaje y peinado"}
          >
            {PERSON_SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t.serviceOptions[option] ?? option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 field-label">
        {t.allergies}
        <textarea
          className="field min-h-24"
          name={`people.${index}.skinNotes`}
          defaultValue={person.skinNotes}
        />
      </label>
      <label className="field-label">
        {t.extraNotes}
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
        {t.wantsTrial}
      </label>
      {wantsTrial ? (
        <label className="mt-4 field-label">
          {t.trialNotes}
          <textarea
            className="field min-h-24"
            name={`people.${index}.trialNotes`}
            defaultValue={person.trialNotes}
          />
        </label>
      ) : null}
      {wantsTrial && showTrialWork ? (
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
    return Array.from({ length: count }, (_, i) => event.people?.[i] ?? {
      who: "",
      service: "Maquillaje y peinado",
      wantsTrial: false,
      trialNotes: "",
      skinNotes: "",
      notes: "",
      productsUsed: "",
      products: [],
      budgetAmount: "",
      budgetNumber: "",
    });
  }, [count, event]);

  return (
    <form action={action} method="post" className="flex flex-col gap-4">
      {includeClientId ? <input type="hidden" name="clientId" value={clientId} /> : null}
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
