import { site } from "@/lib/site";
import type { ClientRecord } from "./types";

async function sendMail(to: string, subject: string, text: string) {
  await fetch(`https://formsubmit.co/ajax/${to}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: subject,
      _captcha: "false",
      _template: "box",
      message: text,
    }),
  });
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
