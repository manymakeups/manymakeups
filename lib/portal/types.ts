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

export const APPOINTMENT_TITLES = [
  "Tratamiento facial",
  "Maquillaje",
  "Peinado",
  "Maquillaje y peinado",
  "Curso",
  "Entrevista",
  "Prueba",
  "Tratamientos de ojos",
] as const;
export const APPOINTMENT_STATUSES = ["planificada", "confirmada", "hecha", "anulada"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const CONTRACTOR_INSPIRATION = "contratante";
export const CONTRACTOR_TRIAL_PHOTOS = "prueba-contratante";
export type ProductLook = "maquillaje" | "peinado";

export function contractorInspirationKey(look: ProductLook) {
  return look === "peinado" ? "contratante-peinado" : "contratante-maquillaje";
}

export function personInspirationKey(index: number) {
  return `persona-${index}`;
}

export function personInspirationLookKey(index: number, look: ProductLook) {
  return `persona-${index}-${look}`;
}

export function personTrialPhotoKey(index: number) {
  return `prueba-persona-${index}`;
}

export function filesFor(files: PortalFile[], key: string) {
  if (key === CONTRACTOR_INSPIRATION || key === "contratante-maquillaje") {
    return files.filter(
      (file) =>
        file.label === key || file.label === CONTRACTOR_INSPIRATION || file.label === "Inspiración",
    );
  }
  const legacy = /^persona-(\d+)-maquillaje$/.exec(key);
  if (legacy) {
    const previous = `persona-${legacy[1]}`;
    return files.filter((file) => file.label === key || file.label === previous);
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
  { id: "contratante", label: "Evento" },
  { id: "acompanantes", label: "Acompañantes" },
  { id: "historico", label: "Comunicaciones" },
  { id: "budget", label: "Budget" },
  { id: "documentacion", label: "Documentación" },
  { id: "agenda", label: "Agenda" },
] as const;

export const STUDIO_TABS = [
  PORTAL_TABS[0],
  { id: "premium", label: "Servicios premium" },
  ...PORTAL_TABS.slice(1),
] as const;

export type PortalTab = (typeof PORTAL_TABS)[number]["id"];
export type StudioTab = PortalTab | "premium";

export function studioTab(value: string | undefined): StudioTab {
  if (value === "premium") return "premium";
  return portalTab(value);
}

export function portalTab(value: string | undefined): PortalTab {
  if (value === "facturacion") return "budget";
  if (PORTAL_TABS.some((tab) => tab.id === value)) return value as PortalTab;
  return "contratante";
}

export const PRODUCT_ZONES = ["Ojos", "Labios", "Piel", "Acabado", "Cejas", "Pestañas", "Mejillas"] as const;

export const HAIR_ZONES = [
  "Previo",
  "Preparación",
  "Acabado",
  "Materiales",
  "Decoración",
  "Extensiones",
  "Rellenos",
  "Otros",
] as const;

export type UsedProduct = {
  brand: string;
  name: string;
  shade: string;
  zone: string;
  look: ProductLook;
};

export function productsFor(products: UsedProduct[], look: ProductLook) {
  return products.filter((product) => (product.look || "maquillaje") === look);
}

export type Attendee = {
  name: string;
  who: string;
  service: string;
  wantsTrial: boolean;
  trialNotes: string;
  skinNotes: string;
  notes: string;
  productsUsed: string;
  products: UsedProduct[];
  makeupNotes: string;
  hairNotes: string;
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
  amount: number;
  status: AppointmentStatus;
  reminder7For?: string;
  reminder48For?: string;
  confirmTokenHash?: string;
};

export type PlanningSlot = {
  id: string;
  time: string;
  endTime: string;
  note: string;
};

export type PlanningExtra = {
  id: string;
  label: string;
  time: string;
  endTime: string;
  note: string;
};

export type SidePlanning = {
  on: boolean;
  location: string;
  arrivalTime: string;
  arrivalEnd: string;
  start: string;
  end: string;
  note: string;
  packUpTime: string;
  packUpEnd: string;
  packUp: string;
};

export type EventPlanning = {
  location: string;
  arrivalTime: string;
  setPrep: string;
  setPrepStart: string;
  setPrepEnd: string;
  breaks: string;
  breakTime: string;
  breakEnd: string;
  packUp: string;
  packUpTime: string;
  packUpEnd: string;
  notes: string;
  slots: PlanningSlot[];
  extras: PlanningExtra[];
  glitter: SidePlanning;
  beauty: SidePlanning;
};

export const HISTORY_KINDS = ["contacto", "servicio"] as const;
export type HistoryKind = (typeof HISTORY_KINDS)[number];

export const CONTACT_TITLES = ["Llamada", "WhatsApp", "Reunión", "Correo", "Otro"] as const;
export const SERVICE_TITLES = [
  "Maquillaje y Peinado",
  "Sólo Maquillaje",
  "Sólo peinado",
  "Prueba",
  "Tratamiento facial",
  "Servicios de ojos",
  "Bonos de tratamientos faciales",
  "Bonos servicios de ojos",
  "Formaciones",
  "Compra de productos",
  "Glitter Bar",
  "Beauty Corner",
  "otro",
] as const;

export const SERVICE_ALIASES: Record<string, (typeof SERVICE_TITLES)[number]> = {
  "Maquillaje y peinado": "Maquillaje y Peinado",
  Maquillaje: "Sólo Maquillaje",
  "Sólo maquillaje": "Sólo Maquillaje",
  Peinado: "Sólo peinado",
  "Sólo peinado": "Sólo peinado",
  "Bonos de tratamientos": "Bonos de tratamientos faciales",
  "Bonos de ojos": "Bonos servicios de ojos",
  Otro: "otro",
  "Tratamiento de piel": "Tratamiento facial",
};

export function canonicalService(name: string) {
  return SERVICE_ALIASES[name] ?? name;
}

export const NAMED_SERVICE_TITLES = [
  "Tratamiento facial",
  "Servicios de ojos",
  "Bonos de tratamientos faciales",
  "Bonos servicios de ojos",
  "Formaciones",
  "Compra de productos",
  "otro",
] as const;

export function serviceNeedsName(title: string) {
  return (NAMED_SERVICE_TITLES as readonly string[]).includes(canonicalService(title));
}

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  title: string;
  name: string;
  date: string;
  notes: string;
  amount: number;
  paid: boolean;
  seenByClient?: boolean;
  appointmentId?: string;
  assignee?: string;
};

export type EventDetails = {
  clientName: string;
  clientLastName: string;
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
  products: UsedProduct[];
  makeupNotes: string;
  hairNotes: string;
  contractorLocked: boolean;
  peopleLocked: boolean;
  planning: EventPlanning;
};

export type StudioNoticeKind = "ficha" | "acompanantes" | "cambio" | "fotos" | "documento" | "agenda" | "respuesta";
export type StudioNoticeScope = "contratante" | "acompanante";

export type StudioNoticeReply = {
  id: string;
  createdAt: string;
  text: string;
  fromClient?: boolean;
};

export type StudioNotice = {
  id: string;
  clientId: string;
  createdAt: string;
  kind: StudioNoticeKind;
  scope: StudioNoticeScope;
  personIndex?: number;
  message: string;
  detail?: string;
  read: boolean;
  fromStudio?: boolean;
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
  inviteToken?: string | null;
  inviteIssuedAt?: string | null;
  activationRemindersSent?: number[];
  remindersOptOut?: boolean;
  commercialOptOut?: boolean;
  createdAt: string;
  locale?: "es" | "en" | "fr";
  event: EventDetails;
  payments: Payments;
  inspiration: PortalFile[];
  documents: PortalFile[];
  workPhotos: PortalFile[];
  appointments: Appointment[];
  history: HistoryEntry[];
};

export type PortalDb = {
  clients: ClientRecord[];
  notices: StudioNotice[];
  studioCalendarUrl: string;
  studioCalendarGoogle: string;
  studioCalendarExtra: string;
};

export function emptyAttendee(who = ""): Attendee {
  return {
    name: "",
    who,
    service: "Maquillaje y peinado",
    wantsTrial: false,
    trialNotes: "",
    skinNotes: "",
    notes: "",
    productsUsed: "",
    products: [],
    makeupNotes: "",
    hairNotes: "",
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
    clientLastName: "",
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
    products: [],
    makeupNotes: "",
    hairNotes: "",
    contractorLocked: false,
    peopleLocked: false,
    planning: emptyPlanning(),
  };
}

function clock(value: unknown) {
  const match = /^(\d{2}:\d{2})/.exec(String(value ?? "").trim());
  return match ? match[1] : "";
}

export function emptySidePlanning(): SidePlanning {
  return {
    on: false,
    location: "",
    arrivalTime: "",
    arrivalEnd: "",
    start: "",
    end: "",
    note: "",
    packUpTime: "",
    packUpEnd: "",
    packUp: "",
  };
}

export function emptyPlanning(): EventPlanning {
  return {
    location: "",
    arrivalTime: "",
    setPrep: "",
    setPrepStart: "",
    setPrepEnd: "",
    breaks: "",
    breakTime: "",
    breakEnd: "",
    packUp: "",
    packUpTime: "",
    packUpEnd: "",
    notes: "",
    slots: [],
    extras: [],
    glitter: emptySidePlanning(),
    beauty: emptySidePlanning(),
  };
}

function asSidePlanning(value: unknown): SidePlanning {
  const row = value && typeof value === "object" ? (value as SidePlanning) : emptySidePlanning();
  return {
    on: Boolean(row.on),
    location: String(row.location ?? "").trim().slice(0, 240),
    arrivalTime: clock(row.arrivalTime),
    arrivalEnd: clock(row.arrivalEnd),
    start: clock(row.start),
    end: clock(row.end),
    note: String(row.note ?? "").trim().slice(0, 240),
    packUpTime: clock(row.packUpTime),
    packUpEnd: clock(row.packUpEnd),
    packUp: String(row.packUp ?? "").trim().slice(0, 240),
  };
}

export function asPlanning(value: unknown): EventPlanning {
  const row = value && typeof value === "object" ? (value as EventPlanning) : emptyPlanning();
  const slots = Array.isArray(row.slots)
    ? row.slots.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const id = String(item.id ?? "");
        if (!/^(contractor|g:\d+)$/.test(id)) return [];
        const time = clock(item.time);
        const endTime = clock(item.endTime);
        const note = String(item.note ?? "").trim().slice(0, 240);
        if (!time && !endTime && !note) return [];
        return [{ id, time, endTime, note }];
      })
    : [];
  const extras = Array.isArray(row.extras)
    ? row.extras.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const id = String(item.id ?? "");
        if (!/^[a-z0-9]{8,40}$/i.test(id)) return [];
        const label = String(item.label ?? "").trim().slice(0, 80);
        const time = clock(item.time);
        const endTime = clock(item.endTime);
        const note = String(item.note ?? "").trim().slice(0, 240);
        if (!label && !time && !endTime && !note) return [];
        return [{ id, label, time, endTime, note }];
      })
    : [];
  return {
    location: String(row.location ?? "").trim().slice(0, 240),
    arrivalTime: clock(row.arrivalTime),
    setPrep: String(row.setPrep ?? "").trim().slice(0, 240),
    setPrepStart: clock(row.setPrepStart),
    setPrepEnd: clock(row.setPrepEnd),
    breaks: String(row.breaks ?? "").trim().slice(0, 2000),
    breakTime: clock(row.breakTime),
    breakEnd: clock(row.breakEnd),
    packUp: String(row.packUp ?? "").trim().slice(0, 240),
    packUpTime: clock(row.packUpTime),
    packUpEnd: clock(row.packUpEnd),
    notes: String(row.notes ?? "").trim().slice(0, 4000),
    slots,
    extras,
    glitter: asSidePlanning(row.glitter),
    beauty: asSidePlanning(row.beauty),
  };
}

