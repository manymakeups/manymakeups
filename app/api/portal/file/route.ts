import { NextResponse } from "next/server";
import { getSession } from "@/lib/portal/session";
import { getClient, readPortalFile } from "@/lib/portal/store";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client") ?? "";
  const fileId = url.searchParams.get("id") ?? "";
  if (session.role === "client" && session.sub !== clientId) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (session.role === "planner" && session.clientId !== clientId) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (session.role !== "admin" && session.role !== "client" && session.role !== "planner") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const client = await getClient(clientId);
  if (!client) return new NextResponse("Not found", { status: 404 });
  if (session.role === "planner" && !client.planners.some((item) => item.id === session.sub)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const file =
    client.inspiration.find((item) => item.id === fileId) ??
    client.documents.find((item) => item.id === fileId) ??
    client.workPhotos.find((item) => item.id === fileId);
  if (!file) return new NextResponse("Not found", { status: 404 });
  const payload = await readPortalFile(file);
  if (!payload) return new NextResponse("Not found", { status: 404 });
  const disposition = url.searchParams.get("download")
    ? `attachment; filename="${file.name}"`
    : `inline; filename="${file.name}"`;
  return new NextResponse(new Uint8Array(payload.buffer), {
    headers: {
      "Content-Type": payload.mime,
      "Content-Disposition": disposition,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
