import { site } from "@/lib/site";
import { getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { clientLocale } from "./client-mail";
import { brandedClientEmail } from "./mail-html";
import { mailName } from "./names";
import { notifyEmail } from "./notify";
import type { ClientRecord } from "./types";

export function mailInvite(client: ClientRecord) {
  if (!client.inviteToken || !client.email) return Promise.resolve(false);
  const locale = clientLocale(client);
  const t = getPortalCopy(locale);
  const name = mailName(client.event, client.name);
  const link = `${site.url}/area-novia/activar?token=${encodeURIComponent(client.inviteToken)}`;
  const mail = brandedClientEmail({
    lang: locale,
    blocks: [
      { text: interpolate(t.mailHi, { name }) },
      { text: t.inviteMailBody },
      { text: t.inviteMailCta },
      { href: link, label: t.inviteMailLink },
      { text: t.inviteMailExpiry, muted: true },
    ],
    signoff: [t.recoverMailSignoff],
  });
  return notifyEmail(client.email, interpolate(t.inviteMailSubject, { name }), mail.text, mail.html);
}
