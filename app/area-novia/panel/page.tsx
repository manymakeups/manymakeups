import { EventForm } from "@/app/components/portal/EventForm";
import { DeleteFileButton } from "@/app/components/portal/FileActions";
import { PaymentsView } from "@/app/components/portal/PaymentsBlock";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { INSPIRATION_MAX, isImageType } from "@/lib/portal/files";
import { requireClient } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tu área de clientes",
  robots: { index: false, follow: false },
};

const okText: Record<string, string> = {
  evento: "He guardado la ficha del evento.",
  fotos: "Las fotos ya están en tu espacio.",
};

const errorText: Record<string, string> = {
  limite: `Puedes colgar hasta ${INSPIRATION_MAX} fotos de inspiración.`,
  archivo: "Ese archivo no sirve (usa JPG, PNG o WebP, máximo 8 MB).",
};

function fileHref(clientId: string, id: string, download = false) {
  const extra = download ? "&download=1" : "";
  return `/api/portal/file?client=${clientId}&id=${id}${extra}`;
}

export default async function BridePanelPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const session = await requireClient();
  if (!session) redirect("/area-novia");
  const client = await getClient(session.sub);
  if (!client) redirect("/area-novia");
  const { ok, error } = await searchParams;

  return (
    <PortalFrame
      kicker="Área clientes"
      title={`Hola, ${client.event.clientName || client.name}.`}
      lead="Aquí va todo lo de tu fecha: cómo queréis el día, las imágenes que os inspiran, y los presupuestos o el contrato cuando los cuelgue."
      aside={
        <form action="/api/portal/logout" method="post">
          <button className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink" type="submit">
            Salir
          </button>
        </form>
      }
    >
      {ok && okText[ok] ? <PortalNotice>{okText[ok]}</PortalNotice> : null}
      {error && errorText[error] ? <PortalNotice>{errorText[error]}</PortalNotice> : null}

      <section className="border-t border-ink/10 pt-10">
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">I · El evento</p>
        <h2 className="mt-3 font-serif text-3xl">Datos de vuestra fecha</h2>
        <p className="mt-3 max-w-2xl text-sm text-ash">
          Cuanto más concreto, más fácil organizo horarios y equipo. Puedes ir actualizándolo.
        </p>
        <div className="mt-8">
          <EventForm event={client.event} action="/api/portal/event" submitLabel="Guardar ficha" />
        </div>
      </section>

      <section className="mt-16 border-t border-ink/10 pt-10">
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">II · Pagos</p>
        <h2 className="mt-3 font-serif text-3xl">Estado de los pagos</h2>
        <p className="mt-3 max-w-2xl text-sm text-ash">
          Yo anoto los importes y si están abonados. Aquí ves lo pendiente del día de la prueba y
          del día del evento.
        </p>
        <div className="mt-8">
          <PaymentsView payments={client.payments} />
        </div>
      </section>

      <section className="mt-16 border-t border-ink/10 pt-10">
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">III · Inspiración</p>
        <h2 className="mt-3 font-serif text-3xl">Fotos que te gustan</h2>
        <p className="mt-3 max-w-2xl text-sm text-ash">
          Looks, peinados, bocetos, capturas. No hace falta que sean perfectas: me sirven para
          entender el gesto.
        </p>
        <form
          action="/api/portal/inspiration"
          method="post"
          encType="multipart/form-data"
          className="mt-8 flex flex-col gap-4"
        >
          <label className="field-label">
            Añadir fotos
            <input className="field" name="files" type="file" accept="image/*" multiple required />
          </label>
          <button className="btn-atelier-solid btn-atelier self-start" type="submit">
            Subir
          </button>
        </form>
        {client.inspiration.length ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {client.inspiration.map((file) => (
              <li key={file.id} className="border border-ink/10 bg-linen/40 p-3">
                {isImageType(file.mime) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fileHref(client.id, file.id)}
                    alt=""
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : null}
                <p className="mt-2 truncate text-sm">{file.name}</p>
                <DeleteFileButton id={file.id} kind="inspiration" label="Quitar" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-ash">Todavía no hay fotos.</p>
        )}
      </section>

      <section className="mt-16 border-t border-ink/10 pt-10">
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-gilt">IV · Documentación</p>
        <h2 className="mt-3 font-serif text-3xl">Presupuestos, contratos y papeles</h2>
        <p className="mt-3 max-w-2xl text-sm text-ash">
          Aquí cuelgo presupuestos, contratos y el resto de documentación. Los tienes siempre a
          mano, también desde el móvil.
        </p>
        {client.documents.length ? (
          <ul className="mt-8 divide-y divide-ink/10 border border-ink/10">
            {client.documents.map((file) => (
              <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{file.label}</p>
                  <p className="mt-1">{file.name}</p>
                </div>
                <a className="btn-atelier" href={fileHref(client.id, file.id, true)}>
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-ash">Aún no hay documentos. Cuando haya presupuesto o contrato, aparecerá aquí.</p>
        )}
      </section>
    </PortalFrame>
  );
}
