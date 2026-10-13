import { go } from "@/lib/portal/http";
import { requireAdmin } from "@/lib/portal/session";
import { getClient, saveClient } from "@/lib/portal/store";
import { emptyPersonPayments, type PaymentSlice, type PersonPayments } from "@/lib/portal/types";

function money(value: FormDataEntryValue | null) {
  const n = Number.parseFloat(typeof value === "string" ? value : "");
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function sliceFrom(
  form: FormData,
  prefix: string,
  fallback: PaymentSlice,
): PaymentSlice {
  if (!form.has(`${prefix}Amount`)) return fallback;
  return {
    amount: money(form.get(`${prefix}Amount`)),
    paid: form.get(`${prefix}Paid`) === "on",
  };
}

function personFrom(
  form: FormData,
  prefix: string,
  fallback: PersonPayments,
  includeTrial: boolean,
): PersonPayments {
  return {
    deposit: sliceFrom(form, `${prefix}.deposit`, fallback.deposit),
    trial: includeTrial
      ? sliceFrom(form, `${prefix}.trial`, fallback.trial)
      : fallback.trial,
    event: sliceFrom(form, `${prefix}.event`, fallback.event),
  };
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return go(request, "/privado");
  const form = await request.formData();
  const id = String(form.get("clientId") ?? "");
  const client = await getClient(id);
  if (!client) return go(request, "/privado/novias?error=datos");
  const prev = client.payments;
  client.payments = {
    contractor: personFrom(form, "contractor", prev.contractor, true),
    guests: client.event.people.map((person, i) =>
      personFrom(form, `guests.${i}`, prev.guests[i] ?? emptyPersonPayments(), person.wantsTrial),
    ),
  };
  await saveClient(client);
  return go(request, `/privado/novias/${client.id}?tab=facturacion&ok=pagos`);
}
