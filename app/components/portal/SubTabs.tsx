"use client";

import { useState, type ReactNode } from "react";

export function SubTabs({
  tabs,
  initial,
  fill = false,
}: {
  tabs: { id: string; label: string; body: ReactNode; nested?: boolean }[];
  initial?: string;
  fill?: boolean;
}) {
  const start = initial && tabs.some((tab) => tab.id === initial) ? initial : tabs[0]?.id;
  const [current, setCurrent] = useState(start);
  const active = tabs.find((tab) => tab.id === current) ?? tabs[0];
  if (!active) return null;
  const bar = (
    <div className="flex shrink-0 flex-wrap gap-x-6 border-b border-ink/10 bg-porcelain">
      {tabs.map((tab) => {
        const on = tab.id === active.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={
              on
                ? "border-b-2 border-gilt px-1 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ink"
                : "border-b-2 border-transparent px-1 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
            }
            onClick={() => setCurrent(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
  if (!fill) {
    return (
      <div>
        {bar}
        <div className="pt-8">{active.body}</div>
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {bar}
      {active.nested ? (
        tabs.map((tab) => {
          const on = tab.id === active.id;
          return (
            <div
              key={tab.id}
              hidden={!on}
              className={
                on
                  ? "flex min-h-0 flex-1 flex-col overflow-hidden pt-4 [&>*]:flex [&>*]:h-full [&>*]:min-h-0 [&>*]:flex-1 [&>*]:flex-col"
                  : undefined
              }
            >
              {tab.body}
            </div>
          );
        })
      ) : (
        <div data-portal-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 pb-16 pt-6">
          {active.body}
        </div>
      )}
    </div>
  );
}

export function EventSections({
  labels,
  section,
  details,
  makeupInspiration,
  hairInspiration,
  photos,
  makeupProducts,
  hairProducts,
  notes,
}: {
  labels: {
    data: string;
    inspirations: string;
    makeup: string;
    hair: string;
    trial: string;
    photos: string;
    products: string;
    notes: string;
  };
  section?: string;
  details: ReactNode;
  makeupInspiration: ReactNode;
  hairInspiration: ReactNode;
  photos: ReactNode;
  makeupProducts: ReactNode;
  hairProducts: ReactNode;
  notes: ReactNode;
}) {
  const inProducts = section === "productos" || section?.startsWith("productos-") || section === "notas";
  const inTrial = section === "fotos" || inProducts;
  const inInspiration = section === "maquillaje" || section === "peinado";
  const productTab =
    section === "productos-peinado" ? "peinado" : section === "productos-notas" || section === "notas" ? "notas" : "maquillaje";
  return (
    <SubTabs
      fill
      initial={inTrial ? "prueba" : inInspiration ? "inspiraciones" : "datos"}
      tabs={[
        { id: "datos", label: labels.data, body: details },
        {
          id: "inspiraciones",
          label: labels.inspirations,
          nested: true,
          body: (
            <SubTabs
              fill
              initial={section === "peinado" ? "peinado" : "maquillaje"}
              tabs={[
                { id: "maquillaje", label: labels.makeup, body: makeupInspiration },
                { id: "peinado", label: labels.hair, body: hairInspiration },
              ]}
            />
          ),
        },
        {
          id: "prueba",
          label: labels.trial,
          nested: true,
          body: (
            <SubTabs
              fill
              initial={inProducts ? "productos" : "fotos"}
              tabs={[
                { id: "fotos", label: labels.photos, body: photos },
                {
                  id: "productos",
                  label: labels.products,
                  nested: true,
                  body: (
                    <SubTabs
                      fill
                      initial={productTab}
                      tabs={[
                        { id: "maquillaje", label: labels.makeup, body: makeupProducts },
                        { id: "peinado", label: labels.hair, body: hairProducts },
                        { id: "notas", label: labels.notes, body: notes },
                      ]}
                    />
                  ),
                },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
