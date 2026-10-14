"use client";

import { useState } from "react";
import { type ClientSearchMode } from "@/lib/portal/client-search";
import { SERVICE_TITLES } from "@/lib/portal/types";

const MODES: { id: ClientSearchMode; label: string }[] = [
  { id: "nombre", label: "Nombre" },
  { id: "presupuesto", label: "Presupuesto" },
  { id: "telefono", label: "Teléfono" },
  { id: "fecha", label: "Fecha del evento" },
];

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
  const active = Boolean(query.trim() || (mode === "presupuesto" && partida));

  return (
    <form method="get" action="/privado/novias" className="mt-10 flex flex-col gap-4 border border-ink/10 px-5 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="field-label sm:w-52">
          Buscar por
          <select
            className="field"
            name="por"
            value={current}
            onChange={(event) => setCurrent(event.target.value as ClientSearchMode)}
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
            Partida
            <select className="field" name="partida" defaultValue={partida}>
              <option value="">Cualquiera</option>
              {SERVICE_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="field-label min-w-0 flex-1">
          {current === "fecha" ? "Fecha" : current === "presupuesto" ? "Nombre o importe" : current === "telefono" ? "Teléfono" : "Nombre"}
          <input
            className="field"
            name="q"
            type={current === "fecha" ? "date" : "search"}
            defaultValue={query}
            placeholder={current === "presupuesto" ? "Limpieza, 180…" : ""}
          />
        </label>
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
  );
}
