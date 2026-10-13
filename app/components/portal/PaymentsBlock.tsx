import { euros, pendingAmount, type Payments } from "@/lib/portal/types";

export function PaymentsView({ payments }: { payments: Payments }) {
  const trialPending = pendingAmount(payments.trial);
  const eventPending = pendingAmount(payments.event);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <article className="border border-ink/10 bg-linen/40 p-5">
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">Día de la prueba</p>
        <p className="mt-3 font-serif text-3xl">{euros(payments.trial.amount)}</p>
        <p className="mt-2 text-sm text-ash">
          {payments.trial.paid ? "Abonado" : "Pendiente de pagar"}
        </p>
        <p className="mt-4 text-sm">
          Pendiente de pagar: <strong>{euros(trialPending)}</strong>
        </p>
      </article>
      <article className="border border-ink/10 bg-linen/40 p-5">
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">Día del evento</p>
        <p className="mt-3 font-serif text-3xl">{euros(payments.event.amount)}</p>
        <p className="mt-2 text-sm text-ash">
          {payments.event.paid ? "Abonado" : "Pendiente de pagar"}
        </p>
        <p className="mt-4 text-sm">
          Pendiente de pagar: <strong>{euros(eventPending)}</strong>
        </p>
      </article>
    </div>
  );
}

export function PaymentsForm({
  clientId,
  payments,
}: {
  clientId: string;
  payments: Payments;
}) {
  return (
    <form action="/api/admin/payments" method="post" className="grid gap-6 sm:grid-cols-2">
      <input type="hidden" name="clientId" value={clientId} />
      <fieldset className="border border-ink/10 p-4">
        <legend className="px-1 text-[0.68rem] uppercase tracking-[0.18em] text-gilt">
          Día de la prueba
        </legend>
        <label className="field-label mt-3">
          Importe
          <input
            className="field"
            name="trialAmount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={payments.trial.amount || ""}
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="trialPaid" defaultChecked={payments.trial.paid} />
          Confirmado como abonado
        </label>
        <p className="mt-3 text-sm text-ash">
          Pendiente de pagar: {euros(pendingAmount(payments.trial))}
        </p>
      </fieldset>
      <fieldset className="border border-ink/10 p-4">
        <legend className="px-1 text-[0.68rem] uppercase tracking-[0.18em] text-gilt">
          Día del evento
        </legend>
        <label className="field-label mt-3">
          Importe
          <input
            className="field"
            name="eventAmount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={payments.event.amount || ""}
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="eventPaid" defaultChecked={payments.event.paid} />
          Confirmado como abonado
        </label>
        <p className="mt-3 text-sm text-ash">
          Pendiente de pagar: {euros(pendingAmount(payments.event))}
        </p>
      </fieldset>
      <button className="btn-atelier-solid btn-atelier sm:col-span-2 self-start" type="submit">
        Guardar pagos
      </button>
    </form>
  );
}
