export type EventType = "boda" | "evento" | "otro";

export const SERVICE_OPTIONS = [
  "Maquillaje y peinado",
  "Maquillaje",
  "Peinado",
  "Glitter Bar",
  "Beauty Corner",
  "Otro",
] as const;

export const DOCUMENT_KINDS = [
  "Presupuesto",
  "Contrato",
  "Factura",
  "Anexo",
  "Timeline",
  "Otro",
] as const;

export type Attendee = {
  who: string;
  service: string;
  budgetAmount: string;
  budgetNumber: string;
};

export type PaymentSlice = {
  amount: number;
  paid: boolean;
};

export type Payments = {
  trial: PaymentSlice;
  event: PaymentSlice;
};

export type EventDetails = {
  clientName: string;
  partnerName: string;
  phone: string;
  eventType: EventType;
  eventDate: string;
  venue: string;
  gettingReadyPlace: string;
  gettingReadyTime: string;
  ceremonyTime: string;
  peopleCount: number;
  people: Attendee[];
  makeup: boolean;
  hair: boolean;
  glitterBar: boolean;
  beautyCorner: boolean;
  trialNotes: string;
  skinNotes: string;
  notes: string;
};

export type PortalFile = {
  id: string;
  name: string;
  pathname: string;
  mime: string;
  size: number;
  uploadedAt: string;
  kind: "inspiration" | "document";
  label: string;
};

export type ClientRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  inviteTokenHash: string | null;
  inviteExpiresAt: string | null;
  createdAt: string;
  event: EventDetails;
  payments: Payments;
  inspiration: PortalFile[];
  documents: PortalFile[];
};

export type PortalDb = {
  clients: ClientRecord[];
};

export function emptyAttendee(who = ""): Attendee {
  return {
    who,
    service: "Maquillaje y peinado",
    budgetAmount: "",
    budgetNumber: "",
  };
}

export function emptyPayments(): Payments {
  return {
    trial: { amount: 0, paid: false },
    event: { amount: 0, paid: false },
  };
}

export function emptyEvent(name = ""): EventDetails {
  return {
    clientName: name,
    partnerName: "",
    phone: "",
    eventType: "boda",
    eventDate: "",
    venue: "",
    gettingReadyPlace: "",
    gettingReadyTime: "",
    ceremonyTime: "",
    peopleCount: 1,
    people: [emptyAttendee(name)],
    makeup: true,
    hair: true,
    glitterBar: false,
    beautyCorner: false,
    trialNotes: "",
    skinNotes: "",
    notes: "",
  };
}

export function emptyDb(): PortalDb {
  return { clients: [] };
}

export function pendingAmount(slice: PaymentSlice) {
  if (slice.paid) return 0;
  return Number.isFinite(slice.amount) ? Math.max(0, slice.amount) : 0;
}

export function euros(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value || 0);
}

export function normalizeClient(client: ClientRecord): ClientRecord {
  const count = Math.min(20, Math.max(1, client.event?.peopleCount || 1));
  const existing = Array.isArray(client.event?.people) ? client.event.people : [];
  const people = Array.from({ length: count }, (_, i) => {
    const row = existing[i];
    if (!row) {
      return emptyAttendee(i === 0 ? client.event?.clientName || client.name : "");
    }
    return {
      who: row.who ?? "",
      service: row.service || "Maquillaje y peinado",
      budgetAmount: row.budgetAmount ?? "",
      budgetNumber: row.budgetNumber ?? "",
    };
  });
  return {
    ...client,
    event: {
      ...emptyEvent(client.name),
      ...client.event,
      peopleCount: count,
      people,
    },
    payments: {
      trial: {
        amount: Number(client.payments?.trial?.amount) || 0,
        paid: Boolean(client.payments?.trial?.paid),
      },
      event: {
        amount: Number(client.payments?.event?.amount) || 0,
        paid: Boolean(client.payments?.event?.paid),
      },
    },
    inspiration: client.inspiration ?? [],
    documents: client.documents ?? [],
  };
}
