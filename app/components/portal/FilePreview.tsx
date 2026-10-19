"use client";

import { useEffect, useState } from "react";

function kindOf(name: string) {
  if (/\.(jpe?g|png|webp|gif)$/i.test(name)) return "image";
  if (/\.pdf$/i.test(name)) return "pdf";
  return "file";
}

export function FilePreview({
  href,
  label,
  className = "text-sm underline decoration-gilt/60 underline-offset-4 hover:text-gilt",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const kind = kindOf(label);
  const download = href.includes("download=1") ? href : `${href}${href.includes("?") ? "&" : "?"}download=1`;
  const view = href.replace(/&download=1|download=1&?/, "");

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {className.includes("btn-atelier") ? "Ver" : `Ver ${label}`}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-3xl flex-col bg-porcelain shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4">
              <p className="min-w-0 truncate font-serif text-2xl">{label}</p>
              <button
                type="button"
                className="shrink-0 text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-linen/40 p-4">
              {kind === "image" ? (
                <img src={view} alt="" className="mx-auto max-h-[70dvh] w-auto max-w-full" />
              ) : kind === "pdf" ? (
                <iframe title={label} src={view} className="h-[70dvh] w-full bg-porcelain" />
              ) : (
                <p className="text-sm text-ash">Este archivo se abre descargándolo.</p>
              )}
            </div>
            <div className="flex justify-end border-t border-ink/10 px-5 py-4">
              <a className="btn-atelier" href={download}>
                Descargar
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
