import type { PortalFile } from "@/lib/portal/types";

function shiftLabel(label: string, removed: number) {
  const person = /^persona-(\d+)(-maquillaje|-peinado)?$/.exec(label);
  if (person) {
    const index = Number(person[1]);
    if (index === removed) return null;
    if (index > removed) return `persona-${index - 1}${person[2] || ""}`;
    return label;
  }
  const trial = /^prueba-persona-(\d+)$/.exec(label);
  if (trial) {
    const index = Number(trial[1]);
    if (index === removed) return null;
    if (index > removed) return `prueba-persona-${index - 1}`;
  }
  return label;
}

export function dropPersonFiles(files: PortalFile[], removed: number) {
  const keep: PortalFile[] = [];
  const drop: PortalFile[] = [];
  for (const file of files) {
    const label = shiftLabel(file.label, removed);
    if (label === null) drop.push(file);
    else keep.push(label === file.label ? file : { ...file, label });
  }
  return { keep, drop };
}
