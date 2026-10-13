"use client";

import { usePortalCopy } from "@/app/components/portal/usePortalCopy";
import { interpolate } from "@/lib/i18n/portal-messages";
import {
  emptyPersonPayments,
  euros,
  pendingAmount,
  type Attendee,
  type Payments,
  type PersonPayments,
  type PaymentSlice,
} from "@/lib/portal/types";

function SliceView({ title, slice }: { title: string; slice: PaymentSlice }) {
  const t = usePortalCopy();
  return (
    <article className="border border-ink/10 bg-linen/40 p-5">
      <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{title}</p>
      <p className="mt-3 font-serif text-3xl">{euros(slice.amount)}</p>
      <p className="mt-2 text-sm text-ash">{slice.paid ? t.paid : t.unpaid}</p>
      <p className="mt-4 text-sm">
        {interpolate(t.pending, { amount: euros(pendingAmount(slice)) })}
      </p>
    </article>
  );
}

function PersonPayView({
  title,
  payments,
  showTrial,
}: {
  title: string;
  payments: PersonPayments;
  showTrial: boolean;
}) {
  const t = usePortalCopy();
  return (
    <div>
      <h3 className="font-serif text-2xl">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <SliceView title={t.deposit} slice={payments.deposit} />
        {showTrial ? <SliceView title={t.trialDay} slice={payments.trial} /> : null}
        <SliceView title={t.eventDay} slice={payments.event} />
      </div>
    </div>
  );
}

export function PaymentsView({
  payments,
  people,
}: {
  payments: Payments;
  people: Attendee[];
}) {
  const t = usePortalCopy();
  return (
    <div className="flex flex-col gap-12">
      <PersonPayView title={t.contractor} payments={payments.contractor} showTrial />
      {people.map((person, i) => (
        <PersonPayView
          key={i}
          title={t.whoOptions[person.who] || person.who || interpolate(t.guestN, { n: i + 1 })}
          payments={payments.guests[i] ?? emptyPersonPayments()}
          showTrial={person.wantsTrial}
        />
      ))}
    </div>
  );
}

function SliceFields({
  title,
  amountName,
  paidName,
  slice,
}: {
  title: string;
  amountName: string;
  paidName: string;
  slice: PaymentSlice;
}) {
  return (
    <fieldset className="border border-ink/10 p-4">
      <legend className="px-1 text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{title}</legend>
      <label className="field-label mt-3">
        Importe
        <input
          className="field"
          name={amountName}
          type="number"
          min={0}
          step="0.01"
          defaultValue={slice.amount || ""}
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" name={paidName} defaultChecked={slice.paid} />
        Confirmado como abonado
      </label>
      <p className="mt-3 text-sm text-ash">Pendiente de pagar: {euros(pendingAmount(slice))}</p>
    </fieldset>
  );
}

export function PaymentsForm({
  clientId,
  payments,
  people,
}: {
  clientId: string;
  payments: Payments;
  people: Attendee[];
}) {
  return (
    <form action="/api/admin/payments" method="post" className="flex flex-col gap-12">
      <input type="hidden" name="clientId" value={clientId} />
      <div>
        <h3 className="font-serif text-2xl">Contratante</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <SliceFields
            title="Reserva"
            amountName="contractor.depositAmount"
            paidName="contractor.depositPaid"
            slice={payments.contractor.deposit}
          />
          <SliceFields
            title="Día de la prueba"
            amountName="contractor.trialAmount"
            paidName="contractor.trialPaid"
            slice={payments.contractor.trial}
          />
          <SliceFields
            title="Día del evento"
            amountName="contractor.eventAmount"
            paidName="contractor.eventPaid"
            slice={payments.contractor.event}
          />
        </div>
      </div>
      {people.map((person, i) => {
        const row = payments.guests[i] ?? {
          deposit: { amount: 0, paid: false },
          trial: { amount: 0, paid: false },
          event: { amount: 0, paid: false },
        };
        return (
          <div key={i}>
            <h3 className="font-serif text-2xl">{person.who || `Acompañante ${i + 1}`}</h3>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <SliceFields
                title="Reserva"
                amountName={`guests.${i}.depositAmount`}
                paidName={`guests.${i}.depositPaid`}
                slice={row.deposit}
              />
              {person.wantsTrial ? (
                <SliceFields
                  title="Día de la prueba"
                  amountName={`guests.${i}.trialAmount`}
                  paidName={`guests.${i}.trialPaid`}
                  slice={row.trial}
                />
              ) : null}
              <SliceFields
                title="Día del evento"
                amountName={`guests.${i}.eventAmount`}
                paidName={`guests.${i}.eventPaid`}
                slice={row.event}
              />
            </div>
          </div>
        );
      })}
      <button className="btn-atelier-solid btn-atelier self-start" type="submit">
        Guardar pagos
      </button>
    </form>
  );
}
