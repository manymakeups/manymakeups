import { InboxLink } from "@/app/components/portal/InboxLink";
import { listNotices } from "@/lib/portal/store";
import Link from "next/link";
import type { ReactNode } from "react";

export async function StudioAside({ extra }: { extra?: ReactNode }) {
  const unread = (await listNotices()).filter((notice) => !notice.read).length;
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
      <Link className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" href="/privado/novias">
        Clientas
      </Link>
      <Link className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" href="/privado/correo">
        Correo
      </Link>
      {extra}
      <Link className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" href="/privado/calendario">
        Agenda
      </Link>
      <Link className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" href="/privado/difusion">
        Difusión
      </Link>
      <InboxLink unread={unread} />
      <form action="/api/portal/logout?next=/privado" method="post">
        <button className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" type="submit">
          Salir
        </button>
      </form>
    </div>
  );
}
