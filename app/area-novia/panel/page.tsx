import { AgendaView } from "@/app/components/portal/AgendaBlock";
import { CompanionsForm } from "@/app/components/portal/CompanionsForm";
import { EventForm } from "@/app/components/portal/EventForm";
import { PaymentsView } from "@/app/components/portal/PaymentsBlock";
import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { PortalTabs } from "@/app/components/portal/PortalTabs";
import { WorkView } from "@/app/components/portal/WorkBlock";
import { INSPIRATION_MAX } from "@/lib/portal/files";
import { requireClient } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";
import {
  CONTRACTOR_TRIAL_PHOTOS,
  filesFor,
  personTrialPhotoKey,
  portalTab,
} from "@/lib/portal/types";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tu área de clientes",
  robots: { index: false, follow: false },
};

const okText: Record<string, string> = {
  evento: "He guardado la ficha.",
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
  searchParams: Promise<{ ok?: string; error?: string; tab?: string }>;
}) {
  const session = await requireClient();
  if (!session) redirect("/area-novia");
  const client = await getClient(session.sub);
  if (!client) redirect("/area-novia");
  const { ok, error, tab: tabRaw } = await searchParams;
  const tab = portalTab(tabRaw);

  return (
    <PortalFrame
      kicker="Área clientes"
      title={`Hola, ${client.event.clientName || client.name}.`}
      lead="Tu ficha, la de tus acompañantes, los pagos, los papeles y la agenda de citas."
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
      <PortalTabs basePath="/area-novia/panel" active={tab} />

      {tab === "contratante" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Tus datos</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            Cuanto más concreto, más fácil organizo horarios y equipo.
          </p>
          <div className="mt-8">
            <EventForm
              event={client.event}
              clientId={client.id}
              inspiration={client.inspiration}
              action="/api/portal/event"
              submitLabel="Guardar ficha"
            />
          </div>
          <div className="mt-14 border-t border-ink/10 pt-10">
            <h3 className="font-serif text-3xl">Prueba</h3>
            <p className="mt-3 max-w-2xl text-sm text-ash">
              Aquí verás las fotos que haga el día de la prueba y los productos que hayamos usado.
            </p>
            <div className="mt-8">
              <WorkView
                products={client.event.productsUsed}
                photos={filesFor(client.workPhotos, CONTRACTOR_TRIAL_PHOTOS)}
                clientId={client.id}
              />
            </div>
          </div>
        </section>
      ) : null}

      {tab === "acompanantes" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Acompañantes</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            El número de personas abre una ficha por cada una. Alergias y notas van siempre; las
            notas de la prueba, sólo si la marcan.
          </p>
          <div className="mt-8">
            <CompanionsForm
              event={client.event}
              clientId={client.id}
              inspiration={client.inspiration}
              action="/api/portal/companions"
            />
          </div>
          {client.event.people.some((person) => person.wantsTrial) ? (
            <div className="mt-14 flex flex-col gap-10 border-t border-ink/10 pt-10">
              <h3 className="font-serif text-3xl">Pruebas de acompañantes</h3>
              {client.event.people.map((person, i) =>
                person.wantsTrial ? (
                  <WorkView
                    key={i}
                    title={person.who || `Persona ${i + 1}`}
                    products={person.productsUsed}
                    photos={filesFor(client.workPhotos, personTrialPhotoKey(i))}
                    clientId={client.id}
                  />
                ) : null,
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "facturacion" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Facturación y pagos</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            Reserva, prueba y día del evento. Yo anoto los importes y si están abonados; aquí ves
            lo pendiente.
          </p>
          <div className="mt-8">
            <PaymentsView payments={client.payments} people={client.event.people} />
          </div>
        </section>
      ) : null}

      {tab === "documentacion" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Presupuestos, contratos y papeles</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            Aquí cuelgo presupuestos, contratos y el resto de documentación.
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
            <p className="mt-6 text-sm text-ash">
              Aún no hay documentos. Cuando haya presupuesto o contrato, aparecerá aquí.
            </p>
          )}
        </section>
      ) : null}

      {tab === "agenda" ? (
        <section className="pt-10">
          <h2 className="font-serif text-3xl">Agenda</h2>
          <p className="mt-3 max-w-2xl text-sm text-ash">
            Las citas que tenemos planificadas: prueba, evento y lo que vayamos sumando.
          </p>
          <div className="mt-8">
            <AgendaView appointments={client.appointments} />
          </div>
        </section>
      ) : null}
    </PortalFrame>
  );
}
