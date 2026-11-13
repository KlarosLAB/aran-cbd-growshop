// The only file that knows about the payment provider. To change provider, rewrite these two
// functions and keep what they return; nothing else in the shop needs to change.
import Stripe from "stripe";
import { SHOP } from "./content.mjs";

function client() {
  const key = Netlify.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

/** Opens a hosted payment page for an already validated cart. Returns the URL to send the customer to. */
export async function createPayment({ totals, method, lang, origin, codeOn }) {
  const suffix = codeOn ? ` (−${SHOP.codePct} % ${SHOP.code})` : "";
  const params = {
    mode: "payment",
    locale: lang === "en" ? "en" : "es",
    line_items: totals.lines.map((l) => ({
      quantity: l.qty,
      price_data: { currency: "eur", unit_amount: l.unit, product_data: { name: l.name + suffix } },
    })),
    phone_number_collection: { enabled: true },
    custom_text: { submit: { message: lang === "en" ? "By paying you confirm you are 18 or older." : "Al pagar confirmas que tienes 18 años o más." } },
    metadata: { items: totals.lines.map((l) => l.id + ":" + l.qty).join(","), method, code: codeOn ? SHOP.code : "" },
    success_url: origin + "/?pago=ok",
    cancel_url: origin + "/?pago=cancelado",
  };
  if (method === "ship") {
    params.shipping_address_collection = { allowed_countries: ["ES"] };
    params.shipping_options = [{
      shipping_rate_data: {
        type: "fixed_amount",
        display_name: lang === "en" ? "Discreet shipping 24/48 h" : "Envío discreto 24/48 h",
        fixed_amount: { amount: totals.ship, currency: "eur" },
      },
    }];
  }
  const session = await client().checkout.sessions.create(params);
  return session.url;
}

/**
 * Verifies a notification from the payment provider. Returns the paid order, or null when the
 * notification is about something else. Throws when the signature is not valid.
 */
export async function readPaidOrder(req) {
  const secret = Netlify.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  const event = await client().webhooks.constructEventAsync(await req.text(), req.headers.get("stripe-signature") || "", secret);
  if (event.type !== "checkout.session.completed") return null;
  const s = event.data.object;
  if (s.payment_status !== "paid") return null;
  const ship = (s.collected_information && s.collected_information.shipping_details) || s.shipping_details || null;
  const a = ship && ship.address;
  const who = s.customer_details || {};
  return {
    sessionId: s.id,
    email: who.email || "",
    name: (ship && ship.name) || who.name || "",
    phone: who.phone || "",
    method: (s.metadata && s.metadata.method) || "ship",
    address: a ? [a.line1, a.line2, a.postal_code, a.city, a.state, a.country].filter(Boolean).join(", ") : "",
    cart: Object.fromEntries(String((s.metadata && s.metadata.items) || "").split(",").filter(Boolean).map((x) => { const i = x.lastIndexOf(":"); return [x.slice(0, i), Number(x.slice(i + 1))]; })),
    totalCents: s.amount_total || 0,
  };
}
