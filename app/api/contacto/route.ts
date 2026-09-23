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

type FormSubmitPayload = {
  success?: string | boolean;
  message?: string;
};

function isKind(value: string): value is (typeof contactKinds)[number] {
  return (contactKinds as readonly string[]).includes(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isFormSubmitActivating(message?: string) {
  return (message ?? "").toLowerCase().includes("activat");
}

function isFormSubmitAccepted(payload: FormSubmitPayload | null) {
  if (!payload) return false;
  return (
    payload.success === true ||
    payload.success === "true" ||
    isFormSubmitActivating(payload.message)
  );
}

function formSubmitBody(data: {
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  tipo: string;
  mensaje: string;
}) {
  const text = [
    "Nueva consulta desde manymakeups.com",
    "",
    `Nombre: ${data.nombre}`,
    `Email: ${data.email}`,
    `Teléfono: ${data.telefono}`,
    `Servicio: ${data.tipo}`,
    data.fecha && `Fecha del evento: ${data.fecha}`,
    data.mensaje && `Consulta: ${data.mensaje}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    _subject: `Consulta Many Makeups · ${data.tipo}`,
    _captcha: "false",
    _template: "table",
    _replyto: data.email,
    name: data.nombre,
    email: data.email,
    telefono: data.telefono,
    servicio: data.tipo,
    fecha_evento: data.fecha || "No indicada",
    consulta: data.mensaje || "Sin texto",
    message: text,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const data = (body ?? {}) as Partial<ContactBody>;
  if (readString(data.honey)) {
    return Response.json({ ok: true });
  }

  const nombre = readString(data.nombre);
  const email = readString(data.email);
  const telefono = readString(data.telefono);
  const fecha = readString(data.fecha);
  const tipo = readString(data.tipo);
  const mensaje = readString(data.mensaje);

  if (!nombre || !email || !telefono || !isKind(tipo)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const response = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(
      formSubmitBody({ nombre, email, telefono, fecha, tipo, mensaje }),
    ),
  });

  const payload = (await response.json().catch(() => null)) as FormSubmitPayload | null;

  if (!isFormSubmitAccepted(payload)) {
    return Response.json({ ok: false }, { status: 502 });
  }

  return Response.json({
    ok: true,
    activating: isFormSubmitActivating(payload?.message),
  });
}
