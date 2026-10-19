import { getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { go } from "@/lib/portal/http";
import { brandedClientEmail } from "@/lib/portal/mail-html";
import { clientLocale } from "@/lib/portal/client-mail";
import { mailName } from "@/lib/portal/names";
import { notifyEmail } from "@/lib/portal/notify";
import { requireAdmin } from "@/lib/portal/session";
import { listClients } from "@/lib/portal/store";
import { unsubscribeToken } from "@/lib/portal/unsubscribe";
import { site } from "@/lib/site";
import { localePath } from "@/lib/i18n/path";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const subject = text(form.get("subject")).slice(0, 140);
  const message = text(form.get("message")).slice(0, 8000);
  if (!subject || message.length < 2) return go(request, "/privado/difusion?error=datos");
  const audience = (await listClients()).filter((client) => client.passwordHash && !client.commercialOptOut && client.email);
  if (!audience.length) return go(request, "/privado/difusion?error=vacio");
  let sent = 0;
  let failed = 0;
  for (const client of audience) {
    const locale = clientLocale(client);
    const t = getPortalCopy(locale);
    const name = mailName(client.event, client.name);
    const href = `${site.url}${localePath(locale, "/area-novia/baja")}?id=${encodeURIComponent(client.id)}&tipo=comercial&token=${encodeURIComponent(unsubscribeToken(client.id, "comercial"))}`;
    const mail = brandedClientEmail({
      lang: locale,
      blocks: [
        { text: interpolate(t.activationReminderHello, { name }) },
        { text: message },
      ],
      signoff: [t.recoverMailSignoff],
      footer: { href, label: t.unsubCommercialFooter },
    });
    if (await notifyEmail(client.email, subject, mail.text, mail.html)) sent += 1;
    else failed += 1;
  }
  return go(request, `/privado/difusion?ok=enviado&sent=${sent}&failed=${failed}`);
}
