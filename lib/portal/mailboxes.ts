export const MAILBOXES = [
  { address: "info@manymakeups.com", label: "Info", key: "info" },
  { address: "accounting@manymakeups.com", label: "Accounting", key: "accounting" },
  { address: "formaciones@manymakeups.com", label: "Formaciones", key: "formaciones" },
  { address: "comercial@manymakeups.com", label: "Comercial", key: "comercial" },
  { address: "management@manymakeups.com", label: "Management", key: "management" },
] as const;

export type MailboxKey = (typeof MAILBOXES)[number]["key"];
export type MailFolder = "inbox" | "sent" | "trash";

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
