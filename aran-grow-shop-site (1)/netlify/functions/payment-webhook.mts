// The payment provider calls this when a payment is completed: the order goes into the
// Pedidos table and its units come out of Stock.
import type { Config } from "@netlify/functions";
import { readPaidOrder } from "../lib/payments.mjs";
import { fulfilOrder } from "../lib/catalog.mjs";

export default async (req: Request) => {
  let order;
  try { order = await readPaidOrder(req); }
  catch (e) { console.error("webhook rejected", e); return new Response("invalid", { status: 400 }); }
  if (!order) return new Response("ignored");
  return new Response(await fulfilOrder(order));
};

export const config: Config = { path: "/api/payment-webhook", method: "POST" };
