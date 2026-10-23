import { NextResponse } from "next/server";
import { inboundAuthorized, publicMailError, storeInboundChunk, storeIncoming } from "@/lib/portal/mail-store";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 4_200_000;

/** Cloudflare Email Routing entrega aquí el correo de las cinco cuentas. */
export async function POST(req: Request) {
  const secret = (process.env.EMAIL_INBOUND_SECRET || "").trim();
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  if (!inboundAuthorized(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (req.headers.get("x-truncated") === "1") {
    return NextResponse.json({ error: "Too large" }, { status: 413 });
  }

  const raw = Buffer.from(await req.arrayBuffer());
  if (!raw.length) return NextResponse.json({ error: "Empty" }, { status: 400 });

  const uploadId = req.headers.get("x-upload-id") || "";
  try {
    if (uploadId) {
      await storeInboundChunk({
        uploadId,
        seq: Number(req.headers.get("x-upload-seq") || "0"),
        parts: Number(req.headers.get("x-upload-parts") || "0"),
        totalBytes: Number(req.headers.get("x-upload-bytes") || "0"),
        envelopeTo: req.headers.get("x-envelope-to") || "",
        bytes: raw,
      });
      return NextResponse.json({ ok: true });
    }
    if (raw.length > MAX_BYTES) return NextResponse.json({ error: "Too large" }, { status: 413 });
    await storeIncoming(raw, req.headers.get("x-envelope-to") || "");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const pub = publicMailError(err);
    if (pub.status === 200) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: pub.error || "Store failed" }, { status: pub.status });
  }
}
