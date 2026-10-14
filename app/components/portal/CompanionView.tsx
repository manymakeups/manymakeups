import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { EventSections } from "@/app/components/portal/SubTabs";
import { WorkView } from "@/app/components/portal/WorkBlock";
import { interpolate, type PortalCopy } from "@/lib/i18n/portal-messages";
import { companionHeading } from "@/lib/portal/names";
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
  const who = companionHeading(person, copy.whoOptions, interpolate(copy.personN, { n: index + 1 }));
  const labels = {
    data: copy.eventData,
    inspirations: copy.inspirationsTab,
    makeup: copy.makeupTab,
    hair: copy.hairTab,
    trial: copy.trialHeading,
    photos: copy.photosTab,
    products: copy.productsTab,
  };
  return (
    <article className="border border-ink/10 bg-linen/30 p-5">
      <p className="font-serif text-2xl">{who}</p>
      <div className="mt-6">
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
              notes={person.makeupNotes}
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
              notes={person.hairNotes}
            />
          }
        />
      </div>
      <p className="sr-only">{interpolate(copy.personN, { n: index + 1 })}</p>
    </article>
  );
}
