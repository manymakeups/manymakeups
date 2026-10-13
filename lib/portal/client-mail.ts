import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { localePath } from "@/lib/i18n/path";
import { site } from "@/lib/site";
import { notifyEmail } from "./notify";
import type { ClientRecord } from "./types";

export function clientLocale(client: ClientRecord): Locale {
  const value = client.locale ?? "";
  return isLocale(value) ? value : defaultLocale;
}

export function clientPanelUrl(client: ClientRecord, tab?: string) {
  const href = localePath(clientLocale(client), "/area-novia/panel");
  return `${site.url}${href}${tab ? `?tab=${tab}` : ""}`;
}

export async function mailClient(
  client: ClientRecord,
  kind: "reply" | "update",
  extra: { reply?: string; original?: string; tab?: string },
) {
  const t = getPortalCopy(clientLocale(client));
  const name = client.event.clientName || client.name;
  const hello = interpolate(t.mailHello, { name });
  const link = clientPanelUrl(client, extra.tab);
  const body =
    kind === "reply"
      ? [hello, "", t.replyMailAbout, extra.original || "—", "", t.replyMailAnswer, extra.reply || "", "", t.mailSignoff, site.legalName].join("\n")
      : [hello, "", t.updateMailBody, link, "", t.mailSignoff, site.legalName].join("\n");
  return notifyEmail(client.email, kind === "reply" ? t.replyMailSubject : t.updateMailSubject, body);
}
