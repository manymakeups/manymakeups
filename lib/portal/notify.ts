import { site } from "@/lib/site";
import { fullName } from "./names";
import type { ClientRecord } from "./types";

export function clientMailReady() {
  return Boolean(process.env.RESEND_API_KEY);
}

type MailAttachment = { filename: string; content: string };

async function sendWithResend(to: string, subject: string, text: string, html?: string, attachments?: MailAttachment[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.MAIL_FROM || `Many Makeups <${site.email}>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: site.email,
      subject,
      text,
      ...(html ? { html } : {}),
      ...(attachments?.length ? { attachments } : {}),
    }),
  });
  return response.ok;
}

async function sendWithFormSubmit(subject: string, text: string) {
  const response = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
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
      message: text,
    }),
  });
  return response.ok;
}

export async function notifyStudio(subject: string, lines: string[]) {
  const text = ["Área clientes · Many Makeups", "", ...lines].join("\n");
  try {
    if (!(await sendWithResend(site.email, subject, text))) {
      await sendWithFormSubmit(subject, text);
    }
  } catch {
    /* the client save still succeeds */
  }
}

export async function notifyEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachments?: MailAttachment[],
) {
  try {
    if (await sendWithResend(to, subject, text, html, attachments)) return true;
    if (to.toLowerCase() === site.email.toLowerCase()) await sendWithFormSubmit(subject, text);
    return false;
  } catch {
    return false;
  }
}

export function clientLabel(client: ClientRecord) {
  return `${fullName(client.event, client.name)} · ${client.email}`;
}
