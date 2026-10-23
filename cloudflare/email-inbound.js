// Worker de Email Routing. En la cuenta de Cloudflare de Many Makeups:
// Workers → email-worker → index.js → Deploy.
// Variable INBOUND_SECRET: el mismo valor que EMAIL_INBOUND_SECRET en Vercel.
// Una regla por cuenta, las cinco hacia este worker:
// info@, accounting@, formaciones@, comercial@, management@manymakeups.com

export default {
  async email(message, env) {
    const secret = env.INBOUND_SECRET;
    if (!secret) {
      message.setReject("Mailbox is not configured");
      return;
    }
    const raw = await new Response(message.raw).arrayBuffer();
    const hard = 18_000_000;
    if (raw.byteLength > hard) {
      message.setReject("Message is too large");
      return;
    }
    const url = "https://www.manymakeups.com/api/email/inbound";
    const headers = {
      Authorization: `Bearer ${secret}`,
      "X-Envelope-To": message.to || "",
      "X-Envelope-From": message.from || "",
    };
    try {
      if (raw.byteLength <= 4_200_000) {
        const res = await fetch(url, {
          method: "POST",
          headers: { ...headers, "Content-Type": "message/rfc822" },
          body: raw,
        });
        if (!res.ok) message.setReject("Mailbox temporarily unavailable");
        return;
      }
      const uploadId = crypto.randomUUID();
      const chunk = 2_500_000;
      const parts = Math.ceil(raw.byteLength / chunk);
      for (let seq = 0; seq < parts; seq += 1) {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/octet-stream",
            "X-Upload-Id": uploadId,
            "X-Upload-Seq": String(seq),
            "X-Upload-Parts": String(parts),
            "X-Upload-Bytes": String(raw.byteLength),
          },
          body: raw.slice(seq * chunk, (seq + 1) * chunk),
        });
        if (!res.ok) {
          message.setReject("Mailbox temporarily unavailable");
          return;
        }
      }
    } catch {
      message.setReject("Mailbox temporarily unavailable");
    }
  },
};
