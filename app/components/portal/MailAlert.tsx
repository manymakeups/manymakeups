"use client";

import { BINDER_MAILBOX, HOTMAIL_MAILBOX, MAILBOXES, type MailboxKey } from "@/lib/portal/mailboxes";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type FreshMail = { id: string; account: MailboxKey | "binder" | "hotmail"; from: string; subject: string };

export function MailAlert() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const known = useRef<Set<string> | null>(null);
  const baseTitle = useRef("");

  useEffect(() => {
    baseTitle.current = document.title.replace(/^\(\d+\)\s/, "");
    let dead = false;
    let asked = false;

    function arm() {
      if (asked || typeof Notification === "undefined") return;
      asked = true;
      if (Notification.permission === "default") void Notification.requestPermission();
    }

    async function poll() {
      try {
        const res = await fetch("/api/admin/mail?unseen=1", { cache: "no-store" });
        const json = (await res.json()) as { counts?: Record<string, number>; items?: FreshMail[] };
        if (dead || !res.ok) return;
        const items = json.items || [];
        const count = Object.values(json.counts || {}).reduce((sum, value) => sum + value, 0);
        setTotal(count);
        const title = baseTitle.current || "Correo";
        document.title = count ? `(${count}) ${title}` : title;
        const ids = new Set(items.map((item) => item.id));
        if (known.current) {
          const fresh = items.filter((item) => !known.current?.has(item.id));
          if (fresh.length && typeof Notification !== "undefined" && Notification.permission === "granted") {
            const first = fresh[0];
            const box = [...MAILBOXES, BINDER_MAILBOX, HOTMAIL_MAILBOX].find((item) => item.key === first.account);
            const note = new Notification(
              fresh.length === 1 ? first.subject || "(sin asunto)" : `${fresh.length} correos nuevos`,
              {
                body: fresh.length === 1 ? `${first.from}\n${box?.address || ""}` : fresh.slice(0, 3).map((item) => item.subject).join("\n"),
                tag: "manymakeups-correo",
              },
            );
            note.onclick = () => {
              window.focus();
              router.push("/privado/correo");
            };
          }
        }
        known.current = ids;
      } catch {
        /* the next pass retries */
      }
    }

    window.addEventListener("pointerdown", arm);
    window.addEventListener("mm-mail", poll);
    void poll();
    const timer = window.setInterval(() => void poll(), 25000);
    return () => {
      dead = true;
      window.clearInterval(timer);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("mm-mail", poll);
      if (baseTitle.current) document.title = baseTitle.current;
    };
  }, [router]);

  if (!total) return null;
  return <span className="font-bold tabular-nums tracking-normal text-ink">{total}</span>;
}
