import { PhotoGrid, PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { portalEs, type PortalCopy } from "@/lib/i18n/portal-messages";
import { filesFor, type PortalFile } from "@/lib/portal/types";

export function WorkView({
  title,
  products,
  photos,
  clientId,
  copy = portalEs,
}: {
  title?: string;
  products: string;
  photos: PortalFile[];
  clientId: string;
  copy?: PortalCopy;
}) {
  return (
    <div className="flex flex-col gap-4">
      {title ? (
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">{title}</p>
      ) : null}
      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">{copy.productsUsed}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{products || copy.productsEmpty}</p>
      </div>
      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-ash">{copy.trialPhotos}</p>
        <div className="mt-3">
          {photos.length ? (
            <PhotoGrid files={photos} clientId={clientId} kind="work" />
          ) : (
            <p className="text-sm text-ash">{copy.trialPhotosEmpty}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkForm({
  clientId,
  personKey,
  productsName,
  products,
  photos,
  tab,
}: {
  clientId: string;
  personKey: string;
  productsName: string;
  products: string;
  photos: PortalFile[];
  tab: string;
}) {
  const shown = filesFor(photos, personKey);
  return (
    <div className="flex flex-col gap-6">
      <form action="/api/admin/studio" method="post" className="flex flex-col gap-4">
        <input type="hidden" name="clientId" value={clientId} />
        <input type="hidden" name="tab" value={tab} />
        <label className="field-label">
          Productos utilizados
          <textarea className="field min-h-24" name={productsName} defaultValue={products} />
        </label>
        <button className="btn-atelier self-start" type="submit">
          Guardar productos
        </button>
      </form>
      <PhotoPicker
        personKey={personKey}
        files={photos}
        clientId={clientId}
        action="/api/admin/work"
        fieldName="person"
        label="Fotos de la prueba"
        tab={tab}
        kind="work"
      />
      {!shown.length ? (
        <p className="text-sm text-ash">Cuando cuelgues las fotos de la prueba, ella las verá aquí.</p>
      ) : null}
    </div>
  );
}
