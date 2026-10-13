import { InboxLink } from "@/app/components/portal/InboxLink";
import { listNotices } from "@/lib/portal/store";
import type { ReactNode } from "react";

export async function StudioAside({ extra }: { extra?: ReactNode }) {
  const unread = (await listNotices()).filter((notice) => !notice.read).length;
  return (
    <div className="flex items-center gap-4">
      {extra}
      <InboxLink unread={unread} />
      <form action="/api/portal/logout?next=/privado" method="post">
        <button className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" type="submit">
          Salir
        </button>
      </form>
    </div>
  );
}
