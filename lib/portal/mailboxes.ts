export const MAILBOXES = [
  { address: "info@manymakeups.com", label: "Info", fromName: "Many Makeups by Ana Zarza", key: "info", signature: "/brand/firmas-correo/info.jpg" },
  { address: "accounting@manymakeups.com", label: "Accounting", fromName: "Accounting Many Makeups by Ana Zarza", key: "accounting", signature: "/brand/firmas-correo/accounting.jpg" },
  { address: "formaciones@manymakeups.com", label: "Formaciones", fromName: "Formaciones Many Makeups by Ana Zarza", key: "formaciones", signature: "/brand/firmas-correo/formaciones.jpg" },
  { address: "comercial@manymakeups.com", label: "Comercial", fromName: "Comercial Many Makeups by Ana Zarza", key: "comercial", signature: "/brand/firmas-correo/comercial.jpg" },
  { address: "management@manymakeups.com", label: "Management", fromName: "Management Many Makeups by Ana Zarza", key: "management", signature: "/brand/firmas-correo/management.jpg" },
] as const;

export const SIGNATURE_BACKGROUND = "#f4f1ea";

export type MailboxKey = (typeof MAILBOXES)[number]["key"];
export type MailFolder = "inbox" | "sent" | "archive" | "trash";

export function mailboxByKey(key: string) {
  return MAILBOXES.find((box) => box.key === key) ?? null;
}

export function mailboxFromRecipients(envelope: string, headerTo: string) {
  const routed = envelope.toLowerCase();
  const direct = MAILBOXES.find((box) => routed.includes(box.address));
  if (direct) return direct;
  const header = headerTo.toLowerCase();
  return MAILBOXES.find((box) => header.includes(box.address)) ?? null;
}
