import { site } from "@/lib/site";
import { portalEs } from "@/lib/i18n/portal-messages";
import { brandedClientEmail } from "./mail-html";
import { notifyEmail } from "./notify";

export function mailPlannerAccess(input: { to: string; plannerName: string; clientName: string; link: string }) {
  const t = portalEs;
  const mail = brandedClientEmail({
    lang: "es",
    blocks: [
      { text: `¡Hola, ${input.plannerName}!` },
      {
        text: `Te dejo un acceso de solo consulta al servicio de ${input.clientName}. Desde ahí puedes ver el planning y descargar el planning, los presupuestos y los contratos.`,
      },
      { text: "Es un acceso de consulta: no se puede modificar nada." },
      { href: input.link, label: "Ver el servicio" },
    ],
    signoff: [t.recoverMailSignoff],
  });
  return notifyEmail(
    input.to,
    `Acceso de consulta al servicio de ${input.clientName}`,
    mail.text,
    mail.html,
  );
}

export function plannerAccessUrl(token: string) {
  return `${site.url}/api/wp/enter?token=${encodeURIComponent(token)}`;
}
