"use client";

import { useState } from "react";

export function NewClientModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
        onClick={() => setOpen(true)}
      >
        Crear invitación
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-5" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg bg-porcelain p-6 shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="font-serif text-3xl">Crear invitación</h2>
            <p className="mt-3 text-sm text-ash">
              Creas la cuenta con su correo, le envías el enlace y ella elige la contraseña.
            </p>
            <form action="/api/admin/clients" method="post" className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="field-label">
                Nombre
                <input className="field" name="name" required />
              </label>
              <label className="field-label">
                Correo
                <input className="field" name="email" type="email" required />
              </label>
              <button className="btn-atelier-solid btn-atelier sm:col-span-2 self-start" type="submit">
                Crear invitación
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
    </>
  );
}
