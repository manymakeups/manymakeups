export type EventType = "boda" | "evento" | "otro";

export const SERVICE_OPTIONS = [
  "Maquillaje y peinado",
  "Maquillaje",
  "Peinado",
  "Glitter Bar",
  "Beauty Corner",
  "Otro",
] as const;

export const WHO_OPTIONS = [
  "Pareja masculina",
  "Pareja femenina",
  "Madrina/padrino",
  "Niñ@",
  "Invitada",
  "Invitado",
] as const;

export const PERSON_SERVICE_OPTIONS = [
  "Maquillaje y peinado",
  "Sólo maquillaje",
  "Sólo peinado",
] as const;

export const APPOINTMENT_TITLES = ["Prueba", "Evento", "Reserva", "Otra"] as const;
export const APPOINTMENT_STATUSES = ["planificada", "confirmada", "hecha"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const CONTRACTOR_INSPIRATION = "contratante";
export const CONTRACTOR_TRIAL_PHOTOS = "prueba-contratante";

export function personInspirationKey(index: number) {
  return `persona-${index}`;
}

export function personTrialPhotoKey(index: number) {
  return `prueba-persona-${index}`;
}

export function filesFor(files: PortalFile[], key: string) {
  if (key === CONTRACTOR_INSPIRATION) {
    return files.filter(
      (file) => file.label === CONTRACTOR_INSPIRATION || file.label === "Inspiración",
    );
  }
  return files.filter((file) => file.label === key);
}

export function normalizePersonService(value: string) {
  if (value === "Sólo maquillaje" || value === "Maquillaje") return "Sólo maquillaje";
  if (value === "Sólo peinado" || value === "Peinado") return "Sólo peinado";
  return "Maquillaje y peinado";
}

export const DOCUMENT_KINDS = [
  "Presupuesto",
  "Contrato",
  "Factura",
  "Anexo",
  "Timeline",
  "Otro",
] as const;

export const PORTAL_TABS = [
  { id: "contratante", label: "Contratante" },
  { id: "acompanantes", label: "Acompañantes" },
  { id: "facturacion", label: "Facturación" },
  { id: "documentacion", label: "Documentación" },
  { id: "agenda", label: "Agenda" },
] as const;

export type PortalTab = (typeof PORTAL_TABS)[number]["id"];

export function portalTab(value: string | undefined): PortalTab {
  if (PORTAL_TABS.some((tab) => tab.id === value)) return value as PortalTab;
  return "contratante";
}

export type Attendee = {
  who: string;
  service: string;
  wantsTrial: boolean;
  trialNotes: string;
  skinNotes: string;
  notes: string;
  productsUsed: string;
  budgetAmount: string;
  budgetNumber: string;
};

export type PaymentSlice = {
  amount: number;
  paid: boolean;
};

export type PersonPayments = {
  deposit: PaymentSlice;
  trial: PaymentSlice;
  event: PaymentSlice;
};

export type Payments = {
  contractor: PersonPayments;
  guests: PersonPayments[];
};

export type Appointment = {
  id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  notes: string;
  status: AppointmentStatus;
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
  productsUsed: string;
  contractorLocked: boolean;
  peopleLocked: boolean;
};

export type StudioNoticeKind = "ficha" | "acompanantes" | "cambio";
export type StudioNoticeScope = "contratante" | "acompanante";

export type StudioNoticeReply = {
  id: string;
  createdAt: string;
  text: string;
};

export type StudioNotice = {
  id: string;
  clientId: string;
  createdAt: string;
  kind: StudioNoticeKind;
  scope: StudioNoticeScope;
  personIndex?: number;
  message: string;
  read: boolean;
  replies: StudioNoticeReply[];
};

export type FileKind = "inspiration" | "document" | "work";

export type PortalFile = {
  id: string;
  name: string;
  pathname: string;
  mime: string;
  size: number;
  uploadedAt: string;
  kind: FileKind;
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
  locale?: "es" | "en" | "fr";
  event: EventDetails;
  payments: Payments;
  inspiration: PortalFile[];
  documents: PortalFile[];
  workPhotos: PortalFile[];
  appointments: Appointment[];
};

export type PortalDb = {
  clients: ClientRecord[];
  notices: StudioNotice[];
};

export function emptyAttendee(who = ""): Attendee {
  return {
    who,
    service: "Maquillaje y peinado",
    wantsTrial: false,
    trialNotes: "",
    skinNotes: "",
    notes: "",
    productsUsed: "",
    budgetAmount: "",
    budgetNumber: "",
  };
}

export function emptySlice(): PaymentSlice {
  return { amount: 0, paid: false };
}

export function emptyPersonPayments(): PersonPayments {
  return {
    deposit: emptySlice(),
    trial: emptySlice(),
    event: emptySlice(),
  };
}

export function emptyPayments(): Payments {
  return {
    contractor: emptyPersonPayments(),
    guests: [],
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
    peopleCount: 0,
    people: [],
    makeup: true,
    hair: true,
    glitterBar: false,
    beautyCorner: false,
    trialNotes: "",
    skinNotes: "",
    notes: "",
    productsUsed: "",
    contractorLocked: false,
    peopleLocked: false,
  };
}

export function emptyDb(): PortalDb {
  return { clients: [], notices: [] };
}

export function asStudioNotice(value: unknown): StudioNotice | null {
  if (!value || typeof value !== "object") return null;
  const row = value as StudioNotice;
  if (!row.id || !row.clientId) return null;
  const kind = row.kind === "acompanantes" || row.kind === "cambio" ? row.kind : "ficha";
  const scope = row.scope === "acompanante" ? "acompanante" : "contratante";
  return {
    id: String(row.id),
    clientId: String(row.clientId),
    createdAt: row.createdAt || "",
    kind,
    scope,
    personIndex: Number.isFinite(row.personIndex) ? Number(row.personIndex) : undefined,
    message: row.message ?? "",
    read: Boolean(row.read),
    replies: Array.isArray(row.replies)
      ? row.replies
          .filter((item) => item && typeof item === "object" && item.text)
          .map((item) => ({
            id: String(item.id || ""),
            createdAt: item.createdAt || "",
            text: String(item.text),
          }))
      : [],
  };
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

function asSlice(value: unknown): PaymentSlice {
  const row = value && typeof value === "object" ? (value as PaymentSlice) : emptySlice();
  return {
    amount: Number(row.amount) || 0,
    paid: Boolean(row.paid),
  };
}

function asPersonPayments(value: unknown): PersonPayments {
  const row = value && typeof value === "object" ? (value as PersonPayments) : emptyPersonPayments();
  return {
    deposit: asSlice(row.deposit),
    trial: asSlice(row.trial),
    event: asSlice(row.event),
  };
}

function migratePayments(raw: unknown, guestCount: number): Payments {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const contractor = data.contractor
    ? asPersonPayments(data.contractor)
    : {
        deposit: asSlice(data.deposit),
        trial: asSlice(data.trial),
        event: asSlice(data.event),
      };
  const guestsRaw = Array.isArray(data.guests) ? data.guests : [];
  const guests = Array.from({ length: guestCount }, (_, i) =>
    guestsRaw[i] ? asPersonPayments(guestsRaw[i]) : emptyPersonPayments(),
  );
  return { contractor, guests };
}

function asAppointment(value: unknown): Appointment | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Appointment;
  if (!row.id) return null;
  const status = APPOINTMENT_STATUSES.includes(row.status) ? row.status : "planificada";
  return {
    id: String(row.id),
    title: row.title ?? "",
    date: row.date ?? "",
    time: row.time ?? "",
    place: row.place ?? "",
    notes: row.notes ?? "",
    status,
  };
}

export function normalizeClient(client: ClientRecord): ClientRecord {
  const count = Math.min(20, Math.max(0, Number(client.event?.peopleCount) || 0));
  const existing = Array.isArray(client.event?.people) ? client.event.people : [];
  const people = Array.from({ length: count }, (_, i) => {
    const row = existing[i];
    if (!row) return emptyAttendee();
    return {
      who: row.who ?? "",
      service: normalizePersonService(row.service || ""),
      wantsTrial: Boolean(row.wantsTrial),
      trialNotes: row.trialNotes ?? "",
      skinNotes: row.skinNotes ?? "",
      notes: row.notes ?? "",
      productsUsed: row.productsUsed ?? "",
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
      productsUsed: client.event?.productsUsed ?? "",
      contractorLocked: Boolean(client.event?.contractorLocked),
      peopleLocked: Boolean(client.event?.peopleLocked),
    },
    payments: migratePayments(client.payments, count),
    inspiration: client.inspiration ?? [],
    documents: client.documents ?? [],
    workPhotos: client.workPhotos ?? [],
    appointments: (client.appointments ?? []).map(asAppointment).filter(Boolean) as Appointment[],
  };
}
