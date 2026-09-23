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
      updated="23 de septiembre de 2026"
    >
      <section>
        <h2>1. Qué uso</h2>
        <p>
          Este Sitio no instala cookies de publicidad ni de analítica
          propia. Sí utiliza almacenamiento técnico en tu navegador
          (localStorage) para recordar que ya has visto la intro de
          bienvenida, y así no repetirla en cada visita. Ese dato no te
          identifica y no se envía a un servidor de {site.name} para
          perfilarte.
        </p>
      </section>
      <section>
        <h2>2. Terceros</h2>
        <p>
          Si abres el calendario de cita telefónica, Calendly puede fijar
          cookies propias en su iframe, según su política. Si envías el
          formulario, la petición viaja a FormSubmit. Si eliges WhatsApp,
          sales a un servicio de Meta. Esos tratamientos se rigen por las
          condiciones de cada proveedor. No controlo las cookies que ellos
          puedan colocar una vez cargas o abandonas el Sitio hacia sus
          dominios.
        </p>
      </section>
      <section>
        <h2>3. Cómo gestionarlas</h2>
        <p>
          Puedes borrar el almacenamiento local y las cookies desde la
          configuración de tu navegador. Si eliminas la clave de la intro,
          volverás a ver la animación de entrada. Bloquear cookies de
          terceros puede impedir que el calendario de Calendly funcione con
          normalidad.
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
