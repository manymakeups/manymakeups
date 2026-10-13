import { go } from "@/lib/portal/http";
import { clearSessionCookie } from "@/lib/portal/session";

export async function POST(request: Request) {
  await clearSessionCookie();
  const next = new URL(request.url).searchParams.get("next") ?? "/area-novia";
  return go(request, next.startsWith("/") ? next : "/area-novia");
}
