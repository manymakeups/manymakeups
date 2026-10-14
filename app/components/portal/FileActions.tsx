"use client";

import { useState } from "react";

export function DeleteFileButton({
  id,
  clientId,
  kind,
  label,
  confirmText,
  title,
  closeLabel = "Cancelar",
}: {
  id: string;
  clientId?: string;
  kind: "inspiration" | "document" | "work";
  label: string;
  confirmText?: string;
  title?: string;
  closeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const question = confirmText || "¿Quitar este archivo?";

  async function remove() {
    setBusy(true);
    const url =
      kind === "document"
        ? "/api/admin/documents"
        : kind === "work"
          ? "/api/admin/work"
          : "/api/portal/inspiration";
    await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, clientId }),
    });
    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        className="text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 px-5" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md bg-porcelain p-8 text-ink shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`quitar-${id}`}
          >
            <h2 id={`quitar-${id}`} className="font-serif text-3xl">
              {title || "Quitar"}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ash">{question}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="btn-atelier" onClick={() => setOpen(false)} disabled={busy}>
                {closeLabel}
              </button>
              <button type="button" className="btn-atelier btn-atelier-solid" onClick={() => void remove()} disabled={busy}>
                {label}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CopyInvite({ url }: { url: string }) {
  return (
    <button
      type="button"
      className="btn-atelier"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
      }}
    >
      Copiar enlace
    </button>
  );
}
