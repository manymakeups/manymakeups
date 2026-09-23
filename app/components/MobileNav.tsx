"use client";

import { useEffect, useState } from "react";

type MobileNavProps = {
  label: string;
  closeLabel: string;
  contactLabel: string;
  contactHref: string;
  links: { href: string; label: string }[];
};

export function MobileNav({
  label,
  closeLabel,
  contactLabel,
  contactHref,
  links,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
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
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center text-ink"
        aria-expanded={open}
        aria-controls="mobile-nav"
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
      {open ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-50 bg-porcelain px-6 py-5"
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
              onClick={() => setOpen(false)}
            >
              {closeLabel}
            </button>
          </div>
          <nav className="mt-16 flex flex-col gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                className="font-serif text-3xl"
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            className="btn-atelier-solid btn-atelier mt-12 inline-flex"
            href={contactHref}
            onClick={() => setOpen(false)}
          >
            {contactLabel}
          </a>
        </div>
      ) : null}
    </div>
  );
}
