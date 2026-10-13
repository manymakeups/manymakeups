"use client";

export function DeleteFileButton({
  id,
  clientId,
  kind,
  label,
}: {
  id: string;
  clientId?: string;
  kind: "inspiration" | "document";
  label: string;
}) {
  async function onClick() {
    if (!confirm("¿Quitar este archivo?")) return;
    const url = kind === "document" ? "/api/admin/documents" : "/api/portal/inspiration";
    await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, clientId }),
    });
    window.location.reload();
  }

  return (
    <button
      type="button"
      className="text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function CopyInvite({ url }: { url: string }) {
  return (
    <button
      type="button"
      className="btn-atelier"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
      }}
    >
      Copiar enlace
    </button>
  );
}