export function emptyDb(): PortalDb {
  return { clients: [], notices: [], studioCalendarUrl: "", studioCalendarGoogle: "", studioCalendarExtra: "" };
}

export function asStudioNotice(value: unknown): StudioNotice | null {
  if (!value || typeof value !== "object") return null;
  const row = value as StudioNotice;
  if (!row.id || !row.clientId) return null;
  const known: StudioNoticeKind[] = ["ficha", "acompanantes", "cambio", "fotos", "documento", "agenda", "respuesta"];
  const kind = known.includes(row.kind) ? row.kind : "ficha";
  const scope = row.scope === "acompanante" ? "acompanante" : "contratante";
  return {
    id: String(row.id),
    clientId: String(row.clientId),
    createdAt: row.createdAt || "",
    kind,
    scope,
    personIndex: Number.isFinite(row.personIndex) ? Number(row.personIndex) : undefined,
    message: row.message ?? "",
    detail: typeof row.detail === "string" && row.detail ? row.detail : undefined,
    read: Boolean(row.read),
    fromStudio: Boolean(row.fromStudio),
    replies: Array.isArray(row.replies)
      ? row.replies
          .filter((item) => item && typeof item === "object" && item.text)
          .map((item) => ({
            id: String(item.id || ""),
            createdAt: item.createdAt || "",
            text: String(item.text),
            fromClient: Boolean(item.fromClient),
          }))
      : [],
  };
}

