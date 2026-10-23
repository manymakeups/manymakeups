export const MAILBOXES = [
  { address: "info@manymakeups.com", label: "Info", key: "info", signature: "/brand/firmas-correo/info.png" },
  { address: "accounting@manymakeups.com", label: "Accounting", key: "accounting", signature: "/brand/firmas-correo/accounting.png" },
  { address: "formaciones@manymakeups.com", label: "Formaciones", key: "formaciones", signature: "/brand/firmas-correo/formaciones.png" },
  { address: "comercial@manymakeups.com", label: "Comercial", key: "comercial", signature: "/brand/firmas-correo/comercial.png" },
  { address: "management@manymakeups.com", label: "Management", key: "management", signature: "/brand/firmas-correo/management.png" },
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
