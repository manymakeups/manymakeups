import { getPortalCopy, interpolate } from "@/lib/i18n/portal-messages";
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
      signoff: [t.activationReminderSignoff],
      blocks: [
        { text: interpolate(t.activationReminderGreeting, { name: "Ana" }) },
        { text: t.activationReminderBody },
        { text: t.activationReminderCta },
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
            { label: t.planningLocation, value: "C/ Cascabeles 21, Arganda del Rey" },
            { label: t.mailDate, value: "27 de septiembre de 2026" },
            { label: "Pendiente de pago del servicio", value: "215,71 €" },
            { label: t.planningSet, value: "08:45 – 09:00\nLlegada y colocación de productos" },
            { label: "Maquillaje y peinado Natalia", value: "09:00 – 11:00" },
            { label: "Maquillaje y peinado Mª Luisa", value: "11:00 – 13:00" },
            { label: t.planningBreaks, value: "13:00 – 13:30" },
            { label: "Colocación de velo", value: "16:30 – 16:45" },
            { label: t.planningPack, value: "17:30 – 18:00" },
          ],
        },
        { text: t.planningCashNote, muted: true as const },
        { href: link, label: t.planningTab },
      ],
    },
  ];
  let sent = 0;
  for (const sample of samples) {
    const mail = brandedClientEmail({
      lang: "es",
      blocks: sample.blocks,
      signoff: "signoff" in sample && sample.signoff ? sample.signoff : signoff,
      footer,
    });
    if (await notifyEmail(TO, sample.subject, mail.text, mail.html)) sent += 1;
  }
  return go(request, `/privado/novias?ok=muestras&sent=${sent}`);
}
