import { LegalDoc } from "@/app/components/LegalDoc";
import { site } from "@/lib/site";
import { getLocale, getMessages, pageMeta } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return pageMeta({
    path: "/privacidad",
    title: t.legal.privacyTitle,
    description: t.legal.privacyDescription,
  });
}

export default async function PrivacidadPage() {
  const t = getMessages(await getLocale());
  return (
    <LegalDoc
      kicker={t.legal.kicker}
      title={t.legal.privacyTitle}
      updated="23 de septiembre de 2026"
    >
      <section>
        <h2>1. Responsable</h2>
        <p>
          {site.legalPerson}, NIF {site.nif}. {site.legalName}.{" "}
          {site.streetAddress},{" "}
          {site.postalCode} {site.city}, {site.region}, España.{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a> ·{" "}
          <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>.
        </p>
      </section>
      <section>
        <h2>2. Datos que recabo y para qué</h2>
        <p>
          Si escribes el formulario, usas WhatsApp o reservas cita, trato el
          nombre, correo, teléfono, fecha del evento, tipo de servicio y el
          mensaje que me dejes, para responderte, valorar el encargo y, si
          hay acuerdo, prestar el servicio. No elaboro perfiles comerciales
          ni te mando boletines salvo que lo pidas de forma expresa.
        </p>
      </section>
      <section>
        <h2>3. Base jurídica</h2>
        <p>
          El tratamiento se basa en tu solicitud previa a un contrato o en
          medidas precontractuales (art. 6.1.b del RGPD), en el interés
          legítimo de atender la consulta y, cuando proceda, en tu
          consentimiento. Puedes retirar el consentimiento cuando el
          tratamiento se fundamente en él, sin que ello afecte a lo ya
          realizado.
        </p>
      </section>
      <section>
        <h2>4. Destinatarios</h2>
        <p>
          No vendo tus datos. Pueden acceder a ellos, solo para prestar su
          servicio: el proveedor de correo del formulario (FormSubmit), el
          calendario de citas (Calendly) y, si eliges WhatsApp, Meta Platforms
          Ireland según las condiciones de WhatsApp. Estos encargados o
          destinos pueden estar fuera del Espacio Económico Europeo; en ese
          caso se aplican las salvaguardas que ofrezca cada proveedor
          (cláusulas tipo, etc.).
        </p>
      </section>
      <section>
        <h2>5. Conservación</h2>
        <p>
          Conservo las consultas el tiempo necesario para resolverlas y, si
          hay encargo, el exigido por obligaciones contables, fiscales o de
          reclamaciones. Después se suprimen o anonimizan.
        </p>
      </section>
      <section>
        <h2>6. Tus derechos</h2>
        <p>
          Puedes solicitar acceso, rectificación, supresión, limitación,
          portabilidad y oposición, y reclamar ante la Agencia Española de
          Protección de Datos (aepd.es). Escríbeme a {site.email} e
          indícame el derecho que quieres ejercer. Si los datos son
          inexactos o han cambiado, te pido que me lo comuniques.
        </p>
      </section>
      <section>
        <h2>7. Menores</h2>
        <p>
          El Sitio no está dirigido a menores de 14 años. Si detecto que se
          han enviado datos de un menor sin autorización, los borraré.
        </p>
      </section>
    </LegalDoc>
  );
}
