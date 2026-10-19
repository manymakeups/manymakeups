import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "auth" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: unknown; optOut?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const client = id ? await getClient(id) : null;
  if (!client?.passwordHash) return NextResponse.json({ error: "missing" }, { status: 404 });
  client.commercialOptOut = Boolean(body?.optOut);
  await saveClient(client);
  return NextResponse.json({ ok: true, optOut: Boolean(client.commercialOptOut) });
}
