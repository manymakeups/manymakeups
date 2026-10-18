"use client";

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
}: {
  id: string;
  name: string;
  phone: string;
  email: string;
  pending?: boolean;
}) {
  const whatsapp = whatsappHref(phone);
  const call = telHref(phone);
  const dialogId = `eliminar-${id}`;

  return (
    <>
      <details className="relative z-20">
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
        <div className="absolute right-0 top-12 z-20 w-64 max-w-[calc(100vw-2rem)] border border-ink/15 bg-porcelain py-1 shadow-sm">
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
