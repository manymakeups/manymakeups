"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function SubTabs({
  tabs,
  initial,
  fill = false,
}: {
  tabs: { id: string; label: string; body: ReactNode; nested?: boolean; above?: ReactNode }[];
  initial?: string;
  fill?: boolean;
}) {
  const start = initial && tabs.some((tab) => tab.id === initial) ? initial : tabs[0]?.id;
  const [current, setCurrent] = useState(start);
  const active = tabs.find((tab) => tab.id === current) ?? tabs[0];
  const currentRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    currentRef.current?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [active?.id]);
  if (!active) return null;
  const bar = (
    <div className="flex w-full min-w-0 shrink-0 gap-x-5 overflow-x-auto border-b border-ink/10 bg-porcelain [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const on = tab.id === active.id;
        return (
          <div key={tab.id} className="flex shrink-0 flex-col items-center">
            {tab.above ? <div className="flex h-4 items-end justify-center">{tab.above}</div> : null}
            <button
              type="button"
              ref={on ? currentRef : undefined}
              className={
                on
                  ? "whitespace-nowrap border-b-2 border-gilt px-1 py-3 text-[0.68rem] uppercase tracking-[0.12em] text-ink md:tracking-[0.16em]"
                  : "whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-[0.68rem] uppercase tracking-[0.12em] text-ash hover:text-ink md:tracking-[0.16em]"
              }
              onClick={() => setCurrent(tab.id)}
            >
              {tab.label}
            </button>
          </div>
        );
      })}
    </div>
  );
  if (!fill) {
    return (
      <div className="min-w-0">
        {bar}
        <div className="pt-8">{active.body}</div>
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
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

export function CompanionSwitch({
  tabs,
  initial,
  label,
}: {
  tabs: { id: string; label: string; body: ReactNode }[];
  initial?: string;
  label: string;
}) {
  const start = initial && tabs.some((tab) => tab.id === initial) ? initial : tabs[0]?.id;
  const [current, setCurrent] = useState(start);
  const active = tabs.find((tab) => tab.id === current) ?? tabs[0];
  if (!active) return null;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 md:hidden">
        <label className="field-label">
          {label}
          <select className="field" value={active.id} onChange={(event) => setCurrent(event.target.value)}>
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="hidden shrink-0 md:block">
        <TabBar label={label} current={active.id} onChange={setCurrent} tabs={tabs.map(({ id, label: text }) => ({ id, label: text }))} />
      </div>
      {tabs.map((tab) => {
        const on = tab.id === active.id;
        return (
          <div
            key={tab.id}
            hidden={!on}
            className={
              on
                ? "mt-4 flex min-h-0 flex-1 flex-col overflow-hidden [&>*]:flex [&>*]:h-full [&>*]:min-h-0 [&>*]:flex-1 [&>*]:flex-col"
                : undefined
            }
          >
            {tab.body}
          </div>
        );
      })}
    </div>
  );
}

export function CompanionDeck({
  tabs,
  initial,
  label = "Acompañante",
}: {
  tabs: { id: string; label: string; body: ReactNode; remove?: ReactNode }[];
  initial?: string;
  label?: string;
}) {
  const start = initial && tabs.some((tab) => tab.id === initial) ? initial : tabs[0]?.id;
  const [current, setCurrent] = useState(start);
  const active = tabs.find((tab) => tab.id === current) ?? tabs[0];
  if (!active) return null;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 items-end gap-3">
        <label className="field-label min-w-0 flex-1">
          {label}
          <select className="field" value={active.id} onChange={(event) => setCurrent(event.target.value)}>
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </label>
        {active.remove}
      </div>
      {tabs.map((tab) => {
        const on = tab.id === active.id;
        return (
          <div
            key={tab.id}
            hidden={!on}
            className={
              on
                ? "mt-4 flex min-h-0 flex-1 flex-col overflow-hidden [&>*]:flex [&>*]:h-full [&>*]:min-h-0 [&>*]:flex-1 [&>*]:flex-col"
                : undefined
            }
          >
            {tab.body}
          </div>
        );
      })}
    </div>
  );
}

