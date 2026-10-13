import { site } from "@/lib/site";
import { getPortalCopy, interpolate } from "@/lib/i18n";
import { hashToken, isEmail, normalizeEmail, randomToken } from "@/lib/portal/crypto";
import { goPortal, localizedPath, requestLocale } from "@/lib/portal/http";
import { brandedClientEmail } from "@/lib/portal/mail-html";
import { notifyEmail } from "@/lib/portal/notify";
import { getClientByEmail, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (!isEmail(email)) return goPortal(request, "/area-novia/recuperar?ok=1");
  const client = await getClientByEmail(email);
  if (client) {
    const token = randomToken();
    client.inviteTokenHash = hashToken(token);
    client.inviteExpiresAt = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
    await saveClient(client);
    const locale = await requestLocale();
    const t = getPortalCopy(locale);
    const link = `${site.url}${await localizedPath(`/area-novia/activar?token=${encodeURIComponent(token)}`)}`;
    const name = client.event.clientName || client.name;
    const mail = brandedClientEmail({
      lang: locale,
      blocks: [
        { text: interpolate(t.recoverMailHello, { name }) },
        { text: t.recoverMailIntro },
        { text: t.recoverMailBody },
        { href: link, label: t.recoverMailLink },
        { text: t.recoverMailExpiry, muted: true },
        { text: t.recoverMailIgnore },
      ],
      signoff: [t.recoverMailSignoff],
    });
    await notifyEmail(client.email, t.recoverMailSubject, mail.text, mail.html);
  }
  return goPortal(request, "/area-novia/recuperar?ok=1");
}
