import { LegalDoc } from "@/app/components/LegalDoc";
import { site } from "@/lib/site";
import { getLocale, getMessages, pageMeta } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return pageMeta({
    path: "/aviso-legal",
    title: t.legal.noticeTitle,
    description: t.legal.noticeDescription,
  });
}

export default async function AvisoLegalPage() {
  const t = getMessages(await getLocale());
  return (
    <LegalDoc
      kicker={t.legal.kicker}
      title={t.legal.noticeTitle}
      updated="23 de septiembre de 2026"
    >
      <section>
        <h2>1. Titular</h2>
        <p>
          El sitio web {site.url.replace("https://", "")} (el «Sitio») es
          titularidad de {site.legalPerson}, NIF {site.nif}, que opera bajo el
          nombre comercial {site.legalName} (el «Titular»). Estudio en{" "}
          {site.streetAddress}, {site.postalCode} {site.city}, {site.region},{" "}
          {site.autonomousCommunity}, España. Correo:{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. Teléfono:{" "}
          <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>.
        </p>
      </section>
      <section>
        <h2>2. Objeto</h2>
        <p>
          El Sitio informa sobre los servicios de estilismo, maquillaje,
          peinado, estética, formación y cuidado de la piel que ofrece el
          Titular, y permite solicitar consulta, cita o reserva. El acceso es
          gratuito. La contratación del servicio se concreta fuera del Sitio
          (consulta, WhatsApp, teléfono o calendario), con las condiciones que
          se acuerden en cada encargo.
        </p>
      </section>
      <section>
        <h2>3. Condiciones de uso</h2>
        <p>
          El uso del Sitio implica la aceptación de este aviso y de la{" "}
          <a href="/privacidad">política de privacidad</a> y la{" "}
          <a href="/cookies">política de cookies</a>. Te comprometes a no
          utilizar el Sitio de forma ilícita, a no introducir contenidos
          maliciosos y a no atentar contra la imagen, los derechos o los
          sistemas del Titular o de terceras personas.
        </p>
      </section>
      <section>
        <h2>4. Propiedad intelectual</h2>
        <p>
          Los textos, fotografías, logotipo, diseño y resto de contenidos del
          Sitio son titularidad de {site.legalPerson} o se utilizan con autorización.
          Queda prohibida su reproducción, distribución o comunicación pública
          sin consentimiento previo, salvo el derecho de cita o usos amparados
          por la ley. Las imágenes de trabajos reales se muestran con el
          consentimiento de las personas retratadas para este Sitio.
        </p>
      </section>
      <section>
        <h2>5. Responsabilidad</h2>
        <p>
          El Titular procura que la información sea veraz y esté actualizada,
          sin garantizar la ausencia absoluta de errores u omisiones. El Sitio
          puede incluir enlaces a WhatsApp, Calendly, FormSubmit u otros
          servicios de terceros, ajenos a su control. No se responde de
          indisponibilidades, virus o daños derivados del uso de la red o de
          esos terceros, más allá de lo que imponga la normativa aplicable.
        </p>
      </section>
      <section>
        <h2>6. Legislación y fuero</h2>
        <p>
          Este aviso se rige por la legislación española. Para cualquier
          controversia, las partes se someten a los juzgados y tribunales de
          Castellón, salvo que la normativa de consumidores imponga otro fuero
          imperativo.
        </p>
      </section>
    </LegalDoc>
  );
}
