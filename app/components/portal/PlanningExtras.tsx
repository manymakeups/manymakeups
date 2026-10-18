"use client";

import { useState } from "react";
import type { PlanningExtra } from "@/lib/portal/types";

const PRESETS = [
  "Colocación de velo",
  "Retoque pre ceremonia",
  "Retoque post ceremonia",
  "Prueba de velo",
] as const;

type Row = PlanningExtra & { preset: string; custom: string };

function fresh(): Row {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
  return { id, label: PRESETS[0], time: "", endTime: "", note: "", preset: PRESETS[0], custom: "" };
}

export function PlanningExtras({ extras }: { extras: PlanningExtra[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    extras.map((item) => {
      const known = (PRESETS as readonly string[]).includes(item.label);
      return { ...item, preset: known ? item.label : "otro", custom: known ? "" : item.label };
    }),
  );
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">Extras</p>
      {rows.map((row) => (
        <fieldset key={row.id} className="border border-ink/10 p-3">
          <input type="hidden" name="extraId" value={row.id} />
          <label className="field-label">
            Extra
            <select
              className="field"
              name={`extraPreset.${row.id}`}
              value={row.preset}
              onChange={(event) => {
                const preset = event.target.value;
                setRows((current) => current.map((item) => (item.id === row.id ? { ...item, preset } : item)));
              }}
            >
              {PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
              <option value="otro">Otro</option>
            </select>
          </label>
          {row.preset === "otro" ? (
            <label className="field-label mt-3">
              Cuál
              <input
                className="field"
                name={`extraCustom.${row.id}`}
                value={row.custom}
                onChange={(event) => {
                  const custom = event.target.value;
                  setRows((current) => current.map((item) => (item.id === row.id ? { ...item, custom } : item)));
                }}
              />
            </label>
          ) : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="field-label">
              Desde
              <input className="field" name={`extraTime.${row.id}`} type="time" defaultValue={row.time} />
            </label>
            <label className="field-label">
              Hasta
              <input className="field" name={`extraEnd.${row.id}`} type="time" defaultValue={row.endTime} />
            </label>
          </div>
          <label className="field-label mt-3">
            Notas
            <input className="field" name={`extraNote.${row.id}`} defaultValue={row.note} />
          </label>
          <button
            type="button"
            className="mt-3 text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
            onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
          >
            Quitar
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="self-start text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
        onClick={() => setRows((current) => [...current, fresh()])}
      >
        Añadir extra
      </button>
    </div>
  );
}
