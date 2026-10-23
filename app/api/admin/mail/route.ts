import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/portal/session";
import {
  deleteMessages,
  dropOutbox,
  listMailbox,
  moveMessages,
  publicMailError,
  readAttachment,
  readMessage,
  readOutbox,
  sendMail,
  setMessagesSeen,
  unseenSnapshot,
} from "@/lib/portal/mail-store";
import { binderAct, binderMailError, binderUnseen, listBinder, readBinder, readBinderFile } from "@/lib/portal/binder-mail";
import { MAILBOXES, mailboxByKey, type MailFolder } from "@/lib/portal/mailboxes";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseFolder(value: string | null | undefined): MailFolder | null {
  if (value === "inbox" || value === "sent" || value === "archive" || value === "trash") return value;
  return null;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const url = new URL(req.url);
  if (url.searchParams.get("unseen") === "1") {
    const snapshot = await unseenSnapshot();
    try {
      const extra = await binderUnseen();
      return NextResponse.json({ counts: { ...snapshot.counts, binder: extra.count }, items: [...snapshot.items, ...extra.items] });
    } catch {
      return NextResponse.json({ counts: { ...snapshot.counts, binder: 0 }, items: snapshot.items });
    }
  }
  const accountParam = url.searchParams.get("account") || "";
  if (accountParam === "binder") {
    try {
      const fileId = url.searchParams.get("file") || "";
      const messageId = url.searchParams.get("id") || "";
      if (fileId) {
        const found = await readBinderFile(fileId);
        const filename = encodeURIComponent(found.filename);
        const inline = found.contentType.startsWith("image/");
        return new NextResponse(new Uint8Array(found.bytes), {
          headers: {
            "Content-Type": found.contentType,
            "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${filename}`,
            "Cache-Control": "private, no-store",
          },
        });
      }
      if (messageId) {
        const message = await readBinder(messageId);
        return NextResponse.json({ message });
      }
      const messages = await listBinder(parseFolder(url.searchParams.get("folder")) || "inbox");
      return NextResponse.json({ messages });
    } catch (err) {
      const pub = binderMailError(err);
      return NextResponse.json({ error: pub.error }, { status: pub.status });
    }
  }
  if (accountParam === "all" && !url.searchParams.get("id") && !url.searchParams.get("file")) {
    try {
      const folder = parseFolder(url.searchParams.get("folder")) || "inbox";
      const lists = await Promise.all(MAILBOXES.map((box) => listMailbox(box.key, folder)));
      const messages = lists.flat().map((row) => row as { createdAt: string });
      try {
        messages.push(...(await listBinder(folder)));
      } catch {
        /* atelier mail still opens if Binder is quiet */
      }
      messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return NextResponse.json({ messages: messages.slice(0, 300) });
    } catch (err) {
      const pub = publicMailError(err);
      return NextResponse.json({ error: pub.error }, { status: pub.status });
    }
  }
  const box = mailboxByKey(accountParam);
  if (!box) return NextResponse.json({ error: "Esa cuenta no está en el estudio." }, { status: 400 });

  const fileId = url.searchParams.get("file") || "";
  const messageId = url.searchParams.get("id") || "";
  try {
    if (fileId && messageId) {
      const owner = await readMessage(messageId, { seen: false });
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
    const messages = await listMailbox(box.key, parseFolder(url.searchParams.get("folder")) || "inbox");
    return NextResponse.json({ messages });
  } catch (err) {
    const pub = publicMailError(err);
    return NextResponse.json({ error: pub.error }, { status: pub.status });
  }
}

type SendFile = { pathname?: string; filename?: string; contentType?: string };

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const type = req.headers.get("content-type") || "";
    if (type.includes("multipart/form-data")) {
      const form = await req.formData();
      const accountName = String(form.get("account") || "");
      if (accountName === "binder") {
        const uploads = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0).slice(0, 8);
        let total = 0;
        const files = await Promise.all(uploads.map(async (file) => {
          total += file.size;
          return {
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            contentBase64: Buffer.from(await file.arrayBuffer()).toString("base64"),
          };
        }));
        if (total > 3_500_000) return NextResponse.json({ error: "My K-pop Binder admite hasta 8 archivos y 3 MB." }, { status: 400 });
        await binderAct({
          action: "send",
          to: String(form.get("to") || ""),
          subject: String(form.get("subject") || ""),
          text: String(form.get("text") || ""),
          inReplyTo: String(form.get("inReplyTo") || ""),
          forwardId: String(form.get("forwardId") || ""),
          files,
        });
        return NextResponse.json({ ok: true });
      }
      const box = mailboxByKey(accountName);
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
        forwardId: String(form.get("forwardId") || ""),
        attachments,
      });
      return NextResponse.json({ ok: true });
    }
    const body = (await req.json()) as {
      action?: string;
      account?: string;
      folder?: string;
      to?: string;
      ids?: string[];
      seen?: boolean;
      destination?: string;
      subject?: string;
      text?: string;
      inReplyTo?: string;
      forwardId?: string;
      files?: SendFile[];
    };
    if (body.account === "binder") {
      const folder = parseFolder(body.folder) || "inbox";
      const ids = Array.isArray(body.ids) ? body.ids : [];
      if (body.action === "delete" || body.action === "seen" || body.action === "move") {
        const destination = parseFolder(body.destination);
        await binderAct({
          action: body.action,
          folder,
          ids,
          seen: Boolean(body.seen),
          destination: destination || "",
        });
        return NextResponse.json({ ok: true });
      }
      if (body.action === "send") {
        return NextResponse.json({ error: "My K-pop Binder admite hasta 8 archivos y 3 MB." }, { status: 400 });
      }
      return NextResponse.json({ error: "Acción desconocida." }, { status: 400 });
    }
    const box = mailboxByKey(body.account || "");
    if (!box) return NextResponse.json({ error: "Esa cuenta no está en el estudio." }, { status: 400 });
    const folder = parseFolder(body.folder) || "inbox";
    const ids = Array.isArray(body.ids) ? body.ids : [];
    if (body.action === "delete") {
      await deleteMessages(box.key, folder, ids);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "seen") {
      await setMessagesSeen(box.key, folder, ids, Boolean(body.seen));
      return NextResponse.json({ ok: true });
    }
    if (body.action === "move") {
      const destination = parseFolder(body.destination);
      if (!destination || destination === "sent") {
        return NextResponse.json({ error: "Esa carpeta no existe." }, { status: 400 });
      }
      await moveMessages(box.key, folder, ids, destination);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "send") {
      const listed = Array.isArray(body.files) ? body.files : [];
      const pathnames = listed.map((file) => String(file.pathname || ""));
      try {
        const attachments = await Promise.all(listed.map(async (file) => ({
          filename: String(file.filename || "archivo"),
          contentType: String(file.contentType || "application/octet-stream"),
          content: await readOutbox(String(file.pathname || "")),
        })));
        await sendMail({
          account: box.key,
          to: String(body.to || ""),
          subject: String(body.subject || ""),
          text: String(body.text || ""),
          inReplyTo: String(body.inReplyTo || ""),
          forwardId: String(body.forwardId || ""),
          attachments,
        });
      } finally {
        await Promise.all(pathnames.map((pathname) => dropOutbox(pathname)));
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Acción desconocida." }, { status: 400 });
  } catch (err) {
    if (err instanceof Error && err.name === "BinderMail") {
      const pub = binderMailError(err);
      return NextResponse.json({ error: pub.error }, { status: pub.status });
    }
    const pub = publicMailError(err);
    return NextResponse.json({ error: pub.error }, { status: pub.status });
  }
}
