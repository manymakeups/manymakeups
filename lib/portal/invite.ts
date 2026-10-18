import { hashToken } from "./crypto";
import type { ClientRecord } from "./types";

const INVITE_DAYS = 21;

export function stampInvite(client: ClientRecord, token: string) {
  client.inviteToken = token;
  client.inviteTokenHash = hashToken(token);
  client.inviteIssuedAt = new Date().toISOString();
  client.inviteExpiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  client.activationRemindersSent = [];
}

export function clearInvite(client: ClientRecord) {
  client.inviteToken = null;
  client.inviteTokenHash = null;
  client.inviteIssuedAt = null;
  client.inviteExpiresAt = null;
  client.activationRemindersSent = [];
}
