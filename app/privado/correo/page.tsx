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
      dense
      wide
      kicker="Estudio"
      title="Correo"
      studio
      aside={<StudioAside />}
    >
      <div data-portal-scroll className="flex min-h-0 flex-1 flex-col pb-4 pt-3">
        <MailDesk />
      </div>
    </PortalFrame>
  );
}
