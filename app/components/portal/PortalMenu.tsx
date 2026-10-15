"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function PortalMenu({
  label,
  closeLabel,
  children,
}: {
  label: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center text-ink md:hidden"
        aria-expanded={open}
        aria-controls="portal-menu"
        aria-label={label}
        onClick={() => setOpen(true)}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          aria-hidden
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <div
        id="portal-menu"
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label={label}
        className={
          open
            ? "portal-actions fixed inset-0 z-50 flex flex-col items-start gap-1 overflow-y-auto bg-porcelain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:static md:z-auto md:flex-row md:items-center md:gap-4 md:overflow-visible md:bg-transparent md:p-0"
            : "portal-actions hidden md:flex md:flex-row md:items-center md:gap-4"
        }
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <div className="mb-8 flex w-full justify-end md:hidden">
          <button
            type="button"
            className="min-h-11 px-1 text-[0.68rem] uppercase tracking-[0.18em] text-ash"
            ref={closeRef}
            onClick={() => setOpen(false)}
          >
            {closeLabel}
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
