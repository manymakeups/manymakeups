import { site } from "@/lib/site";
import type { ClientRecord } from "./types";

export async function notifyStudio(subject: string, lines: string[]) {
  const text = ["Área de novia · Many Makeups", "", ...lines].join("\n");
  try {
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
        message: text,
      }),
    });
  } catch {
    /* the client save still succeeds */
  }
}

export function clientLabel(client: ClientRecord) {
  return `${client.event.clientName || client.name} · ${client.email}`;
}
