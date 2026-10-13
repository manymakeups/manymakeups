import { go, goPortal } from "@/lib/portal/http";
import { clearSessionCookie } from "@/lib/portal/session";

export async function POST(request: Request) {
  await clearSessionCookie();
  const next = new URL(request.url).searchParams.get("next") ?? "/area-novia";
  if (next.startsWith("/privado")) return go(request, next);
  if (next.startsWith("/")) return goPortal(request, next);
  return goPortal(request, "/area-novia");
}
