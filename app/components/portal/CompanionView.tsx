import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { EventSections } from "@/app/components/portal/SubTabs";
import { LookNotesView, WorkView } from "@/app/components/portal/WorkBlock";
import type { PortalCopy } from "@/lib/i18n/portal-messages";
import {
  filesFor,
  personInspirationLookKey,
  personTrialPhotoKey,
  productsFor,
  type Attendee,
  type PortalFile,
} from "@/lib/portal/types";

export function CompanionView({
  index,
  person,
  clientId,
  inspiration,
  workPhotos,
  copy,
  section,
}: {
  index: number;
  person: Attendee;
  clientId: string;
  inspiration: PortalFile[];
  workPhotos: PortalFile[];
  copy: PortalCopy;
  section?: string;
}) {
  const labels = {
    data: copy.eventData,
    inspirations: copy.inspirationsTab,
    makeup: copy.makeupTab,
    hair: copy.hairTab,
    trial: copy.trialHeading,
    photos: copy.photosTab,
    products: copy.productsTab,
    notes: copy.notesTab,
  };
  return (
    <article className="flex h-full min-h-0 flex-1 flex-col">
        <EventSections
          labels={labels}
          section={section}
          details={
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-ash">{copy.personName}</dt>
                <dd className="mt-1">{person.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-ash">{copy.who}</dt>
                <dd className="mt-1">{copy.whoOptions[person.who] || person.who || "—"}</dd>
              </div>
              <div>
                <dt className="text-ash">{copy.service}</dt>
                <dd className="mt-1">{copy.serviceOptions[person.service] || person.service}</dd>
              </div>
              <div>
                <dt className="text-ash">{copy.allergies}</dt>
                <dd className="mt-1 whitespace-pre-wrap">{person.skinNotes || "—"}</dd>
              </div>
              <div>
                <dt className="text-ash">{copy.extraNotes}</dt>
                <dd className="mt-1 whitespace-pre-wrap">{person.notes || "—"}</dd>
              </div>
              <div>
                <dt className="text-ash">{copy.wantsTrial}</dt>
                <dd className="mt-1">{person.wantsTrial ? copy.trialYes : copy.trialNo}</dd>
              </div>
              {person.wantsTrial ? (
                <div>
                  <dt className="text-ash">{copy.trialNotes}</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{person.trialNotes || "—"}</dd>
                </div>
              ) : null}
            </dl>
          }
          makeupInspiration={
            <PhotoPicker
              personKey={personInspirationLookKey(index, "maquillaje")}
              files={inspiration}
              clientId={clientId}
              action="/api/portal/inspiration"
              tab="acompanantes"
              section={`${index}-maquillaje`}
              localize
            />
          }
          hairInspiration={
            <PhotoPicker
              personKey={personInspirationLookKey(index, "peinado")}
              files={inspiration}
              clientId={clientId}
              action="/api/portal/inspiration"
              tab="acompanantes"
              section={`${index}-peinado`}
              localize
            />
          }
          photos={
            <WorkView
              part="photos"
              products={person.productsUsed}
              photos={filesFor(workPhotos, personTrialPhotoKey(index))}
              clientId={clientId}
              copy={copy}
            />
          }
          makeupProducts={
            <WorkView
              part="products"
              products={person.productsUsed}
              productLines={productsFor(person.products, "maquillaje")}
              photos={[]}
              clientId={clientId}
              copy={copy}
            />
          }
          hairProducts={
            <WorkView
              part="products"
              products={person.productsUsed}
              productLines={productsFor(person.products, "peinado")}
              photos={[]}
              clientId={clientId}
              copy={copy}
            />
          }
          notes={
            <LookNotesView
              makeupNotes={person.makeupNotes}
              hairNotes={person.hairNotes}
              makeupLabel={copy.makeupTab}
              hairLabel={copy.hairTab}
              empty="—"
            />
          }
        />
    </article>
  );
}
