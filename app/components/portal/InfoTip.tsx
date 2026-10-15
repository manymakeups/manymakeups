"use client";

import { useEffect, useId, useState } from "react";

export function InfoTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex size-7 items-center justify-center rounded-full border border-ink/20 font-sans text-sm italic leading-none text-ash hover:text-ink"
        onClick={() => setOpen((value) => !value)}
      >
        i
      </button>
      {open ? (
        <span
          id={id}
          role="note"
          className="absolute left-0 top-[calc(100%+0.6rem)] z-20 w-[min(18rem,calc(100vw-2.5rem))] border border-ink/10 bg-porcelain p-3 text-left font-sans text-sm not-italic normal-case leading-relaxed tracking-normal text-ash shadow-[0_12px_40px_rgba(26,22,19,0.12)]"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
