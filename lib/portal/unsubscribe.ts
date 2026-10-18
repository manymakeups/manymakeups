import { createHmac } from "node:crypto";
import { secretsEqual } from "./crypto";

export type MailList = "recordatorios" | "comercial";

export function unsubscribeToken(clientId: string, kind: MailList) {
  const secret = process.env.AUTH_SECRET || "manymakeups";
  return createHmac("sha256", secret).update(`${kind}:${clientId}`).digest("base64url");
}

export function unsubscribeMatches(clientId: string, kind: string, token: string): kind is MailList {
  if (kind !== "recordatorios" && kind !== "comercial") return false;
  return secretsEqual(unsubscribeToken(clientId, kind), token);
}
