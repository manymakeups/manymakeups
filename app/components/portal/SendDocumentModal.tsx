"use client";

import { useState } from "react";

export function SendDocumentModal({
  label,
  hint,
  fileLabel,
  closeLabel,
}: {
  label: string;
  hint: string;
  fileLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 items-center text-[0.68rem] uppercase tracking-[0.14em] text-ash hover:text-ink sm:tracking-[0.18em]"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-3 sm:items-center sm:p-6" onClick={() => setOpen(false)}>
          <div
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto bg-porcelain p-5 shadow-[0_20px_60px_rgba(26,22,19,0.16)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="font-serif text-3xl">{label}</h2>
            <p className="mt-3 text-sm text-ash">{hint}</p>
            <form action="/api/portal/documents" method="post" encType="multipart/form-data" className="mt-6 flex flex-col gap-4">
              <label className="field-label">
                {fileLabel}
                <input className="field" name="file" type="file" required accept="application/pdf,image/*" />
              </label>
              <button className="btn-atelier self-start" type="submit">
                {label}
              </button>
            </form>
            <button
              type="button"
              className="mt-4 text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
              onClick={() => setOpen(false)}
            >
              {closeLabel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
