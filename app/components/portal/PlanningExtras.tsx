"use client";

import { useState, type ReactNode } from "react";
import type { PlanningExtra } from "@/lib/portal/types";

const FIXED = [
  { id: "colocacionvelo", label: "Colocación de velo" },
  { id: "retoquepost", label: "Retoque post ceremonia" },
] as const;

const PRESETS = ["Retoque pre ceremonia", "Prueba de velo"] as const;

type Row = PlanningExtra & { preset: string; custom: string };

function fresh(): Row {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
  return { id, label: PRESETS[0], time: "", endTime: "", note: "", preset: PRESETS[0], custom: "" };
}

function Times({ startName, endName, start, end }: { startName: string; endName: string; start: string; end: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="field-label">
        Desde
        <input className="field" name={startName} type="time" defaultValue={start} />
      </label>
      <label className="field-label">
        Hasta
        <input className="field" name={endName} type="time" defaultValue={end} />
      </label>
    </div>
  );
}

function YesNo({
  label,
  name,
  initial,
  children,
}: {
  label: string;
  name: string;
  initial: boolean;
  children: ReactNode;
}) {
  const [on, setOn] = useState(initial);
  return (
    <fieldset className="border border-ink/10 p-3">
      <label className="field-label">
        {label}
        <select className="field" name={name} value={on ? "si" : "no"} onChange={(event) => setOn(event.target.value === "si")}>
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select>
      </label>
      <div className={on ? "mt-3 flex flex-col gap-3" : "hidden"}>{children}</div>
    </fieldset>
  );
}

export function PlanningExtras({ extras }: { extras: PlanningExtra[] }) {
  const fixed = FIXED.map((item) => {
    const saved =
      extras.find((extra) => extra.id === item.id) || extras.find((extra) => extra.label === item.label);
    return { ...item, saved };
  });
  const [rows, setRows] = useState<Row[]>(() =>
    extras
      .filter((item) => !FIXED.some((fixedItem) => fixedItem.id === item.id || fixedItem.label === item.label))
      .map((item) => {
        const known = (PRESETS as readonly string[]).includes(item.label);
        return { ...item, preset: known ? item.label : "otro", custom: known ? "" : item.label };
      }),
  );
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">Extras</p>
      {fixed.map((item) => (
        <YesNo key={item.id} label={item.label} name={`extraOn.${item.id}`} initial={Boolean(item.saved)}>
          <input type="hidden" name="extraId" value={item.id} />
          <input type="hidden" name={`extraPreset.${item.id}`} value={item.label} />
          <Times
            startName={`extraTime.${item.id}`}
            endName={`extraEnd.${item.id}`}
            start={item.saved?.time || ""}
            end={item.saved?.endTime || ""}
          />
          <label className="field-label">
            Nota
            <input className="field" name={`extraNote.${item.id}`} defaultValue={item.saved?.note || ""} />
          </label>
        </YesNo>
      ))}
      {rows.map((row) => (
        <fieldset key={row.id} className="border border-ink/10 p-3">
          <input type="hidden" name="extraId" value={row.id} />
          <label className="field-label">
            Otro extra
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
          <div className="mt-3">
            <Times startName={`extraTime.${row.id}`} endName={`extraEnd.${row.id}`} start={row.time} end={row.endTime} />
          </div>
          <label className="field-label mt-3">
            Nota
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
        Añadir otro extra
      </button>
    </div>
  );
}
