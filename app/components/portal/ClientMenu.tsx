"use client";

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const full = digits.startsWith("34") || digits.length > 9 ? digits : `34${digits}`;
  return `https://wa.me/${full}`;
}

export function ClientMenu({ id, name, phone }: { id: string; name: string; phone: string }) {
  const whatsapp = whatsappHref(phone);

  return (
    <details className="relative">
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
      <div className="absolute right-0 top-12 z-20 w-64 border border-ink/15 bg-porcelain py-1 shadow-sm">
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
        <form
          action="/api/admin/clients"
          method="post"
          className="border-t border-ink/10"
          onSubmit={(event) => {
            const sure = confirm(
              `¿Eliminar a ${name}? Se borra su ficha, los archivos y los avisos. No se puede deshacer.`,
            );
            if (!sure) event.preventDefault();
          }}
        >
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="block w-full px-4 py-3 text-left text-[0.72rem] uppercase tracking-[0.14em] hover:bg-ink/5"
          >
            Eliminar clienta
          </button>
        </form>
      </div>
    </details>
  );
}
