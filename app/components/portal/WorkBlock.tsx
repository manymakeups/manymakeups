"use client";

import { PhotoGrid, PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import { HAIR_ZONES, PRODUCT_ZONES, filesFor, type PortalFile, type UsedProduct } from "@/lib/portal/types";
import { useState } from "react";

function zoneLabel(zone: string, copy: PortalCopy) {
  return copy.productZones[zone] || zone;
}

export function ProductList({
  products,
  legacy,
  copy = portalEs,
}: {
  products: UsedProduct[];
  legacy?: string;
  copy?: PortalCopy;
}) {
  if (!products.length) {
    return <p className="mt-2 whitespace-pre-wrap text-sm">{legacy || copy.productsEmpty}</p>;
  }
  const groups = new Map<string, UsedProduct[]>();
  for (const product of products) {
    const zone = product.zone || "Otra";
    const list = groups.get(zone) ?? [];
    list.push(product);
    groups.set(zone, list);
  }
  const order = products.some((product) => product.look === "peinado") ? HAIR_ZONES : PRODUCT_ZONES;
  const known = order.filter((zone) => groups.has(zone));
  const extra = [...groups.keys()].filter((zone) => !(order as readonly string[]).includes(zone));
  return (
    <div className="mt-4 flex flex-col gap-6">
      {[...known, ...extra].map((zone) => (
        <div key={zone}>
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{zoneLabel(zone, copy)}</p>
          <ul className="mt-2 divide-y divide-ink/10 border border-ink/10">
            {(groups.get(zone) ?? []).map((product, index) => (
              <li key={`${zone}-${index}`} className="px-4 py-3 text-sm">
                {[product.brand, product.name, product.shade].filter(Boolean).join(" · ") || "—"}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function WorkView({
  title,
  products,
  productLines = [],
  photos,
  clientId,
  copy = portalEs,
  part = "both",
  notes = "",
}: {
  title?: string;
  products: string;
  productLines?: UsedProduct[];
  photos: PortalFile[];
  clientId: string;
  copy?: PortalCopy;
  part?: "both" | "photos" | "products";
  notes?: string;
}) {
  const showProducts = part !== "photos";
  const showPhotos = part !== "products";
  return (
    <div className="flex flex-col gap-4">
      {title ? (
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{title}</p>
      ) : null}
      {showProducts ? (
      <div>
        {part === "both" ? (
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">{copy.productsUsed}</p>
        ) : null}
        <ProductList products={productLines} legacy={products} copy={copy} />
        {notes ? <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{notes}</p> : null}
      </div>
      ) : null}
      {showPhotos ? (
      <div>
        {part === "both" ? (
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">{copy.trialPhotos}</p>
        ) : null}
        <div className="mt-3">
          {photos.length ? (
            <PhotoGrid files={photos} clientId={clientId} kind="work" openLabel={copy.photoOpen} closeLabel={copy.photoClose} />
          ) : (
            <p className="text-sm text-ash">{copy.trialPhotosEmpty}</p>
          )}
        </div>
      </div>
      ) : null}
    </div>
  );
}

function ProductFields({ prefix, products, look }: { prefix: string; products: UsedProduct[]; look: "maquillaje" | "peinado" }) {
  const zones = look === "peinado" ? HAIR_ZONES : PRODUCT_ZONES;
  const blank = (): UsedProduct => ({ brand: "", name: "", shade: "", zone: zones[0], look });
  const [rows, setRows] = useState<UsedProduct[]>(products);
  const [draft, setDraft] = useState<UsedProduct>(blank());
  const known = (zones as readonly string[]).includes(draft.zone);
  const picked = known || !draft.zone ? draft.zone || zones[0] : look === "peinado" ? draft.zone : "Otra";
  function addDraft() {
    const zone = picked === "Otra" ? draft.zone.trim() : picked;
    if (!draft.brand.trim() && !draft.name.trim() && !draft.shade.trim() && !zone) return;
    setRows([...rows, { ...draft, zone: zone || "Otra", look }]);
    setDraft(blank());
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 grid gap-3 border border-ink/10 bg-porcelain p-4 sm:grid-cols-2">
        <label className="field-label">
          Marca
          <input className="field" value={draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })} />
        </label>
        <label className="field-label">
          Producto
          <input className="field" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </label>
        <label className="field-label">
          Tono
          <input className="field" value={draft.shade} onChange={(event) => setDraft({ ...draft, shade: event.target.value })} />
        </label>
        <label className="field-label">
          Área
          <select
            className="field"
            value={picked}
            onChange={(event) => {
              const zone = event.target.value;
              setDraft({ ...draft, zone: zone === "Otra" ? "" : zone });
            }}
          >
            {look === "peinado" && picked && !(zones as readonly string[]).includes(picked) ? (
              <option key={picked} value={picked}>{picked}</option>
            ) : null}
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
            {look === "maquillaje" ? <option value="Otra">Otra</option> : null}
          </select>
        </label>
        {picked === "Otra" ? (
          <label className="field-label sm:col-span-2">
            Qué área
            <input className="field" value={draft.zone} onChange={(event) => setDraft({ ...draft, zone: event.target.value })} />
          </label>
        ) : null}
        <button className="btn-atelier self-end justify-self-start" type="button" onClick={addDraft}>
          Añadir producto
        </button>
      </div>
      {rows.length ? (
        <ul className="divide-y divide-ink/10 border border-ink/10">
          {rows.map((row, index) => (
            <li key={`${row.brand}-${row.name}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <span>{[row.brand, row.name, row.shade].filter(Boolean).join(" · ") || "—"}</span>
              <span className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{row.zone || "Otra"}</span>
              <input type="hidden" name={`${prefix}${index}.brand`} value={row.brand} />
              <input type="hidden" name={`${prefix}${index}.name`} value={row.name} />
              <input type="hidden" name={`${prefix}${index}.shade`} value={row.shade} />
              <input type="hidden" name={`${prefix}${index}.zone`} value={row.zone || "Otra"} />
              <button
                className="btn-atelier"
                type="button"
                onClick={() => setRows(rows.filter((_, i) => i !== index))}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ash">Todavía no hay productos en esta lista.</p>
      )}
    </div>
  );
}

export function WorkForm({
  clientId,
  personKey,
  fieldPrefix,
  products,
  productLines = [],
  photos,
  tab,
  mode = "both",
  look = "maquillaje",
  section = "productos",
  photoSection = "fotos",
  personIndex,
}: {
  clientId: string;
  personKey: string;
  fieldPrefix: string;
  products: string;
  productLines?: UsedProduct[];
  photos: PortalFile[];
  tab: string;
  mode?: "both" | "photos" | "products";
  look?: "maquillaje" | "peinado";
  section?: string;
  photoSection?: string;
  personIndex?: number;
}) {
  const shown = filesFor(photos, personKey);
  return (
    <div className="flex flex-col gap-6">
      {mode !== "photos" ? (
        <form action="/api/admin/studio" method="post" className="flex flex-col gap-4">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="tab" value={tab} />
          <input type="hidden" name="section" value={section} />
          <input type="hidden" name="productLook" value={look} />
          <input type="hidden" name="productTarget" value={personIndex == null ? "event" : "person"} />
          {personIndex != null ? <input type="hidden" name="personIndex" value={personIndex} /> : null}
          {products && !productLines.length ? (
            <p className="whitespace-pre-wrap text-sm text-ash">{products}</p>
          ) : null}
          <ProductFields prefix={fieldPrefix} products={productLines} look={look} />
          <button className="btn-atelier self-start" type="submit">
            Guardar productos
          </button>
        </form>
      ) : null}
      {mode !== "products" ? (
        <>
          <PhotoPicker
            personKey={personKey}
            files={photos}
            clientId={clientId}
            action="/api/admin/work"
            fieldName="person"
            label="Fotos de la prueba"
            tab={tab}
            section={photoSection}
            kind="work"
          />
          {!shown.length ? (
            <p className="text-sm text-ash">Cuando cuelgues las fotos de la prueba, ella las verá aquí.</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function LookNotesForm({
  clientId,
  tab,
  section,
  personIndex,
  makeupNotes,
  hairNotes,
}: {
  clientId: string;
  tab: string;
  section: string;
  personIndex?: number;
  makeupNotes: string;
  hairNotes: string;
}) {
  return (
    <form action="/api/admin/studio" method="post" className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="intent" value="notes" />
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="tab" value={tab} />
      <input type="hidden" name="section" value={section} />
      <input type="hidden" name="productTarget" value={personIndex == null ? "event" : "person"} />
      {personIndex != null ? <input type="hidden" name="personIndex" value={personIndex} /> : null}
      <label className="field-label">
        Maquillaje
        <textarea className="field min-h-28" name="makeupNotes" defaultValue={makeupNotes} />
      </label>
      <label className="field-label">
        Peinado
        <textarea className="field min-h-28" name="hairNotes" defaultValue={hairNotes} />
      </label>
      <button className="btn-atelier self-start" type="submit">
        Guardar notas
      </button>
    </form>
  );
}

export function LookNotesView({
  makeupNotes,
  hairNotes,
  makeupLabel,
  hairLabel,
  empty,
}: {
  makeupNotes: string;
  hairNotes: string;
  makeupLabel: string;
  hairLabel: string;
  empty: string;
}) {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{makeupLabel}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{makeupNotes || empty}</p>
      </div>
      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">{hairLabel}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{hairNotes || empty}</p>
      </div>
    </div>
  );
}
