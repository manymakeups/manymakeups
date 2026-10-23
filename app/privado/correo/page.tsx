import { MailDesk } from "@/app/components/portal/MailDesk";
import { PortalFrame } from "@/app/components/portal/PortalFrame";
import { StudioAside } from "@/app/components/portal/StudioAside";
import { requireAdmin } from "@/lib/portal/session";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Correo",
  robots: { index: false, follow: false },
};

export default async function StudioMailPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/privado");

  return (
    <PortalFrame
      pinned
      kicker="Estudio"
      title="Correo"
      lead="Las cinco cuentas del atelier, en una sola bandeja. El correo que ya está en Zoho se queda allí. El nuevo entrará aquí cuando activemos la recepción."
      studio
      aside={<StudioAside />}
    >
      <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
        <MailDesk />
      </div>
    </PortalFrame>
  );
}
