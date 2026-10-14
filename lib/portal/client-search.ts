import { bookingGroups, clientBudget } from "./budget";
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

function moneyNeedle(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  return /^\d+(\.\d+)?$/.test(normalized) ? normalized : "";
}

function partidaHits(titles: string[], partida: string) {
  const wanted = fold(partida);
  return titles.some((title) => {
    const name = fold(title);
    return name === wanted || name.includes(wanted) || wanted.includes(name);
  });
}

function matchesBudget(client: ClientRecord, partida: string, query: string) {
  const services = (client.history ?? []).filter((entry) => entry.kind === "servicio");
  const groups = bookingGroups(client);
  const scopedServices = partida ? services.filter((entry) => partidaHits([entry.title, entry.name], partida)) : services;
  const scopedGroups = partida
    ? groups.filter((group) => partidaHits(group.services, partida) || (partida === "Prueba" && group.slices.some((slice) => slice.kind === "trial")))
    : groups;
  if (!query) return partida ? scopedServices.length > 0 || scopedGroups.length > 0 : true;
  const needle = fold(query);
  const amount = moneyNeedle(query);
  const lineHit = scopedServices.some((entry) => {
    const text = fold(`${entry.name} ${entry.title} ${entry.notes}`);
    if (needle && text.includes(needle)) return true;
    return amount ? Number(amount) === Number(entry.amount) : false;
  });
  if (lineHit) return true;
  const bookingHit = scopedGroups.some((group) => {
    const text = fold(`${group.who} ${group.services.join(" ")}`);
    if (needle && text.includes(needle)) return true;
    return amount ? group.slices.some((slice) => Number(amount) === slice.amount) : false;
  });
  if (bookingHit) return true;
  if (!amount || partida) return false;
  return Number(amount) === clientBudget(client).total;
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
