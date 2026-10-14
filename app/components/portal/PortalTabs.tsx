import { PORTAL_TABS, type PortalTab } from "@/lib/portal/types";

export function PortalTabs({
  basePath,
  active,
  labels,
  badges,
}: {
  basePath: string;
  active: PortalTab;
  labels?: Record<PortalTab, string>;
  badges?: Partial<Record<PortalTab, number>>;
}) {
  return (
    <nav className="mt-8 border-b border-ink/10 bg-porcelain">
      <div className="flex flex-wrap gap-x-1">
        {PORTAL_TABS.map((tab) => {
          const on = tab.id === active;
          const count = badges?.[tab.id] ?? 0;
          return (
            <a
              key={tab.id}
              href={`${basePath}?tab=${tab.id}`}
              className={
                on
                  ? "inline-flex items-center border-b-2 border-gilt px-3 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ink"
                  : "inline-flex items-center border-b-2 border-transparent px-3 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
              }
            >
              {labels?.[tab.id] ?? tab.label}
              {count > 0 ? (
                <span className="ml-2 inline-flex min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.6rem] font-medium leading-4 tracking-normal text-porcelain">
                  {count > 9 ? "9+" : count}
                </span>
              ) : null}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
