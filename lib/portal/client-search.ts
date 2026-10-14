import { fullName } from "./names";
import type { ClientRecord } from "./types";

export const CLIENT_SEARCH_MODES = ["nombre", "presupuesto", "telefono", "fecha"] as const;
export type ClientSearchMode = (typeof CLIENT_SEARCH_MODES)[number];

export function clientSearchMode(value: string | undefined): ClientSearchMode {
  if (CLIENT_SEARCH_MODES.includes(value as ClientSearchMode)) return value as ClientSearchMode;
  return "nombre";
}

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function presupuestoDocumentNames(client: ClientRecord) {
  return (client.documents ?? []).filter((file) => file.label === "Presupuesto").map((file) => file.name);
}

function matchesBudget(client: ClientRecord, tipo: string, query: string) {
  const documents = client.documents ?? [];
  const scoped = tipo ? documents.filter((file) => file.label === tipo) : documents;
  if (!query) return tipo ? scoped.length > 0 : true;
  const needle = fold(query);
  return scoped.some((file) => fold(`${file.name} ${file.label}`).includes(needle));
}

export function clientMatchesSearch(client: ClientRecord, mode: ClientSearchMode, query: string, partida: string) {
  const q = query.trim();
  if (mode === "presupuesto") return matchesBudget(client, partida, q);
  if (!q) return true;
  if (mode === "fecha") return client.event.eventDate === q;
  if (mode === "telefono") {
    const phone = client.event.phone ?? "";
    const wanted = digits(q);
    if (wanted && digits(phone).includes(wanted)) return true;
    return fold(phone).includes(fold(q));
  }
  const name = fold(`${fullName(client.event, client.name)} ${client.name} ${client.event.clientLastName ?? ""}`);
  return name.includes(fold(q));
}
