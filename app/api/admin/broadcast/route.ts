import { getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
import { go } from "@/lib/portal/http";
import { safeFileName } from "@/lib/portal/files";
import { brandedClientEmail, broadcastLegal } from "@/lib/portal/mail-html";
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

function publicationUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString().slice(0, 500);
  } catch {
    return "";
  }
}

function publicationLabel(locale: string) {
  if (locale === "en") return "View the post";
  if (locale === "fr") return "Voir la publication";
  return "Ver la publicación";
}

function attachedNote(locale: string) {
  if (locale === "en") return "The brochure is attached to this email.";
  if (locale === "fr") return "La brochure est jointe à ce courriel.";
  return "El folleto va adjunto a este correo.";
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const subject = text(form.get("subject")).slice(0, 140);
  const message = text(form.get("message")).slice(0, 8000);
  if (!subject || message.length < 2) return go(request, "/privado/difusion?error=datos");
  const link = publicationUrl(text(form.get("link")));
  const upload = form.get("file");
  let attachment: { filename: string; content: string } | undefined;
  if (upload instanceof File && upload.size > 0) {
    const pdf = upload.type === "application/pdf" || /\.pdf$/i.test(upload.name);
    const image = upload.type.startsWith("image/") && upload.type !== "image/svg+xml";
    if ((!pdf && !image) || upload.size > 4 * 1024 * 1024) return go(request, "/privado/difusion?error=archivo");
    attachment = {
      filename: safeFileName(upload.name),
      content: Buffer.from(await upload.arrayBuffer()).toString("base64"),
    };
  }
  const audience = (await listClients()).filter((client) => client.passwordHash && !client.commercialOptOut && client.email);
  if (!audience.length) return go(request, "/privado/difusion?error=vacio");
  let sent = 0;
  let failed = 0;
  for (const client of audience) {
    const locale = clientLocale(client);
    const t = getPortalCopy(locale);
    const name = mailName(client.event, client.name);
    const href = `${site.url}${localePath(locale, "/area-novia/baja")}?id=${encodeURIComponent(client.id)}&tipo=comercial&token=${encodeURIComponent(unsubscribeToken(client.id, "comercial"))}`;
    const legal = broadcastLegal(href, `${site.url}${localePath(locale, "/privacidad")}`);
    const mail = brandedClientEmail({
      lang: locale,
      blocks: [
        { text: interpolate(t.activationReminderHello, { name }) },
        { text: message },
        ...(link ? [{ href: link, label: publicationLabel(locale) }] : []),
        ...(attachment ? [{ text: attachedNote(locale), muted: true as const }] : []),
      ],
      signoff: [t.recoverMailSignoff],
      legalHtml: legal.html,
      legalText: legal.text,
    });
    if (await notifyEmail(client.email, subject, mail.text, mail.html, attachment ? [attachment] : undefined)) sent += 1;
    else failed += 1;
  }
  return go(request, `/privado/difusion?ok=enviado&sent=${sent}&failed=${failed}`);
}
