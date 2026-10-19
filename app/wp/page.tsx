import { PortalFrame, PortalNotice } from "@/app/components/portal/PortalFrame";
import { requirePlanner } from "@/lib/portal/session";
import { getClient } from "@/lib/portal/store";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consulta del servicio",
  robots: { index: false, follow: false },
};

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await requirePlanner();
  const client = session ? await getClient(session.clientId) : null;
  const planner = client?.planners.find((item) => item.id === session?.sub);
  if (session && client && planner) redirect("/area-novia/panel");
  if (session && (!client || !planner)) redirect("/wp?error=enlace");

  return (
    <PortalFrame
      kicker="Consulta"
      title={error === "enlace" ? "Enlace no válido" : "Acceso de consulta"}
      lead={error === "enlace" ? "Pide a Many Makeups un acceso nuevo." : "Abre el enlace que te he enviado por correo."}
    >
      <PortalNotice>
        {error === "enlace"
          ? "Este enlace ya no sirve. Si te corresponde ver el servicio, escríbeme y te mando otro."
          : "Este acceso es personal y solo sirve para consultar el servicio. Entra desde el correo."}
      </PortalNotice>
    </PortalFrame>
  );
}
