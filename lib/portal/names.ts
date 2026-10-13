type NamedEvent = {
  clientName?: string;
  clientLastName?: string;
};

function splitLegacy(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { first: parts[0] ?? "", last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function nameParts(event: NamedEvent) {
  const first = (event.clientName ?? "").trim();
  const last = (event.clientLastName ?? "").trim();
  if (last) return { first, last };
  return splitLegacy(first);
}

export function fullName(event: NamedEvent, fallback = "") {
  const { first, last } = nameParts(event);
  return [first, last].filter(Boolean).join(" ") || fallback.trim();
}

export function mailName(event: NamedEvent, fallback = "") {
  const { first } = nameParts(event);
  if (first) return first;
  return splitLegacy(fallback).first || fallback.trim();
}
