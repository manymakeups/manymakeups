"use client";

import { useState } from "react";

export function NewClientModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 items-center text-[0.68rem] uppercase tracking-[0.14em] text-ash hover:text-ink sm:tracking-[0.18em]"
        onClick={() => setOpen(true)}
      >
        Crear invitación
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-3 sm:items-center sm:p-6" onClick={() => setOpen(false)}>
          <div
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto bg-porcelain p-5 shadow-[0_20px_60px_rgba(26,22,19,0.16)] sm:p-6"
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
              <label className="field-label sm:col-span-2">
                Estilista asignado
                <input className="field" name="stylist" required />
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
