import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import type { ProductLook, UsedProduct } from "@/lib/portal/types";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function productsFrom(form: FormData, prefix: string, look: ProductLook): UsedProduct[] {
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
    rows.push({ brand, name, shade, zone: zone || "Otra", look });
  }
  return rows;
}

function mergeLook(existing: UsedProduct[], incoming: UsedProduct[], look: ProductLook) {
  return [...existing.filter((product) => (product.look || "maquillaje") !== look), ...incoming];
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const tab = text(form.get("tab")) || "contratante";
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  if (text(form.get("intent")) === "notes") {
    const makeupNotes = text(form.get("makeupNotes"));
    const hairNotes = text(form.get("hairNotes"));
    if (text(form.get("productTarget")) === "person") {
      const index = Number(text(form.get("personIndex")));
      const person = client.event.people[index];
      if (person) {
        person.makeupNotes = makeupNotes;
        person.hairNotes = hairNotes;
      }
    } else {
      client.event.makeupNotes = makeupNotes;
      client.event.hairNotes = hairNotes;
    }
    await saveClient(client);
    const section = text(form.get("section"));
    const extra = section ? `&sec=${encodeURIComponent(section)}` : "";
    return go(request, `/privado/novias/${client.id}?tab=${encodeURIComponent(tab)}${extra}&ok=estudio`);
  }
  const lookRaw = text(form.get("productLook"));
  const look = lookRaw === "peinado" || lookRaw === "maquillaje" ? lookRaw : "";
  if (look && text(form.get("productTarget")) === "event") {
    client.event.products = mergeLook(client.event.products, productsFrom(form, "products.", look), look);
    if (client.event.products.length) client.event.productsUsed = "";
  } else if (form.has("products.0.brand") || form.has("products.0.name") || form.has("products.0.zone")) {
    const products = productsFrom(form, "products.", "maquillaje");
    client.event.products = products;
    if (products.length) client.event.productsUsed = "";
  } else if (form.has("productsUsed")) {
    client.event.productsUsed = text(form.get("productsUsed"));
  }
  const personRaw = text(form.get("personIndex"));
  if (look && personRaw !== "" && text(form.get("productTarget")) === "person") {
    const index = Number(personRaw);
    const person = client.event.people[index];
    if (person) {
      const prefix = `people.${index}.products.`;
      person.products = mergeLook(person.products, productsFrom(form, prefix, look), look);
      if (person.products.length) person.productsUsed = "";
    }
  } else {
    client.event.people = client.event.people.map((person, i) => {
      const prefix = `people.${i}.products.`;
      if (!form.has(`${prefix}0.brand`) && !form.has(`${prefix}0.name`) && !form.has(`${prefix}0.zone`)) {
        const key = `people.${i}.productsUsed`;
        if (!form.has(key)) return person;
        return { ...person, productsUsed: text(form.get(key)) };
      }
      const products = productsFrom(form, prefix, "maquillaje");
      return { ...person, products, productsUsed: products.length ? "" : person.productsUsed };
    });
  }
  await saveClient(client);
  const section = text(form.get("section"));
  const extra = section ? `&sec=${encodeURIComponent(section)}` : "";
  return go(request, `/privado/novias/${client.id}?tab=${encodeURIComponent(tab)}${extra}&ok=estudio`);
}
