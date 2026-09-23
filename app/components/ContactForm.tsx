"use client";

import { CalendlyEmbed } from "./CalendlyEmbed";
import { contactKinds, site } from "@/lib/site";
import { useI18n } from "@/lib/i18n/context";
import { useEffect, useRef, useState, type FormEvent, type InvalidEvent } from "react";

function readForm(form: HTMLFormElement) {
  const data = new FormData(form);
  return {
    nombre: String(data.get("nombre") ?? "").trim(),
    email: String(data.get("email") ?? "").trim(),
    telefono: String(data.get("telefono") ?? "").trim(),
    fecha: String(data.get("fecha") ?? "").trim(),
    tipo: String(data.get("tipo") ?? "").trim(),
    mensaje: String(data.get("mensaje") ?? "").trim(),
    honey: String(data.get("company") ?? "").trim(),
  };
}

function isField(
  target: EventTarget | null,
): target is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function isActivating(message?: string) {
  return (message ?? "").toLowerCase().includes("activat");
}

function formAccepted(payload: { success?: string | boolean; message?: string } | null) {
  if (!payload) return false;
  return (
    payload.success === true ||
    payload.success === "true" ||
    isActivating(payload.message)
  );
}

function submitPayload(fields: ReturnType<typeof readForm>) {
  const text = [
    "Nueva consulta desde manymakeups.com",
    "",
    `Nombre: ${fields.nombre}`,
    `Email: ${fields.email}`,
    `Teléfono: ${fields.telefono}`,
    `Servicio: ${fields.tipo}`,
    fields.fecha && `Fecha del evento: ${fields.fecha}`,
    fields.mensaje && `Consulta: ${fields.mensaje}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    _subject: `Consulta Many Makeups · ${fields.tipo}`,
    _captcha: "false",
    _template: "table",
    _replyto: fields.email,
    name: fields.nombre,
    email: fields.email,
    telefono: fields.telefono,
    servicio: fields.tipo,
    fecha_evento: fields.fecha || "No indicada",
    consulta: fields.mensaje || "Sin texto",
    message: text,
  };
}

export function ContactForm() {
  const { locale, messages: t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const [tipo, setTipo] = useState<(typeof contactKinds)[number]>(
    contactKinds[0],
  );
  const [notice, setNotice] = useState<{
    title: string;
    body: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [calendlyOpen, setCalendlyOpen] = useState(false);

  useEffect(() => {
    if (!calendlyOpen && !notice) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setCalendlyOpen(false);
      setNotice(null);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [calendlyOpen, notice]);

  function localizeValidity(event: InvalidEvent<HTMLFormElement>) {
    const field = event.target;
    if (!isField(field)) return;
    if (field.validity.valueMissing) {
      field.setCustomValidity(t.contact.requiredField);
      return;
    }
    if (field.validity.typeMismatch) {
      field.setCustomValidity(t.contact.invalidEmail);
      return;
    }
    field.setCustomValidity("");
  }

  function clearValidity(event: FormEvent<HTMLFormElement>) {
    const field = event.target;
    if (isField(field)) field.setCustomValidity("");
  }

  function openWhatsApp() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    const fields = readForm(form);
    const text = [
      t.contact.whatsappIntro,
      `${t.contact.name}: ${fields.nombre}`,
      `${t.contact.email}: ${fields.email}`,
      `${t.contact.phone}: ${fields.telefono}`,
      `${t.contact.kind}: ${fields.tipo}`,
      fields.fecha && `${t.contact.date}: ${fields.fecha}`,
      fields.mensaje && `${t.contact.message}: ${fields.mensaje}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(
      `${site.whatsappUrl}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setNotice({
      title: t.contact.whatsappTitle,
      body: t.contact.whatsappBody,
    });
  }

  async function sendDirect(fields: ReturnType<typeof readForm>) {
    const response = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(submitPayload(fields)),
    });
    const payload = (await response.json().catch(() => null)) as {
      success?: string | boolean;
      message?: string;
    } | null;
    if (!formAccepted(payload)) return null;
    return { activating: isActivating(payload?.message) };
  }

  async function sendViaApi(fields: ReturnType<typeof readForm>) {
    const response = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      activating?: boolean;
    } | null;
    if (!response.ok || !payload?.ok) return null;
    return { activating: Boolean(payload.activating) };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setSending(true);
    const fields = readForm(event.currentTarget);
    try {
      if (fields.honey) {
        setNotice({
          title: t.contact.sentTitle,
          body: t.contact.sentBody,
        });
        return;
      }
      const result = (await sendDirect(fields).catch(() => null)) ?? (await sendViaApi(fields));
      if (!result) {
        setNotice({
          title: t.contact.errorTitle,
          body: t.contact.errorBody,
        });
        return;
      }
      setNotice({
        title: t.contact.sentTitle,
        body: result.activating ? t.contact.sentActivate : t.contact.sentBody,
      });
    } catch {
      setNotice({
        title: t.contact.errorTitle,
        body: t.contact.errorBody,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <form
        ref={formRef}
        lang={locale}
        className="flex flex-col gap-4"
        onSubmit={onSubmit}
        onInvalid={localizeValidity}
        onInput={clearValidity}
        onChange={clearValidity}
      >
        <label className="field-label">
          {t.contact.name}
          <input
            className="field"
            name="nombre"
            type="text"
            required
            autoComplete="name"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">
            {t.contact.email}
            <input
              className="field"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </label>
          <label className="field-label">
            {t.contact.phone}
            <input
              className="field"
              name="telefono"
              type="tel"
              required
              autoComplete="tel"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">
            {t.contact.date}
            <input className="field" name="fecha" type="date" />
          </label>
          <label className="field-label">
            {t.contact.kind}
            <select
              className="field"
              name="tipo"
              required
              value={tipo}
              onChange={(event) =>
                setTipo(event.target.value as (typeof contactKinds)[number])
              }
            >
              {contactKinds.map((kind, i) => (
                <option key={kind} value={kind}>
                  {t.contact.kinds[i] ?? kind}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field-label">
          {t.contact.message}
          <textarea className="field min-h-28" name="mensaje" rows={4} />
        </label>
        <input
          className="hidden"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />
        <div className="mt-2 flex flex-wrap gap-3">
          <button
            className="btn-atelier-solid btn-atelier"
            type="submit"
            disabled={sending}
          >
            {sending ? t.common.sending : t.common.send}
          </button>
          <button
            className="btn-atelier"
            type="button"
            onClick={openWhatsApp}
          >
            {t.common.whatsapp}
          </button>
          <button
            className="btn-atelier"
            type="button"
            onClick={() => setCalendlyOpen(true)}
          >
            {t.common.phoneAppointment}
          </button>
        </div>
      </form>

      {notice ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 md:p-8"
          onClick={() => setNotice(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="aviso-heading"
        >
          <div
            className="relative w-full max-w-md border border-ink/10 bg-porcelain px-8 py-10 text-center shadow-[0_20px_50px_rgba(26,22,19,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="aviso-heading" className="font-serif text-3xl">
              {notice.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ash">
              {notice.body}
            </p>
            <button
              type="button"
              className="btn-atelier-solid btn-atelier mt-8"
              onClick={() => setNotice(null)}
            >
              {t.common.close}
            </button>
          </div>
        </div>
      ) : null}
      {calendlyOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/80 p-4 md:p-8"
          onClick={() => setCalendlyOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cita-heading"
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden border border-ink/10 bg-porcelain shadow-[0_20px_50px_rgba(26,22,19,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4">
              <h3 id="cita-heading" className="font-serif text-2xl">
                {t.common.phoneAppointment}
              </h3>
              <button
                type="button"
                className="text-[0.68rem] uppercase tracking-[0.18em] text-ash hover:text-ink"
                onClick={() => setCalendlyOpen(false)}
              >
                {t.common.close}
              </button>
            </div>
            <CalendlyEmbed eager />
          </div>
        </div>
      ) : null}
    </>
  );
}
