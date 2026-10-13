import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TITLES,
  type Appointment,
} from "@/lib/portal/types";

const statusLabel: Record<Appointment["status"], string> = {
  planificada: "Planificada",
  confirmada: "Confirmada",
  hecha: "Hecha",
};

function formatWhen(item: Appointment) {
  const date = item.date
    ? new Date(`${item.date}T00:00:00`).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Sin fecha";
  return item.time ? `${date} · ${item.time}` : date;
}

export function AgendaView({ appointments }: { appointments: Appointment[] }) {
  const ordered = [...appointments].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
  );
  if (!ordered.length) {
    return <p className="text-sm text-ash">Todavía no hay citas en la agenda.</p>;
  }
  return (
    <ul className="divide-y divide-ink/10 border border-ink/10">
      {ordered.map((item) => (
        <li key={item.id} className="px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
            {item.title || "Cita"} · {statusLabel[item.status]}
          </p>
          <p className="mt-1 font-serif text-2xl capitalize">{formatWhen(item)}</p>
          {item.place ? <p className="mt-1 text-sm text-ash">{item.place}</p> : null}
          {item.notes ? (
            <p className="mt-2 whitespace-pre-wrap text-sm">{item.notes}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function AgendaForm({
  clientId,
  appointments,
}: {
  clientId: string;
  appointments: Appointment[];
}) {
  return (
    <div className="flex flex-col gap-10">
      <AgendaView appointments={appointments} />
      <form action="/api/admin/appointments" method="post" className="grid max-w-xl gap-4">
        <input type="hidden" name="clientId" value={clientId} />
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
                {statusLabel[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Notas
          <textarea className="field min-h-24" name="notes" />
        </label>
        <button className="btn-atelier-solid btn-atelier self-start" type="submit">
          Añadir a la agenda
        </button>
      </form>
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
