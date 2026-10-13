import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { localePath } from "@/lib/i18n/path";
import { site } from "@/lib/site";
import { brandedClientEmail } from "./mail-html";
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
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const name = client.event.clientName || client.name;
  const link = clientPanelUrl(client, extra.tab);
  if (kind === "update") {
    const mail = brandedClientEmail({
      lang: locale,
      blocks: [
        { text: interpolate(t.updateMailHello, { name }) },
        { text: t.updateMailIntro },
        { text: t.updateMailBody },
        { href: link, label: t.updateMailLink },
        { text: t.updateMailClose },
      ],
      signoff: [t.updateMailSignoff],
    });
    return notifyEmail(client.email, t.updateMailSubject, mail.text, mail.html);
  }
  const reply = extra.reply?.trim() ?? "";
  const mail = brandedClientEmail({
    lang: locale,
    blocks: [
      { text: interpolate(t.replyMailHello, { name }) },
      { text: t.replyMailIntro },
      ...(reply ? [{ text: reply, quote: true }] : []),
      { text: t.replyMailBody },
      { href: link, label: t.replyMailLink },
      { text: t.replyMailClose },
    ],
    signoff: [t.replyMailSignoff],
  });
  return notifyEmail(client.email, t.replyMailSubject, mail.text, mail.html);
}
