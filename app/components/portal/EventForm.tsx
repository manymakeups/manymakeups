"use client";

import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { CONTRACTOR_INSPIRATION, type EventDetails, type PortalFile } from "@/lib/portal/types";

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
        <legend className="field-label mb-1">Servicios</legend>
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
      <PhotoPicker
        personKey={CONTRACTOR_INSPIRATION}
        files={inspiration}
        clientId={clientId}
        action="/api/portal/inspiration"
        tab="contratante"
      />
      <button className="btn-atelier-solid btn-atelier mt-2 self-start" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
