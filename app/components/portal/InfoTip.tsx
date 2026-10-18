"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function InfoTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) {
      setBox(null);
      return;
    }
    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(352, window.innerWidth - 24);
      let left = rect.left;
      if (left + width > window.innerWidth - 12) left = window.innerWidth - 12 - width;
      if (left < 12) left = 12;
      const spaceBelow = window.innerHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(120, openUp ? spaceAbove - 8 : spaceBelow - 8);
      const top = openUp ? Math.max(12, rect.top - 8 - maxHeight) : rect.bottom + 8;
      setBox({ top, left, width, maxHeight });
    }
    place();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  return (
    <span className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex size-7 items-center justify-center rounded-full border border-ink/20 font-sans text-sm italic leading-none text-ash hover:text-ink"
        onClick={() => setOpen((value) => !value)}
      >
        i
      </button>
      {open && box
        ? createPortal(
            <span
              id={id}
              role="note"
              style={{ top: box.top, left: box.left, width: box.width, maxHeight: box.maxHeight }}
              className="fixed z-[80] overflow-y-auto border border-ink/10 bg-porcelain p-4 text-left font-sans text-sm not-italic normal-case leading-relaxed tracking-normal text-ink shadow-[0_12px_40px_rgba(26,22,19,0.12)]"
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
