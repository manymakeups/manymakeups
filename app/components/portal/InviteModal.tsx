"use client";

import { CopyInvite } from "@/app/components/portal/FileActions";
import { useState } from "react";

export function InviteModal({
  clientId,
  invite,
  sent,
}: {
  clientId: string;
  invite?: string;
  sent?: "ok" | "fail";
}) {
  const [open, setOpen] = useState(Boolean(invite));
  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 items-center text-[0.68rem] uppercase tracking-[0.14em] text-ash hover:text-ink sm:min-h-0 sm:tracking-[0.18em]"
        onClick={() => setOpen(true)}
      >
        Crear invitación
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/40 p-3 sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto bg-porcelain p-5 shadow-[0_20px_60px_rgba(26,22,19,0.16)] sm:p-6"
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
              El enlace dura 21 días y sirve una sola vez. Cuando lo generes, cópialo o envíaselo ahora por correo.
            </p>
            {invite ? (
              <div className="mt-5">
                <p className="break-all text-sm">{invite}</p>
                {sent === "ok" ? <p className="mt-3 text-sm">Enviado a su correo.</p> : null}
                {sent === "fail" ? (
                  <p className="mt-3 text-sm text-ash">No he podido enviarlo. Copia el enlace y mándaselo tú.</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <CopyInvite url={invite} />
                  <form action="/api/admin/invite" method="post">
                    <input type="hidden" name="id" value={clientId} />
                    <input type="hidden" name="intent" value="send" />
                    <button className="btn-atelier btn-atelier-solid" type="submit">
                      Enviar a la clienta
                    </button>
                  </form>
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
