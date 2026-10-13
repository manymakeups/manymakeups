import type { PortalCopy } from "@/lib/i18n/portal-messages";
import type { EventDetails } from "@/lib/portal/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value || "—"}</dd>
    </div>
  );
}

export function EventView({ event, copy }: { event: EventDetails; copy: PortalCopy }) {
  const services = [
    event.makeup && copy.makeup,
    event.hair && copy.hair,
    event.glitterBar && copy.glitterBar,
    event.beautyCorner && copy.beautyCorner,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <dl className="grid gap-5 text-sm sm:grid-cols-2">
      <Row label={copy.yourName} value={event.clientName} />
      <Row label={copy.partnerName} value={event.partnerName} />
      <Row label={copy.phone} value={event.phone} />
      <Row label={copy.eventType} value={copy.eventTypes[event.eventType] || event.eventType} />
      <Row label={copy.date} value={event.eventDate} />
      <Row label={copy.venue} value={event.venue} />
      <Row label={copy.gettingReadyPlace} value={event.gettingReadyPlace} />
      <Row label={copy.gettingReadyTime} value={event.gettingReadyTime} />
      <Row label={copy.ceremonyTime} value={event.ceremonyTime} />
      <div className="sm:col-span-2">
        <Row label={copy.services} value={services} />
      </div>
      <div className="sm:col-span-2">
        <Row label={copy.trialNotes} value={event.trialNotes} />
      </div>
      <div className="sm:col-span-2">
        <Row label={copy.skinNotes} value={event.skinNotes} />
      </div>
      <div className="sm:col-span-2">
        <Row label={copy.extraNotes} value={event.notes} />
      </div>
    </dl>
  );
}
