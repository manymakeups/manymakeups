"use client";

import { useEffect, useRef, useState } from "react";
import { PORTAL_TABS, type PortalTab, type StudioTab } from "@/lib/portal/types";

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

export function StudioNav({
  basePath,
  active,
  labels,
  badges,
  menuLabel = "Secciones",
  tabs = PORTAL_TABS,
}: {
  basePath: string;
  active: StudioTab;
  labels?: Partial<Record<StudioTab, string>>;
  badges?: Partial<Record<StudioTab, number>>;
  menuLabel?: string;
  tabs?: readonly { id: StudioTab; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const current = tabs.find((tab) => tab.id === active);
  const currentLabel = current ? (labels?.[current.id] ?? current.label) : "";
  return (
    <div ref={root} className="relative">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center text-ink"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={menuLabel}
          onClick={() => setOpen((value) => !value)}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        {currentLabel ? (
          <span className="text-[0.68rem] uppercase tracking-[0.16em] text-ink">{currentLabel}</span>
        ) : null}
      </div>
      {open ? (
        <div role="menu" className="absolute left-0 top-full z-40 flex min-w-52 flex-col border border-ink/10 bg-porcelain py-1 shadow-[0_16px_40px_rgba(26,22,19,0.12)]">
          {tabs.map((tab) => {
            const on = tab.id === active;
            const count = badges?.[tab.id] ?? 0;
            return (
              <a
                key={tab.id}
                role="menuitem"
                href={`${basePath}?tab=${tab.id}`}
                aria-current={on ? "page" : undefined}
                className={
                  on
                    ? "flex items-center px-4 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ink"
                    : "flex items-center px-4 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
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
      ) : null}
    </div>
  );
}
