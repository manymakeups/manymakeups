import { ChangeRequestForm } from "@/app/components/portal/ChangeRequestForm";
import { PhotoPicker } from "@/app/components/portal/PhotoPicker";
import { WorkView } from "@/app/components/portal/WorkBlock";
import { interpolate, type PortalCopy } from "@/lib/i18n/portal-messages";
import {
  filesFor,
  personInspirationKey,
  personTrialPhotoKey,
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
}: {
  index: number;
  person: Attendee;
  clientId: string;
  inspiration: PortalFile[];
  workPhotos: PortalFile[];
  copy: PortalCopy;
}) {
  const who = copy.whoOptions[person.who] || person.who || interpolate(copy.personN, { n: index + 1 });
  return (
    <article className="border border-ink/10 bg-linen/30 p-5">
      <p className="text-[0.68rem] uppercase tracking-[0.18em] text-gilt">
        {interpolate(copy.personN, { n: index + 1 })}
      </p>
      <p className="mt-2 font-serif text-2xl">{who}</p>
      <p className="mt-1 text-sm text-ash">{copy.serviceOptions[person.service] || person.service}</p>
      <dl className="mt-4 space-y-3 text-sm">
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
      {person.wantsTrial ? (
        <div className="mt-6 border-t border-ink/10 pt-6">
          <WorkView
            products={person.productsUsed}
            photos={filesFor(workPhotos, personTrialPhotoKey(index))}
            clientId={clientId}
            copy={copy}
          />
        </div>
      ) : null}
      <div className="mt-6">
        <PhotoPicker
          personKey={personInspirationKey(index)}
          files={inspiration}
          clientId={clientId}
          action="/api/portal/inspiration"
          tab="acompanantes"
          localize
        />
      </div>
      <ChangeRequestForm copy={copy} scope="acompanante" personIndex={index} />
    </article>
  );
}
