import { contactKinds, site } from "@/lib/site";

type ContactBody = {
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  tipo: string;
  mensaje: string;
  honey: string;
};

function isKind(value: string): value is (typeof contactKinds)[number] {
  return (contactKinds as readonly string[]).includes(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  const data = (body ?? {}) as Partial<ContactBody>;
  const honey = readString(data.honey);
  if (honey) {
    return Response.json({ ok: true });
  }

  const nombre = readString(data.nombre);
  const email = readString(data.email);
  const telefono = readString(data.telefono);
  const fecha = readString(data.fecha);
  const tipo = readString(data.tipo);
  const mensaje = readString(data.mensaje);

  if (!nombre || !email || !telefono || !isKind(tipo)) {
    return Response.json(
      { error: "Nombre, email, teléfono y servicio son obligatorios." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "El email no es válido." }, { status: 400 });
  }

  const text = [
    "Nueva consulta desde manymakeups.com",
    "",
    `Nombre: ${nombre}`,
    `Email: ${email}`,
    `Teléfono: ${telefono}`,
    `Servicio: ${tipo}`,
    fecha && `Fecha del evento: ${fecha}`,
    mensaje && `Consulta: ${mensaje}`,
  ]
    .filter(Boolean)
    .join("\n");

  const origin =
    request.headers.get("origin") ||
    request.headers.get("referer") ||
    site.url;

  const response = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: origin,
      Referer: origin,
    },
    body: JSON.stringify({
      _subject: `Consulta Many Makeups · ${tipo}`,
      _replyto: email,
      name: nombre,
      email,
      telefono,
      servicio: tipo,
      fecha_evento: fecha || "No indicada",
      consulta: mensaje || "Sin texto",
      message: text,
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    success?: string | boolean;
    message?: string;
  } | null;

  const sent =
    payload?.success === true ||
    payload?.success === "true" ||
    payload?.message?.toLowerCase().includes("activat");

  if (!sent) {
    return Response.json(
      {
        error:
          payload?.message ||
          "No he podido enviar el formulario. Prueba por WhatsApp.",
      },
      { status: 502 },
    );
  }

  const activating = payload?.message?.toLowerCase().includes("activat");

  return Response.json({
    ok: true,
    activating: Boolean(activating),
  });
}
