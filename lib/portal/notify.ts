import { site } from "@/lib/site";
import type { ClientRecord } from "./types";

async function sendWithResend(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.MAIL_FROM || `Many Makeups <${site.email}>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], reply_to: site.email, subject, text }),
  });
  return response.ok;
}

async function sendWithFormSubmit(to: string, subject: string, text: string) {
  const toStudio = to.toLowerCase() === site.email.toLowerCase();
  await fetch(`https://formsubmit.co/ajax/${site.email}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: subject,
      _captcha: "false",
      _template: "box",
      _replyto: site.email,
      ...(toStudio ? {} : { _cc: to }),
      message: toStudio ? text : `Para: ${to}\n\n${text}`,
    }),
  });
}

async function sendMail(to: string, subject: string, text: string) {
  if (await sendWithResend(to, subject, text)) return;
  await sendWithFormSubmit(to, subject, text);
}

export async function notifyStudio(subject: string, lines: string[]) {
  const text = ["Área clientes · Many Makeups", "", ...lines].join("\n");
  try {
    await sendMail(site.email, subject, text);
  } catch {
    /* the client save still succeeds */
  }
}

export async function notifyEmail(to: string, subject: string, text: string) {
  try {
    await sendMail(to, subject, text);
  } catch {
    /* ignore mail failures */
  }
}

export function clientLabel(client: ClientRecord) {
  return `${client.event.clientName || client.name} · ${client.email}`;
}
