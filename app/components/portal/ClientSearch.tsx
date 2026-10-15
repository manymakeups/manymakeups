"use client";

import { useEffect, useState } from "react";
import { type ClientSearchMode } from "@/lib/portal/client-search";
import { DOCUMENT_KINDS } from "@/lib/portal/types";

const MODES: { id: ClientSearchMode; label: string }[] = [
  { id: "nombre", label: "Nombre" },
  { id: "presupuesto", label: "Presupuesto" },
  { id: "telefono", label: "Teléfono" },
  { id: "fecha", label: "Fecha del evento" },
];

function SearchFields({
  current,
  onMode,
  query,
  partida,
}: {
  current: ClientSearchMode;
  onMode: (mode: ClientSearchMode) => void;
  query: string;
  partida: string;
}) {
  return (
    <>
      <label className="field-label sm:w-52">
        Buscar por
        <select
          className="field"
          name="por"
          value={current}
          onChange={(event) => onMode(event.target.value as ClientSearchMode)}
        >
          {MODES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      {current === "presupuesto" ? (
        <label className="field-label sm:w-64">
          Tipo
          <select className="field" name="partida" defaultValue={partida}>
            <option value="">Cualquiera</option>
            {DOCUMENT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="field-label min-w-0 flex-1">
        {current === "fecha" ? "Fecha" : current === "presupuesto" ? "Nombre del documento" : current === "telefono" ? "Teléfono" : "Nombre"}
        <input
          className="field"
          name="q"
          type={current === "fecha" ? "date" : "search"}
          defaultValue={query}
          placeholder={current === "presupuesto" ? "Presupuesto Laura.pdf" : ""}
        />
      </label>
    </>
  );
}

export function ClientSearch({
  mode,
  query,
  partida,
}: {
  mode: ClientSearchMode;
  query: string;
  partida: string;
}) {
  const [current, setCurrent] = useState<ClientSearchMode>(mode);
  const [open, setOpen] = useState(false);
  const active = Boolean(query.trim() || (mode === "presupuesto" && partida));

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="flex items-center gap-3 md:hidden">
        {active ? (
          <a className="text-[0.68rem] uppercase tracking-[0.14em] text-ash hover:text-ink" href="/privado/novias">
            Ver todas
          </a>
        ) : null}
        <button
          type="button"
          className="relative inline-flex size-11 items-center justify-center text-ink"
          aria-label="Buscar"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <circle cx="11" cy="11" r="6.25" />
            <path d="M15.5 15.5 20 20" />
          </svg>
          {active ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-gilt" /> : null}
        </button>
      </div>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-3 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[92dvh] w-full overflow-y-auto bg-porcelain p-5 shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Buscar"
          >
            <h2 className="font-serif text-3xl">Buscar</h2>
            <form method="get" action="/privado/novias" className="mt-6 flex flex-col gap-4">
              <SearchFields current={current} onMode={setCurrent} query={query} partida={partida} />
              <button className="btn-atelier btn-atelier-solid self-start" type="submit">
                Buscar
              </button>
            </form>
            <button
              type="button"
              className="mt-4 text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
      <form method="get" action="/privado/novias" className="mt-10 hidden flex-col gap-4 border border-ink/10 px-5 py-5 md:flex">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <SearchFields current={current} onMode={setCurrent} query={query} partida={partida} />
          <button className="btn-atelier btn-atelier-solid self-start sm:self-auto" type="submit">
            Buscar
          </button>
        </div>
        {active ? (
          <a className="text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink" href="/privado/novias">
            Ver todas
          </a>
        ) : null}
      </form>
    </>
  );
}
