"use client";

import { useState } from "react";
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
    <article className="border border-ink/10 px-3 py-3 sm:bg-linen/40 sm:p-5">
      <p className="text-[0.62rem] uppercase tracking-[0.14em] text-gilt sm:text-[0.68rem] sm:tracking-[0.18em]">{title}</p>
      <p className="mt-2 font-serif text-2xl sm:mt-3 sm:text-3xl">{euros(slice.amount)}</p>
      <p className="mt-1 text-sm text-ash sm:mt-2">{slice.paid ? t.paid : t.unpaid}</p>
      <p className="mt-2 text-sm sm:mt-4">
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
      <h3 className="font-serif text-xl sm:text-2xl">{title}</h3>
      <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-4">
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
    <div className="flex flex-col gap-8 sm:gap-12">
      <PersonPayView title={t.budgetService} payments={payments.contractor} showTrial />
      {people.map((person, i) => (
        <PersonPayView
          key={i}
          title={
            person.name
              ? `${person.name}${person.who ? ` · ${t.whoOptions[person.who] || person.who}` : ""}`
              : t.whoOptions[person.who] || person.who || interpolate(t.guestN, { n: i + 1 })
          }
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
    <fieldset className="border border-ink/10 p-3 sm:p-4">
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
  const choices = [
    { id: "contractor", label: "Tu servicio" },
    ...people.map((person, i) => ({
      id: String(i),
      label: person.name
        ? `${person.name}${person.who ? ` · ${person.who}` : ""}`
        : person.who || `Acompañante ${i + 1}`,
    })),
  ];
  const [who, setWho] = useState("contractor");
  const selected = choices.some((choice) => choice.id === who) ? who : "contractor";
  const guestIndex = selected === "contractor" ? -1 : Number(selected);
  const guest = guestIndex >= 0 ? people[guestIndex] : undefined;
  const guestPay = guest
    ? (payments.guests[guestIndex] ?? {
        deposit: { amount: 0, paid: false },
        trial: { amount: 0, paid: false },
        event: { amount: 0, paid: false },
      })
    : null;
  return (
    <form action="/api/admin/payments" method="post" className="flex flex-col gap-6">
      <input type="hidden" name="clientId" value={clientId} />
      {choices.length > 1 ? (
        <label className="field-label max-w-md">
          Persona
          <select className="field" value={selected} onChange={(event) => setWho(event.target.value)}>
            {choices.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {selected === "contractor" ? (
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-6">
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
      ) : guest && guestPay ? (
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-6">
          <SliceFields
            title="Reserva"
            amountName={`guests.${guestIndex}.depositAmount`}
            paidName={`guests.${guestIndex}.depositPaid`}
            slice={guestPay.deposit}
          />
          {guest.wantsTrial ? (
            <SliceFields
              title="Día de la prueba"
              amountName={`guests.${guestIndex}.trialAmount`}
              paidName={`guests.${guestIndex}.trialPaid`}
              slice={guestPay.trial}
            />
          ) : null}
          <SliceFields
            title="Día del evento"
            amountName={`guests.${guestIndex}.eventAmount`}
            paidName={`guests.${guestIndex}.eventPaid`}
            slice={guestPay.event}
          />
        </div>
      ) : null}
      <button className="btn-atelier-solid btn-atelier self-start" type="submit">
        Guardar pagos
      </button>
    </form>
  );
}
