"use client";

import { useState } from "react";
import { dateLocale } from "@/lib/i18n/portal-messages";
import { portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import type { Locale } from "@/lib/i18n/config";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TITLES,
  type Appointment,
} from "@/lib/portal/types";

const statusLabelEs: Record<Appointment["status"], string> = {
  planificada: "Planificada",
  confirmada: "Confirmada",
  hecha: "Hecha",
};

function formatWhen(item: Appointment, locale: Locale, copy: PortalCopy) {
  const date = item.date
    ? new Date(`${item.date}T00:00:00`).toLocaleDateString(dateLocale(locale), {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : copy.noDate;
  return item.time ? `${date} · ${item.time}` : date;
}

export function AgendaView({
  appointments,
  copy = portalEs,
  locale = "es",
}: {
  appointments: Appointment[];
  copy?: PortalCopy;
  locale?: Locale;
}) {
  const ordered = [...appointments].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
  );
  if (!ordered.length) {
    return <p className="text-sm text-ash">{copy.agendaEmpty}</p>;
  }
  return (
    <ul className="divide-y divide-ink/10 border border-ink/10">
      {ordered.map((item) => (
        <li key={item.id} className="px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
            {copy.appointmentTitles[item.title] || item.title || copy.appointment} ·{" "}
            {copy.statuses[item.status] ?? statusLabelEs[item.status]}
          </p>
          <p className="mt-1 font-serif text-2xl capitalize">{formatWhen(item, locale, copy)}</p>
          {item.place ? <p className="mt-1 text-sm text-ash">{item.place}</p> : null}
          {item.notes ? (
            <p className="mt-2 whitespace-pre-wrap text-sm">{item.notes}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function AppointmentFields() {
  return (
    <>
      <label className="field-label">
        Tipo de cita
        <select className="field" name="title" defaultValue="Prueba">
          {APPOINTMENT_TITLES.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Fecha
          <input className="field" name="date" type="date" required />
        </label>
        <label className="field-label">
          Hora
          <input className="field" name="time" type="time" />
        </label>
      </div>
      <label className="field-label">
        Lugar
        <input className="field" name="place" />
      </label>
      <label className="field-label">
        Estado
        <select className="field" name="status" defaultValue="planificada">
          {APPOINTMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabelEs[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="field-label">
        Notas
        <textarea className="field min-h-24" name="notes" />
      </label>
    </>
  );
}

export function NewAppointmentModal({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
        onClick={() => setOpen(true)}
      >
        Crear nueva cita
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-5" onClick={() => setOpen(false)}>
          <div
            className="max-h-[85dvh] w-full max-w-lg overflow-y-auto bg-porcelain p-6 shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="font-serif text-3xl">Nueva cita</h2>
            <form action="/api/admin/appointments" method="post" className="mt-6 grid gap-4">
              <input type="hidden" name="clientId" value={clientId} />
              <AppointmentFields />
              <button className="btn-atelier self-start" type="submit">
                Añadir a la agenda
              </button>
            </form>
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

export function AgendaLists({
  clientId,
  appointments,
}: {
  clientId: string;
  appointments: Appointment[];
}) {
  const planned = appointments.filter((item) => item.status !== "hecha");
  const done = appointments.filter((item) => item.status === "hecha");
  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="font-serif text-2xl">Planificadas</p>
        <div className="mt-4">
          <AgendaView appointments={planned} />
        </div>
      </div>
      {done.length ? (
        <div>
          <p className="font-serif text-2xl">Hechas</p>
          <div className="mt-4">
            <AgendaView appointments={done} />
          </div>
        </div>
      ) : null}
      {appointments.length ? (
        <ul className="divide-y divide-ink/10 border border-ink/10">
          {appointments.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm">
                {item.title} · {item.date || "sin fecha"} {item.time}
              </p>
              <form action="/api/admin/appointments" method="post">
                <input type="hidden" name="clientId" value={clientId} />
                <input type="hidden" name="deleteId" value={item.id} />
                <button className="text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink" type="submit">
                  Quitar
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
