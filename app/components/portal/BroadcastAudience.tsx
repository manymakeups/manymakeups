"use client";

import { useEffect, useMemo, useState } from "react";

type Person = {
  id: string;
  name: string;
  email: string;
  optedOut: boolean;
};

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function BroadcastAudience({ people }: { people: Person[] }) {
  const [rows, setRows] = useState(people);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState("");
  const receiving = rows.filter((person) => !person.optedOut).length;
  const visible = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle) return rows;
    return rows.filter((person) => fold(`${person.name} ${person.email}`).includes(needle));
  }, [query, rows]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function toggle(person: Person) {
    const next = !person.optedOut;
    setPending(person.id);
    setRows((current) => current.map((item) => (item.id === person.id ? { ...item, optedOut: next } : item)));
    const response = await fetch("/api/admin/broadcast/opt-out", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: person.id, optOut: next }),
    });
    setPending("");
    if (!response.ok) {
      setRows((current) => current.map((item) => (item.id === person.id ? { ...item, optedOut: person.optedOut } : item)));
    }
  }

  return (
    <>
    <fieldset className="border border-ink/10 p-4">
      <legend className="px-1 text-[0.68rem] uppercase tracking-[0.16em] text-gilt">
        Reciben el correo ({receiving})
      </legend>
      {rows.length ? (
        <button
          type="button"
          className="mt-3 text-sm text-ink underline decoration-gilt/60 underline-offset-4 hover:decoration-gilt"
          onClick={() => setOpen(true)}
        >
          Ver el listado de los destinatarios
        </button>
      ) : (
        <p className="mt-3 text-sm text-ash">Todavía no hay clientas dadas de alta que acepten estos correos.</p>
      )}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-3 sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-lg flex-col bg-porcelain p-5 shadow-[0_20px_60px_rgba(26,22,19,0.16)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="broadcast-audience-title"
          >
            <h2 id="broadcast-audience-title" className="font-serif text-3xl">
              Destinatarios
            </h2>
            <label className="field-label mt-5">
              Buscar por nombre o correo
              <input
                className="field"
                type="search"
                value={query}
                autoFocus
                placeholder="Nombre o correo"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
              {visible.length ? (
                visible.map((person) => (
                  <li key={person.id} className="border-b border-ink/10 pb-3">
                    <p className="text-sm">{person.name}</p>
                    <p className="text-sm text-ash">{person.email}</p>
                    <label className="mt-2 flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={person.optedOut}
                        disabled={pending === person.id}
                        onChange={() => toggle(person)}
                      />
                      <span>Dar de baja en listas de difusión</span>
                    </label>
                  </li>
                ))
              ) : (
                <li className="text-sm text-ash">Nadie coincide con esa búsqueda.</li>
              )}
            </ul>
            <button
              type="button"
              className="mt-4 self-start text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </fieldset>
    <button className="btn-atelier btn-atelier-solid self-start" type="submit" disabled={!receiving}>
      Enviar
    </button>
    </>
  );
}
