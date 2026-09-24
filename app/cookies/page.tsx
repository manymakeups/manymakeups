import { LegalDoc } from "@/app/components/LegalDoc";
import { site } from "@/lib/site";
import { getLocale, getMessages, pageMeta } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = getMessages(await getLocale());
  return pageMeta({
    path: "/cookies",
    title: t.legal.cookiesTitle,
    description: t.legal.cookiesDescription,
  });
}

export default async function CookiesPage() {
  const t = getMessages(await getLocale());
  return (
    <LegalDoc
      kicker={t.legal.kicker}
      title={t.legal.cookiesTitle}
      updated="24 de septiembre de 2026"
    >
      <section>
        <h2>1. Qué uso</h2>
        <p>
          Este Sitio no instala cookies de publicidad. Las visitas se
          miden con Vercel Web Analytics, un recuento agregado que no usa
          cookies de seguimiento ni te identifica. También hay cookies
          técnicas de idioma para mostrar el Sitio en español, inglés o
          francés.
        </p>
      </section>
      <section>
        <h2>2. Terceros</h2>
        <p>
          Si abres el calendario de cita telefónica, Calendly puede fijar
          cookies propias en su iframe, según su política. Si envías el
          formulario, la petición viaja a FormSubmit. Si eliges WhatsApp,
          sales a un servicio de Meta. El alojamiento y la analítica de
          visitas los presta Vercel. Esos tratamientos se rigen por las
          condiciones de cada proveedor. No controlo las cookies que ellos
          puedan colocar una vez cargas o abandonas el Sitio hacia sus
          dominios.
        </p>
      </section>
      <section>
        <h2>3. Cómo gestionarlas</h2>
        <p>
          Puedes borrar las cookies desde la configuración de tu
          navegador. Bloquear cookies de terceros puede impedir que el
          calendario de Calendly funcione con normalidad. Un bloqueador de
          anuncios también puede impedir que se cuenten las visitas.
        </p>
      </section>
      <section>
        <h2>4. Más información</h2>
        <p>
          Sobre el resto del tratamiento de datos, consulta la{" "}
          <a href="/privacidad">política de privacidad</a>. Para cualquier
          duda: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </section>
    </LegalDoc>
  );
}
