import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import type { UsedProduct } from "@/lib/portal/types";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function productsFrom(form: FormData, prefix: string): UsedProduct[] {
  const rows: UsedProduct[] = [];
  for (let i = 0; i < 40; i += 1) {
    if (!form.has(`${prefix}${i}.brand`) && !form.has(`${prefix}${i}.name`) && !form.has(`${prefix}${i}.zone`)) break;
    const brand = text(form.get(`${prefix}${i}.brand`));
    const name = text(form.get(`${prefix}${i}.name`));
    const shade = text(form.get(`${prefix}${i}.shade`));
    const picked = text(form.get(`${prefix}${i}.zone`));
    const custom = text(form.get(`${prefix}${i}.zoneCustom`));
    const zone = picked === "Otra" ? custom : picked;
    if (!brand && !name && !shade && !zone) continue;
    rows.push({ brand, name, shade, zone: zone || "Otra" });
  }
  return rows;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const tab = text(form.get("tab")) || "contratante";
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  if (form.has("products.0.brand") || form.has("products.0.name") || form.has("products.0.zone")) {
    const products = productsFrom(form, "products.");
    client.event.products = products;
    if (products.length) client.event.productsUsed = "";
  } else if (form.has("productsUsed")) {
    client.event.productsUsed = text(form.get("productsUsed"));
  }
  client.event.people = client.event.people.map((person, i) => {
    const prefix = `people.${i}.products.`;
    if (!form.has(`${prefix}0.brand`) && !form.has(`${prefix}0.name`) && !form.has(`${prefix}0.zone`)) {
      const key = `people.${i}.productsUsed`;
      if (!form.has(key)) return person;
      return { ...person, productsUsed: text(form.get(key)) };
    }
    const products = productsFrom(form, prefix);
    return { ...person, products, productsUsed: products.length ? "" : person.productsUsed };
  });
  await saveClient(client);
  const section = text(form.get("section"));
  const extra = section ? `&sec=${encodeURIComponent(section)}` : "";
  return go(request, `/privado/novias/${client.id}?tab=${encodeURIComponent(tab)}${extra}&ok=estudio`);
}
