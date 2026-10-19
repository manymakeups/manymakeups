"use client";

import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { usePortalCopy } from "@/app/components/portal/usePortalCopy";
import type { PortalCopy } from "@/lib/i18n/portal-messages";
import { nameParts } from "@/lib/portal/names";
import { CONTRACTOR_INSPIRATION, type EventDetails, type PortalFile } from "@/lib/portal/types";
import { useEffect, useRef, useState, type FormEvent } from "react";

function addressLine(street: string, postal: string, city: string, province: string) {
  return [street.trim(), [postal.trim(), city.trim()].filter(Boolean).join(" "), province.trim()].filter(Boolean).join(", ");
}

export function EventForm({
  event,
  action,
  submitLabel,
  clientId,
  inspiration,
  copy,
  includeClientId = false,
  showInspiration = true,
  showStylist = false,
  confirmSave = false,
  askCommercial = false,
  commercialConsent = false,
}: {
  event: EventDetails;
  action: string;
  submitLabel: string;
  clientId: string;
  inspiration: PortalFile[];
  copy?: PortalCopy;
  includeClientId?: boolean;
  showInspiration?: boolean;
  showStylist?: boolean;
  confirmSave?: boolean;
  askCommercial?: boolean;
  commercialConsent?: boolean;
}) {
  const hooked = usePortalCopy();
  const t = copy ?? hooked;
  const parts = nameParts(event);
  const structured = Boolean(event.serviceStreet || event.servicePostal || event.serviceCity || event.serviceProvince);
  const [street, setStreet] = useState(structured ? event.serviceStreet : event.gettingReadyPlace);
  const [postal, setPostal] = useState(event.servicePostal);
  const [city, setCity] = useState(event.serviceCity);
  const [province, setProvince] = useState(event.serviceProvince);
  const [addressOpen, setAddressOpen] = useState(false);
  const [review, setReview] = useState<{ label: string; value: string }[] | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const place = addressLine(street, postal, city, province);

  useEffect(() => {
    if (!addressOpen && !review) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setAddressOpen(false);
      setReview(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addressOpen, review]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!confirmSave || confirmed.current) return;
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const services = [data.get("makeup") ? t.makeup : "", data.get("hair") ? t.hair : ""].filter(Boolean).join(", ");
    const rows = [
      { label: t.yourName, value: String(data.get("clientName") ?? "") },
      { label: t.lastName, value: String(data.get("clientLastName") ?? "") },
      { label: t.partnerName, value: String(data.get("partnerName") ?? "") },
      { label: t.phone, value: String(data.get("phone") ?? "") },
      { label: t.eventType, value: t.eventTypes[String(data.get("eventType") ?? "boda") as "boda" | "evento" | "otro"] },
      { label: t.date, value: String(data.get("eventDate") ?? "") },
      { label: t.venue, value: String(data.get("venue") ?? "") },
      { label: t.gettingReadyPlace, value: place },
      { label: t.gettingReadyTime, value: String(data.get("gettingReadyTime") ?? "") },
      { label: t.ceremonyTime, value: String(data.get("ceremonyTime") ?? "") },
      { label: t.services, value: services },
    ];
    if (askCommercial) {
      rows.push({ label: t.commercialConsent, value: data.get("commercialConsent") ? t.yes : t.no });
    }
    setReview(rows);
  }

  return (
    <div className="flex flex-col gap-8">
    <form ref={formRef} action={action} method="post" className="flex flex-col gap-4" onSubmit={onSubmit}>
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
        {showStylist ? (
          <label className="field-label sm:col-span-2">
            {t.assignedStylist}
            <input className="field" name="stylist" defaultValue={event.stylist} />
          </label>
        ) : null}
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
        <div className="field-label">
          {t.gettingReadyPlace}
          <input type="hidden" name="serviceStreet" value={street} />
          <input type="hidden" name="servicePostal" value={postal} />
          <input type="hidden" name="serviceCity" value={city} />
          <input type="hidden" name="serviceProvince" value={province} />
          <button className="field text-left" type="button" onClick={() => setAddressOpen(true)}>
            {place || "—"}
          </button>
        </div>
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
      {askCommercial ? (
        <>
          <input type="hidden" name="commercialAsked" value="1" />
          <label className="flex items-start gap-3 text-sm normal-case tracking-normal text-ink">
            <input className="mt-1" type="checkbox" name="commercialConsent" value="1" defaultChecked={commercialConsent} />
            <span>{t.commercialConsent}</span>
          </label>
        </>
      ) : null}
      <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
        {submitLabel}
      </button>
    </form>
      {addressOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center sm:p-6" onClick={() => setAddressOpen(false)}>
          <div
            className="w-full max-w-lg bg-porcelain p-6 shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-label={t.gettingReadyPlace}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-serif text-3xl">{t.gettingReadyPlace}</h2>
            <div className="mt-6 grid gap-4">
              <label className="field-label">
                {t.serviceStreet}
                <input className="field" value={street} onChange={(event) => setStreet(event.target.value)} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field-label">
                  {t.servicePostal}
                  <input className="field" value={postal} onChange={(event) => setPostal(event.target.value)} />
                </label>
                <label className="field-label">
                  {t.serviceCity}
                  <input className="field" value={city} onChange={(event) => setCity(event.target.value)} />
                </label>
              </div>
              <label className="field-label">
                {t.serviceProvince}
                <input className="field" value={province} onChange={(event) => setProvince(event.target.value)} />
              </label>
              <button className="btn-atelier-solid btn-atelier self-start" type="button" onClick={() => setAddressOpen(false)}>
                {t.serviceSave}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {review ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center sm:p-6" onClick={() => setReview(null)}>
          <div
            className="max-h-[85dvh] w-full max-w-lg overflow-y-auto bg-porcelain p-6 shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-label={t.confirmTitle}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-serif text-3xl">{t.confirmTitle}</h2>
            <dl className="mt-6 space-y-3 text-sm">
              {review.map((row) => (
                <div key={row.label}>
                  <dt className="text-ash">{row.label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{row.value.trim() || "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-atelier" type="button" onClick={() => setReview(null)}>
                {t.confirmModify}
              </button>
              <button
                className="btn-atelier-solid btn-atelier"
                type="button"
                onClick={() => {
                  const form = formRef.current;
                  if (!form?.reportValidity()) {
                    setReview(null);
                    return;
                  }
                  confirmed.current = true;
                  form.requestSubmit();
                }}
              >
                {t.confirmKeep}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
