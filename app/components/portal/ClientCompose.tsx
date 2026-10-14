"use client";

import { useMemo, useState } from "react";
import { ChangeRequestForm } from "@/app/components/portal/ChangeRequestForm";
import type { PortalCopy } from "@/lib/i18n/portal-messages";

export function ClientCompose({
  people,
  copy,
}: {
  people: { name: string; scope: "contratante" | "acompanante"; personIndex?: number }[];
  copy: PortalCopy;
}) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) => person.name.toLowerCase().includes(needle));
  }, [people, query]);

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <label className="field-label">
        {copy.searchName}
        <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {shown.length ? (
        shown.map((person) => (
          <div key={`${person.scope}-${person.personIndex ?? "ella"}`}>
            <h3 className="font-serif text-2xl">{person.name}</h3>
            <ChangeRequestForm copy={copy} scope={person.scope} personIndex={person.personIndex} />
          </div>
        ))
      ) : (
        <p className="text-sm text-ash">{copy.searchNameEmpty}</p>
      )}
    </div>
  );
}
