import { historyBudget, type ClientRecord, type EventDetails, type PaymentSlice, type PersonPayments } from "./types";

export type BudgetSlice = {
  id: string;
  kind: "deposit" | "trial" | "event";
  amount: number;
  paid: boolean;
};

export type BudgetGroup = {
  id: string;
  role: "contratante" | "acompanante";
  index: number;
  who: string;
  services: string[];
  slices: BudgetSlice[];
};

function amountOf(slice: PaymentSlice) {
  return Math.max(0, Number(slice.amount) || 0);
}

function hasMoney(payments: PersonPayments) {
  return amountOf(payments.deposit) > 0 || amountOf(payments.trial) > 0 || amountOf(payments.event) > 0;
}

export function contractedServiceNames(event: EventDetails) {
  const names: string[] = [];
  if (event.makeup && event.hair) names.push("Maquillaje y peinado");
  else {
    if (event.makeup) names.push("Maquillaje");
    if (event.hair) names.push("Peinado");
  }
  if (event.glitterBar) names.push("Glitter Bar");
  if (event.beautyCorner) names.push("Beauty Corner");
  return names;
}

function contractorBooked(event: EventDetails, payments: PersonPayments) {
  const custom =
    !event.makeup || !event.hair || event.glitterBar || event.beautyCorner;
  return Boolean(event.contractorLocked || event.eventDate || custom || hasMoney(payments));
}

function companionBooked(person: ClientRecord["event"]["people"][number], payments: PersonPayments) {
  return Boolean(
    person.who.trim() ||
      person.skinNotes.trim() ||
      person.notes.trim() ||
      person.trialNotes.trim() ||
      person.wantsTrial ||
      hasMoney(payments),
  );
}

function slicesOf(prefix: string, payments: PersonPayments): BudgetSlice[] {
  const rows: BudgetSlice[] = [
    { id: `${prefix}-deposit`, kind: "deposit", amount: amountOf(payments.deposit), paid: payments.deposit.paid },
    { id: `${prefix}-trial`, kind: "trial", amount: amountOf(payments.trial), paid: payments.trial.paid },
    { id: `${prefix}-event`, kind: "event", amount: amountOf(payments.event), paid: payments.event.paid },
  ];
  return rows.filter((row) => row.amount > 0);
}

export function bookingGroups(client: Pick<ClientRecord, "event" | "payments">): BudgetGroup[] {
  const groups: BudgetGroup[] = [];
  if (contractorBooked(client.event, client.payments.contractor)) {
    groups.push({
      id: "contratante",
      role: "contratante",
      index: 0,
      who: "",
      services: contractedServiceNames(client.event),
      slices: slicesOf("contratante", client.payments.contractor),
    });
  }
  client.event.people.forEach((person, index) => {
    const payments = client.payments.guests[index] ?? {
      deposit: { amount: 0, paid: false },
      trial: { amount: 0, paid: false },
      event: { amount: 0, paid: false },
    };
    if (!companionBooked(person, payments)) return;
    groups.push({
      id: `acompanante-${index}`,
      role: "acompanante",
      index,
      who: person.who,
      services: person.service ? [person.service] : [],
      slices: slicesOf(`acompanante-${index}`, payments),
    });
  });
  return groups;
}

export function clientBudget(client: Pick<ClientRecord, "history" | "event" | "payments">) {
  const history = historyBudget(client.history ?? []);
  const groups = bookingGroups(client);
  const extra = groups.flatMap((group) => group.slices);
  const extraTotal = extra.reduce((sum, slice) => sum + slice.amount, 0);
  const extraPending = extra.reduce((sum, slice) => sum + (slice.paid ? 0 : slice.amount), 0);
  const total = history.total + extraTotal;
  const pending = history.pending + extraPending;
  return {
    history,
    groups,
    total,
    pending,
    paid: Math.max(0, total - pending),
  };
}
