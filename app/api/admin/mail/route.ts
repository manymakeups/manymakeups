import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/portal/session";
import {
  deleteMessages,
  listMailbox,
  publicMailError,
  readAttachment,
  readMessage,
  sendMail,
} from "@/lib/portal/mail-store";
import { mailboxByKey, type MailFolder } from "@/lib/portal/mailboxes";

export const runtime = "nodejs";
export const maxDuration = 60;

function folderFrom(value: string | null): MailFolder {
  if (value === "sent" || value === "trash") return value;
  return "inbox";
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const url = new URL(req.url);
  const box = mailboxByKey(url.searchParams.get("account") || "");
  if (!box) return NextResponse.json({ error: "Esa cuenta no está en el estudio." }, { status: 400 });

  const fileId = url.searchParams.get("file") || "";
  const messageId = url.searchParams.get("id") || "";
  try {
    if (fileId && messageId) {
      const owner = await readMessage(messageId);
      if (!owner || owner.account !== box.key) {
        return NextResponse.json({ error: "Ese archivo ya no está." }, { status: 404 });
      }
      const found = await readAttachment(messageId, fileId);
      if (!found) return NextResponse.json({ error: "Ese archivo ya no está." }, { status: 404 });
      const filename = encodeURIComponent(found.file.filename);
      const inline = found.file.contentType.startsWith("image/");
      return new NextResponse(new Uint8Array(found.bytes), {
        headers: {
          "Content-Type": found.file.contentType,
          "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${filename}`,
          "Cache-Control": "private, no-store",
        },
      });
    }
    if (messageId) {
      const message = await readMessage(messageId);
      if (!message || message.account !== box.key) {
        return NextResponse.json({ error: "Ese mensaje ya no está." }, { status: 404 });
      }
      return NextResponse.json({ message });
    }
    const messages = await listMailbox(box.key, folderFrom(url.searchParams.get("folder")));
    return NextResponse.json({ messages });
  } catch (err) {
    const pub = publicMailError(err);
    return NextResponse.json({ error: pub.error }, { status: pub.status });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const type = req.headers.get("content-type") || "";
    if (type.includes("multipart/form-data")) {
      const form = await req.formData();
      const box = mailboxByKey(String(form.get("account") || ""));
      if (!box) return NextResponse.json({ error: "Esa cuenta no está en el estudio." }, { status: 400 });
      const uploads = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
      const attachments = await Promise.all(uploads.slice(0, 8).map(async (file) => ({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        content: Buffer.from(await file.arrayBuffer()),
      })));
      await sendMail({
        account: box.key,
        to: String(form.get("to") || ""),
        subject: String(form.get("subject") || ""),
        text: String(form.get("text") || ""),
        inReplyTo: String(form.get("inReplyTo") || ""),
        attachments,
      });
      return NextResponse.json({ ok: true });
    }
    const body = (await req.json()) as { action?: string; account?: string; folder?: string; ids?: string[] };
    const box = mailboxByKey(body.account || "");
    if (!box) return NextResponse.json({ error: "Esa cuenta no está en el estudio." }, { status: 400 });
    if (body.action === "delete") {
      await deleteMessages(box.key, folderFrom(body.folder || ""), Array.isArray(body.ids) ? body.ids : []);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Acción desconocida." }, { status: 400 });
  } catch (err) {
    const pub = publicMailError(err);
    return NextResponse.json({ error: pub.error }, { status: pub.status });
  }
}
