import { site } from "@/lib/site";
import { portalEs } from "@/lib/i18n/portal-messages";
import { brandedClientEmail } from "./mail-html";
import { notifyEmail } from "./notify";

export function mailPlannerAccess(input: { to: string; clientName: string; link: string }) {
  const name = input.clientName;
  const mail = brandedClientEmail({
    lang: "es",
    blocks: [
      { text: "¡Hola!" },
      {
        text: `Te comparto este enlace directo al panel del servicio de ${name}. Desde aquí podrás consultar todo lo relativo a su servicio (planning, presupuestos y contratos).`,
      },
      {
        text: "(Se trata de un acceso de solo lectura, por lo que los datos están protegidos y no se pueden editar).",
      },
      { href: input.link, label: `Ver servicio de ${name}` },
      { text: "Quedo a tu disposición si necesitas cualquier ajuste o aclaración." },
    ],
    signoff: [portalEs.recoverMailSignoff],
  });
  return notifyEmail(input.to, `Acceso al evento de ${name}`, mail.text, mail.html);
}

export function plannerAccessUrl(token: string) {
  return `${site.url}/api/wp/enter?token=${encodeURIComponent(token)}`;
}
