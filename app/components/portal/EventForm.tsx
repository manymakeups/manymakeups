"use client";

import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { usePortalCopy } from "@/app/components/portal/usePortalCopy";
import type { PortalCopy } from "@/lib/i18n/portal-messages";
import { nameParts } from "@/lib/portal/names";
import { CONTRACTOR_INSPIRATION, type EventDetails, type PortalFile } from "@/lib/portal/types";

export function EventForm({
  event,
  action,
  submitLabel,
  clientId,
  inspiration,
  copy,
  includeClientId = false,
  showInspiration = true,
}: {
  event: EventDetails;
  action: string;
  submitLabel: string;
  clientId: string;
  inspiration: PortalFile[];
  copy?: PortalCopy;
  includeClientId?: boolean;
  showInspiration?: boolean;
}) {
  const hooked = usePortalCopy();
  const t = copy ?? hooked;
  const parts = nameParts(event);
  return (
    <div className="flex flex-col gap-8">
    <form action={action} method="post" className="flex flex-col gap-4">
      {includeClientId ? <input type="hidden" name="clientId" value={clientId} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          {t.yourName}
          <input className="field" name="clientName" defaultValue={parts.first} required />
        </label>
        <label className="field-label">
          {t.lastName}
          <input className="field" name="clientLastName" defaultValue={parts.last} />
        </label>
        <label className="field-label">
          {t.partnerName}
          <input className="field" name="partnerName" defaultValue={event.partnerName} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          {t.phone}
          <input className="field" name="phone" type="tel" defaultValue={event.phone} />
        </label>
        <label className="field-label">
          {t.eventType}
          <select className="field" name="eventType" defaultValue={event.eventType}>
            <option value="boda">{t.eventTypes.boda}</option>
            <option value="evento">{t.eventTypes.evento}</option>
            <option value="otro">{t.eventTypes.otro}</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          {t.date}
          <input className="field" name="eventDate" type="date" defaultValue={event.eventDate} />
        </label>
        <label className="field-label">
          {t.venue}
          <input className="field" name="venue" defaultValue={event.venue} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          {t.gettingReadyPlace}
          <input className="field" name="gettingReadyPlace" defaultValue={event.gettingReadyPlace} />
        </label>
        <label className="field-label">
          {t.gettingReadyTime}
          <input className="field" name="gettingReadyTime" type="time" defaultValue={event.gettingReadyTime} />
        </label>
      </div>
      <label className="field-label">
        {t.ceremonyTime}
        <input className="field" name="ceremonyTime" type="time" defaultValue={event.ceremonyTime} />
      </label>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="field-label mb-1">{t.services}</legend>
        <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" name="makeup" defaultChecked={event.makeup} />
          {t.makeup}
        </label>
        <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
          <input type="checkbox" name="hair" defaultChecked={event.hair} />
          {t.hair}
        </label>
      </fieldset>
      <label className="field-label">
        {t.skinNotes}
        <textarea className="field min-h-24" name="skinNotes" defaultValue={event.skinNotes} />
      </label>
      <label className="field-label">
        {t.extraNotes}
        <textarea className="field min-h-28" name="notes" defaultValue={event.notes} />
      </label>
      <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
        {submitLabel}
      </button>
    </form>
      {showInspiration ? (
        <PhotoPicker
          personKey={CONTRACTOR_INSPIRATION}
          files={inspiration}
          clientId={clientId}
          action="/api/portal/inspiration"
          tab="contratante"
          localize={!copy}
        />
      ) : null}
    </div>
  );
}

export function TrialNotesEditor({
  action,
  notes,
  label,
  submitLabel,
  clientId,
  personIndex,
}: {
  action: string;
  notes: string;
  label: string;
  submitLabel: string;
  clientId?: string;
  personIndex?: number;
}) {
  return (
    <form action={action} method="post" className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="intent" value="trial-notes" />
      {clientId ? <input type="hidden" name="clientId" value={clientId} /> : null}
      {personIndex != null ? <input type="hidden" name="personIndex" value={personIndex} /> : null}
      <label className="field-label">
        {label}
        <textarea className="field min-h-28" name="trialNotes" defaultValue={notes} />
      </label>
      <button className="btn-atelier self-start" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
