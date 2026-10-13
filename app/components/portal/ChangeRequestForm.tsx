import type { PortalCopy } from "@/lib/i18n/portal-messages";

export function ChangeRequestForm({
  copy,
  scope,
  personIndex,
}: {
  copy: PortalCopy;
  scope: "contratante" | "acompanante";
  personIndex?: number;
}) {
  return (
    <form action="/api/portal/changes" method="post" className="mt-6 flex max-w-xl flex-col gap-3">
      <input type="hidden" name="scope" value={scope} />
      {personIndex != null ? <input type="hidden" name="personIndex" value={personIndex} /> : null}
      <label className="field-label">
        {copy.notifyChangesLead}
        <textarea
          className="field min-h-24"
          name="message"
          required
          minLength={4}
          placeholder={copy.notifyPlaceholder}
        />
      </label>
      <button className="btn-atelier self-start" type="submit">
        {copy.notifyChanges}
      </button>
    </form>
  );
}
