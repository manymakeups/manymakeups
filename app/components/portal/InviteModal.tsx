"use client";

import { CopyInvite } from "@/app/components/portal/FileActions";
import { useState } from "react";

export function InviteModal({ clientId, invite }: { clientId: string; invite?: string }) {
  const [open, setOpen] = useState(Boolean(invite));
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-porcelain p-6 shadow-[0_20px_60px_rgba(26,22,19,0.16)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">Invitación</p>
            <h2 id="invite-title" className="mt-3 font-serif text-3xl">
              Crear enlace
            </h2>
            <p className="mt-3 text-sm text-ash">
              El enlace dura 21 días y sirve una sola vez. Cuando lo generes, cópialo y envíaselo por WhatsApp o correo.
            </p>
            {invite ? (
              <div className="mt-5">
                <p className="break-all text-sm">{invite}</p>
                <div className="mt-4">
                  <CopyInvite url={invite} />
                </div>
              </div>
            ) : (
              <form action="/api/admin/invite" method="post" className="mt-6">
                <input type="hidden" name="id" value={clientId} />
                <button className="btn-atelier" type="submit">
                  Generar enlace
                </button>
              </form>
            )}
            <button
              type="button"
              className="mt-6 text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
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