export function pendingAmount(slice: PaymentSlice) {
  if (slice.paid) return 0;
  return Number.isFinite(slice.amount) ? Math.max(0, slice.amount) : 0;
}

export function euros(value: number) {
  const formatted = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
  return `${formatted.replace(/\s/g, "")} €`;
}

export function historyBudget(entries: HistoryEntry[]) {
  const services = entries.filter((entry) => entry.kind === "servicio");
  const total = services.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const pending = services.reduce((sum, entry) => sum + (entry.paid ? 0 : Number(entry.amount) || 0), 0);
  return { services, total, paid: Math.max(0, total - pending), pending };
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
    amount: Math.max(0, Number(row.amount) || 0),
    status,
    reminder7For: typeof row.reminder7For === "string" && row.reminder7For ? row.reminder7For : undefined,
    reminder48For: typeof row.reminder48For === "string" && row.reminder48For ? row.reminder48For : undefined,
    confirmTokenHash: typeof row.confirmTokenHash === "string" && row.confirmTokenHash ? row.confirmTokenHash : undefined,
  };
}

function asHistory(value: unknown): HistoryEntry | null {
  if (!value || typeof value !== "object") return null;
  const row = value as HistoryEntry;
  if (!row.id) return null;
  if (row.kind !== "contacto" && row.kind !== "servicio") return null;
  return {
    id: String(row.id),
    kind: row.kind,
    title: row.title ?? "",
    name: row.name ?? "",
    date: row.date ?? "",
    notes: row.notes ?? "",
    amount: row.kind === "servicio" ? Math.max(0, Number(row.amount) || 0) : 0,
    paid: row.kind === "servicio" ? row.paid !== false : true,
    seenByClient: row.seenByClient !== false,
    appointmentId: typeof row.appointmentId === "string" && row.appointmentId ? row.appointmentId : undefined,
    assignee: typeof row.assignee === "string" && /^(contractor|g:\d+)$/.test(row.assignee) ? row.assignee : undefined,
  };
}

