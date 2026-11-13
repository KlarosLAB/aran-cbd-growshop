// Checks the cart against the shop's copy of the inventory (prices and stock never come from
// the browser) and opens the payment page.
import type { Config } from "@netlify/functions";
import { getCatalog } from "../lib/catalog.mjs";
import { cartTotals, indexById } from "../lib/shared.mjs";
import { SHOP } from "../lib/content.mjs";
import { createPayment } from "../lib/payments.mjs";
import { json } from "../lib/http.mjs";

export default async (req: Request) => {
  const body: any = await req.json().catch(() => null);
  if (!body || typeof body.items !== "object" || body.items === null) return json({ error: "Pedido no válido." }, 400);
  const cart: Record<string, number> = {};
  for (const id of Object.keys(body.items).slice(0, 20)) {
    const q = Math.floor(Number(body.items[id]));
    if (q > 0 && q <= 50) cart[String(id).slice(0, 80)] = q;
  }
  const byId = indexById((await getCatalog()).items.filter((p: any) => p.active));
  const codeOn = String(body.code || "").trim().toUpperCase() === SHOP.code;
  const method = body.method === "pickup" ? "pickup" : "ship";
  const totals = cartTotals(cart, byId, { codeOn, method, shop: SHOP });
  if (!totals.n) return json({ error: "La cesta está vacía." }, 400);
  if (totals.problems.length) return json({ error: "Sin stock suficiente.", problems: totals.problems }, 409);
  try {
    const url = await createPayment({ totals, method, lang: body.lang === "en" ? "en" : "es", origin: new URL(req.url).origin, codeOn });
    return json({ url });
  } catch (e) {
    console.error("payment could not be opened", e);
    return json({ error: "No se ha podido abrir el pago." }, 502);
  }
};

export const config: Config = { path: "/api/checkout", method: "POST", rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 20 } };
