import { site } from "@/lib/site";
import { getPortalCopy, interpolate } from "@/lib/i18n";
import { isEmail, normalizeEmail, randomToken } from "@/lib/portal/crypto";
import { stampInvite } from "@/lib/portal/invite";
import { goPortal, localizedPath, requestLocale } from "@/lib/portal/http";
import { brandedClientEmail } from "@/lib/portal/mail-html";
import { mailName } from "@/lib/portal/names";
import { notifyEmail } from "@/lib/portal/notify";
import { getClientByEmail, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (!isEmail(email)) return goPortal(request, "/area-novia/recuperar?ok=1");
  const client = await getClientByEmail(email);
  if (client) {
    const token = randomToken();
    stampInvite(client, token);
    await saveClient(client);
    const locale = await requestLocale();
    const t = getPortalCopy(locale);
    const link = `${site.url}${await localizedPath(`/area-novia/activar?token=${encodeURIComponent(token)}`)}`;
    const name = mailName(client.event, client.name);
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
