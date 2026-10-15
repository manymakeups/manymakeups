"use client";

import { useEffect, useRef } from "react";
import { PORTAL_TABS, type PortalTab } from "@/lib/portal/types";

const tabClass =
  "inline-flex shrink-0 items-center whitespace-nowrap border-b-2 px-3 py-3 text-[0.68rem] uppercase tracking-[0.12em] md:tracking-[0.16em]";

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
  const current = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    current.current?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [active]);

  return (
    <nav className="mt-4 min-w-0 border-b border-ink/10 md:mt-8">
      <div className="flex w-full min-w-0 gap-x-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {PORTAL_TABS.map((tab) => {
          const on = tab.id === active;
          const count = badges?.[tab.id] ?? 0;
          return (
            <a
              key={tab.id}
              ref={on ? current : undefined}
              href={`${basePath}?tab=${tab.id}`}
              className={
                on
                  ? `${tabClass} border-gilt text-ink`
                  : `${tabClass} border-transparent text-ash hover:text-ink`
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
