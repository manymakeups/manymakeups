import { PORTAL_TABS, type PortalTab } from "@/lib/portal/types";

export function PortalTabs({
  basePath,
  active,
}: {
  basePath: string;
  active: PortalTab;
}) {
  return (
    <nav className="mt-8 flex flex-wrap gap-x-1 border-b border-ink/10">
      {PORTAL_TABS.map((tab) => {
        const on = tab.id === active;
        return (
          <a
            key={tab.id}
            href={`${basePath}?tab=${tab.id}`}
            className={
              on
                ? "border-b-2 border-gilt px-3 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ink"
                : "border-b-2 border-transparent px-3 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
            }
          >
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}