function asProducts(value: unknown): UsedProduct[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as UsedProduct;
    const brand = String(item.brand ?? "").trim();
    const name = String(item.name ?? "").trim();
    const shade = String(item.shade ?? "").trim();
    const zone = String(item.zone ?? "").trim();
    const look = item.look === "peinado" ? "peinado" : "maquillaje";
    if (!brand && !name && !shade && !zone) return [];
    return [{ brand, name, shade, zone: zone || "Otra", look }];
  });
}

export function normalizeClient(client: ClientRecord): ClientRecord {
  const count = Math.min(20, Math.max(0, Number(client.event?.peopleCount) || 0));
  const existing = Array.isArray(client.event?.people) ? client.event.people : [];
  const people = Array.from({ length: count }, (_, i) => {
    const row = existing[i];
    if (!row) return emptyAttendee();
    return {
      name: row.name ?? "",
      who: row.who ?? "",
      service: normalizePersonService(row.service || ""),
      wantsTrial: Boolean(row.wantsTrial),
      trialNotes: row.trialNotes ?? "",
      skinNotes: row.skinNotes ?? "",
      notes: row.notes ?? "",
      productsUsed: row.productsUsed ?? "",
      products: asProducts(row.products),
      makeupNotes: row.makeupNotes ?? "",
      hairNotes: row.hairNotes ?? "",
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
      products: asProducts(client.event?.products),
      makeupNotes: client.event?.makeupNotes ?? "",
      hairNotes: client.event?.hairNotes ?? "",
      clientLastName: client.event?.clientLastName ?? "",
      contractorLocked: Boolean(client.event?.contractorLocked),
      peopleLocked: Boolean(client.event?.peopleLocked),
      planning: asPlanning(client.event?.planning),
    },
    inviteToken: typeof client.inviteToken === "string" && client.inviteToken ? client.inviteToken : null,
    inviteIssuedAt: typeof client.inviteIssuedAt === "string" && client.inviteIssuedAt ? client.inviteIssuedAt : null,
    activationRemindersSent: Array.isArray(client.activationRemindersSent)
      ? client.activationRemindersSent.filter((day) => day === 3 || day === 7 || day === 14 || day === 20)
      : [],
    remindersOptOut: Boolean(client.remindersOptOut),
    commercialOptOut: Boolean(client.commercialOptOut),
    payments: migratePayments(client.payments, count),
    inspiration: client.inspiration ?? [],
    documents: client.documents ?? [],
    workPhotos: client.workPhotos ?? [],
    appointments: (client.appointments ?? []).map(asAppointment).filter(Boolean) as Appointment[],
    history: (client.history ?? []).map(asHistory).filter(Boolean) as HistoryEntry[],
  };
}
