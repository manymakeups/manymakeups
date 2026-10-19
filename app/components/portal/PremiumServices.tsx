import { SubTabs } from "@/app/components/portal/SubTabs";
import type { EventPlanning, SidePlanning } from "@/lib/portal/types";

function Mark({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink">
      <input type="checkbox" name={name} defaultChecked={checked} />
      {label}
    </label>
  );
}

function SideForm({
  clientId,
  intent,
  plan,
}: {
  clientId: string;
  intent: "glitter" | "beauty";
  plan: SidePlanning;
}) {
  return (
    <form action="/api/admin/premium" method="post" className="grid max-w-xl gap-4">
      <input type="hidden" name="clientId" value={clientId} />
      <label className="field-label">
        Ubicación
        <input className="field" name="location" defaultValue={plan.location} />
      </label>
      <label className="field-label">
        Dirección
        <input className="field" name="address" defaultValue={plan.address} />
      </label>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">Llegada y montaje</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Desde
          <input className="field" name="arrivalTime" type="time" defaultValue={plan.arrivalTime} />
        </label>
        <label className="field-label">
          Hasta
          <input className="field" name="arrivalEnd" type="time" defaultValue={plan.arrivalEnd} />
        </label>
      </div>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">Horario</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Desde
          <input className="field" name="start" type="time" defaultValue={plan.start} />
        </label>
        <label className="field-label">
          Hasta
          <input className="field" name="end" type="time" defaultValue={plan.end} />
        </label>
      </div>
      <label className="field-label">
        Nota
        <textarea className="field min-h-24" name="note" defaultValue={plan.note} />
      </label>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gilt">Desmontaje</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Desde
          <input className="field" name="packUpTime" type="time" defaultValue={plan.packUpTime} />
        </label>
        <label className="field-label">
          Hasta
          <input className="field" name="packUpEnd" type="time" defaultValue={plan.packUpEnd} />
        </label>
      </div>
      <label className="field-label">
        Nota del desmontaje
        <input className="field" name="packUp" defaultValue={plan.packUp} />
      </label>
      <div className="flex flex-wrap gap-3">
        <button className="btn-atelier btn-atelier-solid" type="submit" name="intent" value={intent}>
          Guardar planning
        </button>
        <button className="btn-atelier" type="submit" name="intent" value={`${intent}-send`}>
          Guardar y enviar por mail
        </button>
      </div>
    </form>
  );
}

export function PremiumServices({
  clientId,
  glitterBar,
  beautyCorner,
  planning,
  section,
}: {
  clientId: string;
  glitterBar: boolean;
  beautyCorner: boolean;
  planning: EventPlanning;
  section?: string;
}) {
  return (
    <SubTabs
      fill
      initial={section}
      tabs={[
        {
          id: "servicios",
          label: "Servicios",
          body: (
            <form action="/api/admin/premium" method="post" className="grid max-w-xl gap-4">
              <input type="hidden" name="clientId" value={clientId} />
              <input type="hidden" name="intent" value="marks" />
              <p className="max-w-xl text-sm text-ash">
                Marca el servicio para abrir su pestaña de planning. Si lo quitas, el horario se guarda pero deja de verse.
              </p>
              <fieldset className="grid gap-3">
                <legend className="field-label mb-1">Servicios premium</legend>
                <Mark name="glitterBar" label="Glitter Bar" checked={glitterBar} />
                <Mark name="beautyCorner" label="Beauty Corner" checked={beautyCorner} />
              </fieldset>
              <button className="btn-atelier btn-atelier-solid self-start" type="submit">
                Guardar
              </button>
            </form>
          ),
        },
        ...(glitterBar
          ? [{ id: "glitter", label: "Planning · Glitter Bar", body: <SideForm clientId={clientId} intent="glitter" plan={planning.glitter} /> }]
          : []),
        ...(beautyCorner
          ? [{ id: "beauty", label: "Planning · Beauty Corner", body: <SideForm clientId={clientId} intent="beauty" plan={planning.beauty} /> }]
          : []),
      ]}
    />
  );
}
