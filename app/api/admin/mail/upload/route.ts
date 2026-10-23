import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/portal/session";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const json = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const admin = await requireAdmin();
        if (!admin) throw new Error("UNAUTHORIZED");
        if (!pathname.startsWith("mail/outbox/") || pathname.includes("..") || pathname.length > 300) {
          throw new Error("BAD_FILE");
        }
        return {
          maximumSizeInBytes: 20_000_000,
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "UNAUTHORIZED") return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    return NextResponse.json({ error: "No se ha podido subir el archivo." }, { status: 400 });
  }
}
