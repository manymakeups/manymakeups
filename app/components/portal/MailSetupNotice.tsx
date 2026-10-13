import { PortalNotice } from "@/app/components/portal/PortalFrame";
import { clientMailReady } from "@/lib/portal/notify";

export function MailSetupNotice() {
  if (clientMailReady()) return null;
  return (
    <PortalNotice>
      Los correos a las clientas aún no salen. El formulario de la web solo entrega a
      info@manymakeups.com. Para escribirles a ellas, en Vercel hay que añadir la variable
      RESEND_API_KEY (cuenta gratis en resend.com) y verificar el dominio manymakeups.com.
    </PortalNotice>
  );
}
