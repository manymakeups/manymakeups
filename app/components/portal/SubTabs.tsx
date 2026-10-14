"use client";

import { useState, type ReactNode } from "react";

export function SubTabs({
  tabs,
  initial,
}: {
  tabs: { id: string; label: string; body: ReactNode }[];
  initial?: string;
}) {
  const start = initial && tabs.some((tab) => tab.id === initial) ? initial : tabs[0]?.id;
  const [current, setCurrent] = useState(start);
  const active = tabs.find((tab) => tab.id === current) ?? tabs[0];
  if (!active) return null;
  return (
    <div>
      <div className="flex flex-wrap gap-x-6 border-b border-ink/10">
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
      <div className="pt-8">{active.body}</div>
    </div>
  );
}

export function EventSections({
  labels,
  section,
  details,
  inspiration,
  photos,
  products,
}: {
  labels: {
    data: string;
    inspirations: string;
    look: string;
    trial: string;
    photos: string;
    products: string;
  };
  section?: string;
  details: ReactNode;
  inspiration: ReactNode;
  photos: ReactNode;
  products: ReactNode;
}) {
  const inInspiration = section === "look" || section === "fotos" || section === "productos";
  const inTrial = section === "fotos" || section === "productos";
  return (
    <SubTabs
      initial={inInspiration ? "inspiraciones" : "datos"}
      tabs={[
        { id: "datos", label: labels.data, body: details },
        {
          id: "inspiraciones",
          label: labels.inspirations,
          body: (
            <SubTabs
              initial={inTrial ? "prueba" : "look"}
              tabs={[
                { id: "look", label: labels.look, body: inspiration },
                {
                  id: "prueba",
                  label: labels.trial,
                  body: (
                    <SubTabs
                      initial={section === "productos" ? "productos" : "fotos"}
                      tabs={[
                        { id: "fotos", label: labels.photos, body: photos },
                        { id: "productos", label: labels.products, body: products },
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
