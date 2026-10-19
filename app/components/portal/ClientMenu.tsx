"use client";

import { useEffect } from "react";

let dismissBound = 0;

function closeMenusOutside(target: EventTarget | null) {
  document.querySelectorAll<HTMLDetailsElement>("details[data-client-menu][open]").forEach((menu) => {
    if (!(target instanceof Node) || !menu.contains(target)) menu.open = false;
  });
}

function onDocPointer(event: PointerEvent) {
  closeMenusOutside(event.target);
}

function onDocKey(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  document.querySelectorAll<HTMLDetailsElement>("details[data-client-menu][open]").forEach((menu) => {
    menu.open = false;
  });
}

function useDismissClientMenus() {
  useEffect(() => {
    if (dismissBound === 0) {
      document.addEventListener("pointerdown", onDocPointer);
      document.addEventListener("keydown", onDocKey);
    }
    dismissBound += 1;
    return () => {
      dismissBound -= 1;
      if (dismissBound === 0) {
        document.removeEventListener("pointerdown", onDocPointer);
        document.removeEventListener("keydown", onDocKey);
      }
    };
  }, []);
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const full = digits.startsWith("34") || digits.length > 9 ? digits : `34${digits}`;
  return `https://wa.me/${full}`;
}

function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const full = digits.startsWith("34") || digits.length > 9 ? digits : `34${digits}`;
  return `tel:+${full}`;
}

export function ClientMenu({
  id,
  name,
  phone,
  email,
  pending = false,
  planners = [],
}: {
  id: string;
  name: string;
  phone: string;
  email: string;
  pending?: boolean;
  planners?: { id: string; name: string; email: string }[];
}) {
  const whatsapp = whatsappHref(phone);
  const call = telHref(phone);
  const dialogId = `eliminar-${id}`;
  const plannerDialogId = `wp-${id}`;
  useDismissClientMenus();

  return (
    <>
      <details
        data-client-menu=""
        className="relative"
        onToggle={(event) => {
          const current = event.currentTarget;
          if (!current.open) return;
          document.querySelectorAll<HTMLDetailsElement>("details[data-client-menu]").forEach((menu) => {
            if (menu !== current) menu.open = false;
          });
        }}
      >
        <summary
          className="inline-flex size-11 cursor-pointer list-none items-center justify-center border border-ink/15 text-ink hover:border-ink [&::-webkit-details-marker]:hidden"
          aria-label={`Opciones de ${name}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="3" r="1.3" fill="currentColor" />
            <circle cx="8" cy="8" r="1.3" fill="currentColor" />
            <circle cx="8" cy="13" r="1.3" fill="currentColor" />
          </svg>
        </summary>
        <div className="absolute right-0 top-12 z-30 w-64 max-w-[calc(100vw-2rem)] border border-ink/15 bg-porcelain py-1 shadow-sm">
          {call ? (
            <a className="block px-4 py-3 text-[0.72rem] uppercase tracking-[0.14em] hover:bg-ink/5" href={call}>
              Llamar
            </a>
          ) : null}
          {email ? (
            <a className="block px-4 py-3 text-[0.72rem] uppercase tracking-[0.14em] hover:bg-ink/5" href={`mailto:${email}`}>
              Enviar mail
            </a>
          ) : null}
          {pending ? (
            <form action="/api/admin/reminders" method="post">
              <input type="hidden" name="intent" value="activation" />
              <input type="hidden" name="clientId" value={id} />
              <button
                type="submit"
                className="block w-full px-4 py-3 text-left text-[0.72rem] uppercase tracking-[0.14em] hover:bg-ink/5"
              >
                Enviar recordatorio de activación
              </button>
            </form>
          ) : null}
          <form action="/api/admin/invite" method="post">
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="block w-full px-4 py-3 text-left text-[0.72rem] uppercase tracking-[0.14em] hover:bg-ink/5"
            >
              Nuevo enlace de acceso
            </button>
          </form>
          {whatsapp ? (
            <a
              className="block px-4 py-3 text-[0.72rem] uppercase tracking-[0.14em] hover:bg-ink/5"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              Escribir por WhatsApp
            </a>
          ) : null}
          <button
            type="button"
            className="block w-full border-t border-ink/10 px-4 py-3 text-left text-[0.72rem] uppercase tracking-[0.14em] hover:bg-ink/5"
            popoverTarget={plannerDialogId}
            onClick={(event) => {
              const menu = event.currentTarget.closest("details");
              if (menu) menu.open = false;
            }}
          >
            Crear acceso a WP
          </button>
          <button
            type="button"
            className="block w-full px-4 py-3 text-left text-[0.72rem] uppercase tracking-[0.14em] hover:bg-ink/5"
            popoverTarget={dialogId}
            onClick={(event) => {
              const menu = event.currentTarget.closest("details");
              if (menu) menu.open = false;
            }}
          >
            Eliminar clienta
          </button>
        </div>
      </details>
      <div
        id={plannerDialogId}
        popover="auto"
        role="dialog"
        aria-labelledby={`${plannerDialogId}-title`}
        className="inset-0 m-auto h-fit max-h-[92dvh] w-[min(32rem,calc(100%-1.5rem))] overflow-y-auto border border-ink/10 bg-porcelain px-5 py-8 text-ink backdrop:bg-ink/35 sm:px-8 sm:py-10"
      >
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">Wedding planner</p>
        <h2 id={`${plannerDialogId}-title`} className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          Acceso de consulta
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-ash">
          Recibirá un enlace al panel de {name}, igual que lo ve ella. Solo puede añadir acompañantes.
        </p>
        <form action="/api/admin/planners" method="post" className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="intent" value="create" />
          <input type="hidden" name="clientId" value={id} />
          <label className="field-label">
            Nombre
            <input className="field" name="name" required />
          </label>
          <label className="field-label">
            Correo
            <input className="field" name="email" type="email" required />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-atelier" popoverTarget={plannerDialogId} popoverTargetAction="hide">
              Cancelar
            </button>
            <button type="submit" className="btn-atelier btn-atelier-solid">
              Enviar acceso
            </button>
          </div>
        </form>
        {planners.length ? (
          <ul className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
            {planners.map((planner) => (
              <li key={planner.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p>{planner.name}</p>
                  <p className="text-sm text-ash">{planner.email}</p>
                </div>
                <form action="/api/admin/planners" method="post">
                  <input type="hidden" name="intent" value="revoke" />
                  <input type="hidden" name="clientId" value={id} />
                  <input type="hidden" name="plannerId" value={planner.id} />
                  <button type="submit" className="text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink">
                    Quitar acceso
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div
        id={dialogId}
        popover="auto"
        role="dialog"
        aria-labelledby={`${dialogId}-title`}
        className="inset-0 m-auto h-fit w-[min(28rem,calc(100%-1.5rem))] border border-ink/10 bg-porcelain px-5 py-8 text-ink backdrop:bg-ink/35 sm:px-8 sm:py-10"
      >
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">Clientas</p>
        <h2 id={`${dialogId}-title`} className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          Eliminar a {name}
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-ash">
          Se borra su ficha, los archivos y los avisos. No se puede deshacer.
        </p>
        <form action="/api/admin/clients" method="post" className="mt-8 flex flex-wrap gap-3">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="id" value={id} />
          <button type="button" className="btn-atelier" popoverTarget={dialogId} popoverTargetAction="hide">
            Cancelar
          </button>
          <button type="submit" className="btn-atelier btn-atelier-solid">
            Eliminar
          </button>
        </form>
      </div>
    </>
  );
}
