"use client";

import { PhotoGrid, PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import { PRODUCT_ZONES, filesFor, type PortalFile, type UsedProduct } from "@/lib/portal/types";
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
  const known = PRODUCT_ZONES.filter((zone) => groups.has(zone));
  const extra = [...groups.keys()].filter((zone) => !PRODUCT_ZONES.includes(zone as (typeof PRODUCT_ZONES)[number]));
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
}: {
  title?: string;
  products: string;
  productLines?: UsedProduct[];
  photos: PortalFile[];
  clientId: string;
  copy?: PortalCopy;
  part?: "both" | "photos" | "products";
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

function ProductFields({ prefix, products }: { prefix: string; products: UsedProduct[] }) {
  const blank = (): UsedProduct => ({ brand: "", name: "", shade: "", zone: "Ojos" });
  const [rows, setRows] = useState<UsedProduct[]>(products.length ? products : [blank()]);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">Productos utilizados</p>
      {rows.map((row, index) => {
        const known = PRODUCT_ZONES.includes(row.zone as (typeof PRODUCT_ZONES)[number]);
        const picked = known || !row.zone ? row.zone || "Ojos" : "Otra";
        return (
          <div key={index} className="grid gap-3 border border-ink/10 p-4 sm:grid-cols-2 sm:items-end">
            <label className="field-label">
              Marca
              <input
                className="field"
                name={`${prefix}${index}.brand`}
                value={row.brand}
                onChange={(event) => {
                  const next = [...rows];
                  next[index] = { ...row, brand: event.target.value };
                  setRows(next);
                }}
              />
            </label>
            <label className="field-label">
              Producto
              <input
                className="field"
                name={`${prefix}${index}.name`}
                value={row.name}
                onChange={(event) => {
                  const next = [...rows];
                  next[index] = { ...row, name: event.target.value };
                  setRows(next);
                }}
              />
            </label>
            <label className="field-label">
              Tono
              <input
                className="field"
                name={`${prefix}${index}.shade`}
                value={row.shade}
                onChange={(event) => {
                  const next = [...rows];
                  next[index] = { ...row, shade: event.target.value };
                  setRows(next);
                }}
              />
            </label>
            <label className="field-label">
              Área
              <select
                className="field"
                name={`${prefix}${index}.zone`}
                value={picked}
                onChange={(event) => {
                  const next = [...rows];
                  const zone = event.target.value;
                  next[index] = { ...row, zone: zone === "Otra" ? row.zone && !known ? row.zone : "" : zone };
                  setRows(next);
                }}
              >
                {PRODUCT_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
                <option value="Otra">Otra</option>
              </select>
            </label>
            <button
              className="btn-atelier self-end"
              type="button"
              onClick={() => setRows(rows.length === 1 ? [blank()] : rows.filter((_, i) => i !== index))}
            >
              Quitar
            </button>
            {picked === "Otra" ? (
              <label className="field-label sm:col-span-2">
                Qué área
                <input
                  className="field"
                  name={`${prefix}${index}.zoneCustom`}
                  value={known ? "" : row.zone}
                  onChange={(event) => {
                    const next = [...rows];
                    next[index] = { ...row, zone: event.target.value };
                    setRows(next);
                  }}
                />
              </label>
            ) : null}
          </div>
        );
      })}
      <button className="btn-atelier self-start" type="button" onClick={() => setRows([...rows, blank()])}>
        Añadir producto
      </button>
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
}: {
  clientId: string;
  personKey: string;
  fieldPrefix: string;
  products: string;
  productLines?: UsedProduct[];
  photos: PortalFile[];
  tab: string;
  mode?: "both" | "photos" | "products";
}) {
  const shown = filesFor(photos, personKey);
  return (
    <div className="flex flex-col gap-6">
      {mode !== "photos" ? (
        <form action="/api/admin/studio" method="post" className="flex flex-col gap-4">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="tab" value={tab} />
          <input type="hidden" name="section" value="productos" />
          {products && !productLines.length ? (
            <p className="whitespace-pre-wrap text-sm text-ash">{products}</p>
          ) : null}
          <ProductFields prefix={fieldPrefix} products={productLines} />
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
            section="fotos"
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
