export type EventType = "boda" | "evento" | "otro";

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
  peopleBreakdown: string;
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
  inspiration: PortalFile[];
  documents: PortalFile[];
};

export type PortalDb = {
  clients: ClientRecord[];
};

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
    peopleBreakdown: "",
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
