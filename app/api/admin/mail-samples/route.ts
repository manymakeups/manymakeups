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
  const weekDetails = [
    t.appointmentReminderDetails,
    `${t.mailService}: Prueba`,
    `${t.mailDate}: Sábado, 24 de octubre de 2026`,
    `${t.mailTime}: 12:30 h`,
    `${t.mailPlace}: Estudio`,
    `${t.mailAmount}: 80,00 €`,
  ].join("\n");
  const soonDetails = [
    t.appointmentReminderSoonDetails,
    `${t.mailService}: Prueba`,
    `${t.mailDate}: Sábado, 24 de octubre de 2026`,
    `${t.mailTime}: 12:30 h`,
    `${t.mailPlace}: Estudio`,
    `${t.appointmentAmountDue}: 80,00 €`,
  ].join("\n");
  const samples = [
    {
      subject: interpolate(t.inviteMailSubject, { name: "Ana" }),
      blocks: [
        { text: interpolate(t.mailHi, { name: "Ana" }) },
        { text: t.inviteMailBody },
        { text: t.inviteMailCta },
        { href: link, label: t.inviteMailLink },
        { text: t.inviteMailExpiry, muted: true as const },
      ],
    },
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
      subject: interpolate(t.activationReminderWeekSubject, { name: "Ana" }),
      blocks: [
        { text: interpolate(t.mailHi, { name: "Ana" }) },
        { text: t.activationReminderWeekBody },
        { text: t.activationReminderWeekCta },
        { href: link, label: t.activationReminderLink },
        { text: t.activationReminderWeekClose, muted: true as const },
      ],
    },
    {
      subject: interpolate(t.activationReminderUrgentSubject, { name: "Ana" }),
      blocks: [
        { text: interpolate(t.mailHi, { name: "Ana" }) },
        { text: t.activationReminderUrgentBody },
        { text: interpolate(t.activationReminderUrgentCta, { date: "8 de noviembre de 2026" }) },
        { href: link, label: t.activationReminderUrgentLink },
        { text: t.activationReminderUrgentClose, muted: true as const },
      ],
    },
    {
      subject: interpolate(t.appointmentReminderSubject, { name: "Ana" }),
      blocks: [
        { text: interpolate(t.mailHi, { name: "Ana" }) },
        { text: t.appointmentReminderIntro },
        { text: weekDetails },
        { href: link, label: t.appointmentReminderConfirm },
        { text: t.appointmentReminderClose, muted: true as const },
      ],
    },
    {
      subject: t.appointmentReminderSoonSubject,
      signoff: [t.appointmentReminderSoonSignoff],
      blocks: [
        { text: interpolate(t.mailHi, { name: "Ana" }) },
        { text: t.appointmentReminderSoonIntro },
        { text: soonDetails },
        { href: link, label: t.appointmentReminderConfirm },
        { text: t.appointmentReminderSoonClose, muted: true as const },
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
