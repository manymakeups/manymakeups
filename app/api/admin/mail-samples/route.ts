import { getPortalCopy } from "@/lib/i18n/portal-messages";
import { go } from "@/lib/portal/http";
import { brandedClientEmail } from "@/lib/portal/mail-html";
import { notifyEmail } from "@/lib/portal/notify";
import { requireAdmin } from "@/lib/portal/session";

const TO = "anabmtnez78@hotmail.com";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const t = getPortalCopy("es");
  const link = "https://www.manymakeups.com/area-novia";
  const signoff = [t.recoverMailSignoff];
  const footer = { href: link, label: t.unsubRemindersFooter };
  const appointmentRows = [
    { label: t.mailService, value: "Prueba" },
    { label: t.mailDate, value: "sábado, 24 de octubre de 2026" },
    { label: t.mailTime, value: "12:30" },
    { label: t.mailPlace, value: "Estudio" },
    { label: t.mailAmount, value: "80,00 €" },
  ];
  const samples = [
    {
      subject: t.activationReminderSubject,
      blocks: [
        { text: "Hola Ana," },
        { text: t.activationReminderBody },
        { href: link, label: t.activationReminderLink },
        { text: t.activationReminderClose, muted: true as const },
      ],
    },
    {
      subject: t.activationReminderWeekSubject,
      blocks: [
        { text: "Hola Ana," },
        { text: t.activationReminderWeekBody },
        { href: link, label: t.activationReminderLink },
        { text: t.activationReminderClose, muted: true as const },
      ],
    },
    {
      subject: t.activationReminderUrgentSubject,
      blocks: [
        { text: "Hola Ana," },
        { text: t.activationReminderUrgentBody },
        { href: link, label: t.activationReminderLink },
        { text: t.activationReminderClose, muted: true as const },
      ],
    },
    {
      subject: t.appointmentReminderSubject,
      blocks: [
        { text: "Hola Ana," },
        { text: t.appointmentReminderIntro },
        { rows: appointmentRows },
        { href: link, label: t.appointmentReminderConfirm },
        { text: t.appointmentReminderClose, muted: true as const },
      ],
    },
    {
      subject: t.appointmentReminderSoonSubject,
      blocks: [
        { text: "Hola Ana," },
        { text: t.appointmentReminderSoonIntro },
        { rows: appointmentRows },
        { href: link, label: t.appointmentReminderConfirm },
        { text: t.appointmentReminderClose, muted: true as const },
      ],
    },
    {
      subject: t.planningMailSubject,
      blocks: [
        { text: "Hola Ana," },
        { text: t.planningMailIntro },
        {
          rows: [
            { label: t.planningLocation, value: "Masía" },
            { label: t.planningArrivalShort, value: "a las 08:00" },
            { label: t.planningSet, value: "de 08:00 a 08:45" },
            { label: "Ana Martínez", value: "a las 09:15" },
            { label: "Pareja", value: "a las 10:00" },
            { label: t.planningBreaks, value: "a las 11:30" },
            { label: "Colocación de velo", value: "a las 12:15" },
            { label: t.planningPack, value: "a las 14:00" },
          ],
        },
        { href: link, label: t.planningTab },
      ],
    },
  ];
  let sent = 0;
  for (const sample of samples) {
    const mail = brandedClientEmail({ lang: "es", blocks: sample.blocks, signoff, footer });
    if (await notifyEmail(TO, sample.subject, mail.text, mail.html)) sent += 1;
  }
  return go(request, `/privado/novias?ok=muestras&sent=${sent}`);
}