type EventLabels = {
  data: string;
  inspirations: string;
  makeup: string;
  hair: string;
  trial: string;
  photos: string;
  products: string;
  comments: string;
  planning?: string;
};

function eventFocus(section?: string) {
  if (section === "planning") return { area: "planning", look: "maquillaje", trial: "fotos" };
  const inComments = section === "comentarios" || section === "notas" || section === "productos-notas";
  const inProducts = section === "productos" || section?.startsWith("productos-");
  const inTrial = section === "fotos" || inProducts || inComments;
  const inInspiration = section === "maquillaje" || section === "peinado";
  return {
    area: inTrial ? "prueba" : inInspiration ? "inspiraciones" : "datos",
    look: section === "peinado" || section === "productos-peinado" ? "peinado" : "maquillaje",
    trial: inComments ? "comentarios" : inProducts ? "productos" : "fotos",
  };
}

function TabBar({
  tabs,
  current,
  onChange,
  label,
}: {
  tabs: { id: string; label: string }[];
  current: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex w-full min-w-0 shrink-0 gap-x-5 overflow-x-auto border-b border-ink/10 bg-porcelain [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const on = tab.id === current;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={on}
            className={
              on
                ? "whitespace-nowrap border-b-2 border-gilt px-1 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ink"
                : "whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-[0.68rem] uppercase tracking-[0.16em] text-ash hover:text-ink"
            }
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function EventFilters({
  labels,
  section,
  details,
  makeupInspiration,
  hairInspiration,
  photos,
  makeupProducts,
  hairProducts,
  trialComments,
  planning,
  bars = false,
}: {
  labels: EventLabels;
  section?: string;
  details: ReactNode;
  makeupInspiration: ReactNode;
  hairInspiration: ReactNode;
  photos: ReactNode;
  makeupProducts: ReactNode;
  hairProducts: ReactNode;
  trialComments: ReactNode;
  planning?: ReactNode;
  bars?: boolean;
}) {
  const start = eventFocus(section);
  const [area, setArea] = useState(start.area);
  const [look, setLook] = useState(start.look);
  const [trial, setTrial] = useState(start.trial);
  const panels = [
    { id: "datos", show: area === "datos", node: details },
    { id: "maquillaje", show: area === "inspiraciones" && look === "maquillaje", node: makeupInspiration },
    { id: "peinado", show: area === "inspiraciones" && look === "peinado", node: hairInspiration },
    { id: "fotos", show: area === "prueba" && trial === "fotos", node: photos },
    { id: "productos-maquillaje", show: area === "prueba" && trial === "productos" && look === "maquillaje", node: makeupProducts },
    { id: "productos-peinado", show: area === "prueba" && trial === "productos" && look === "peinado", node: hairProducts },
    { id: "comentarios", show: area === "prueba" && trial === "comentarios", node: trialComments },
    ...(planning ? [{ id: "planning", show: area === "planning", node: planning }] : []),
  ];
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className={bars ? "flex shrink-0 flex-wrap gap-2 md:hidden" : "flex shrink-0 flex-wrap gap-2"}>
        <select className="field min-w-0 flex-1" aria-label="Sección" value={area} onChange={(event) => setArea(event.target.value)}>
          <option value="datos">{labels.data}</option>
          <option value="inspiraciones">{labels.inspirations}</option>
          <option value="prueba">{labels.trial}</option>
          {planning ? <option value="planning">{labels.planning || "Planning"}</option> : null}
        </select>
        {area === "inspiraciones" ? (
          <select className="field min-w-0 flex-1" aria-label="Look" value={look} onChange={(event) => setLook(event.target.value)}>
            <option value="maquillaje">{labels.makeup}</option>
            <option value="peinado">{labels.hair}</option>
          </select>
        ) : null}
        {area === "prueba" ? (
          <select className="field min-w-0 flex-1" aria-label="Prueba" value={trial} onChange={(event) => setTrial(event.target.value)}>
            <option value="fotos">{labels.photos}</option>
            <option value="productos">{labels.products}</option>
            <option value="comentarios">{labels.comments}</option>
          </select>
        ) : null}
        {area === "prueba" && trial === "productos" ? (
          <select className="field min-w-0 flex-1" aria-label="Look" value={look} onChange={(event) => setLook(event.target.value)}>
            <option value="maquillaje">{labels.makeup}</option>
            <option value="peinado">{labels.hair}</option>
          </select>
        ) : null}
      </div>
      {bars ? (
        <div className="hidden shrink-0 flex-col md:flex">
          <TabBar
            label={labels.data}
            current={area}
            onChange={setArea}
            tabs={[
              { id: "datos", label: labels.data },
              { id: "inspiraciones", label: labels.inspirations },
              { id: "prueba", label: labels.trial },
              ...(planning ? [{ id: "planning", label: labels.planning || "Planning" }] : []),
            ]}
          />
          {area === "inspiraciones" ? (
            <TabBar
              label={labels.inspirations}
              current={look}
              onChange={setLook}
              tabs={[
                { id: "maquillaje", label: labels.makeup },
                { id: "peinado", label: labels.hair },
              ]}
            />
          ) : null}
          {area === "prueba" ? (
            <TabBar
              label={labels.trial}
              current={trial}
              onChange={setTrial}
              tabs={[
                { id: "fotos", label: labels.photos },
                { id: "productos", label: labels.products },
                { id: "comentarios", label: labels.comments },
              ]}
            />
          ) : null}
          {area === "prueba" && trial === "productos" ? (
            <TabBar
              label={labels.products}
              current={look}
              onChange={setLook}
              tabs={[
                { id: "maquillaje", label: labels.makeup },
                { id: "peinado", label: labels.hair },
              ]}
            />
          ) : null}
        </div>
      ) : null}
      <div className="relative min-h-0 flex-1">
        {panels.map((panel) => (
          <div
            key={panel.id}
            hidden={!panel.show}
            data-portal-scroll={panel.show ? "" : undefined}
            className={panel.show ? "h-full overflow-y-auto overscroll-contain pb-16 pt-4" : undefined}
          >
            {panel.node}
          </div>
        ))}
      </div>
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
  trialComments,
  planning,
  variant = "tabs",
}: {
  labels: EventLabels;
  section?: string;
  details: ReactNode;
  makeupInspiration: ReactNode;
  hairInspiration: ReactNode;
  photos: ReactNode;
  makeupProducts: ReactNode;
  hairProducts: ReactNode;
  trialComments: ReactNode;
  planning?: ReactNode;
  variant?: "tabs" | "filters" | "responsive";
}) {
  if (variant === "filters" || variant === "responsive") {
    return (
      <EventFilters
        bars={variant === "responsive"}
        labels={labels}
        section={section}
        details={details}
        makeupInspiration={makeupInspiration}
        hairInspiration={hairInspiration}
        photos={photos}
        makeupProducts={makeupProducts}
        hairProducts={hairProducts}
        trialComments={trialComments}
        planning={planning}
      />
    );
  }
  const focus = eventFocus(section);
  return (
    <SubTabs
      fill
      initial={
        focus.area === "prueba" || focus.area === "inspiraciones" || focus.area === "planning" ? focus.area : "datos"
      }
      tabs={[
        { id: "datos", label: labels.data, body: details },
        {
          id: "inspiraciones",
          label: labels.inspirations,
          nested: true,
          body: (
            <SubTabs
              fill
              initial={focus.look}
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
              initial={focus.trial}
              tabs={[
                { id: "fotos", label: labels.photos, body: photos },
                {
                  id: "productos",
                  label: labels.products,
                  nested: true,
                  body: (
                    <SubTabs
                      fill
                      initial={focus.look}
                      tabs={[
                        { id: "maquillaje", label: labels.makeup, body: makeupProducts },
                        { id: "peinado", label: labels.hair, body: hairProducts },
                      ]}
                    />
                  ),
                },
                { id: "comentarios", label: labels.comments, body: trialComments },
              ]}
            />
          ),
        },
        ...(planning
          ? [{ id: "planning", label: labels.planning || "Planning", body: planning }]
          : []),
      ]}
    />
  );
}
