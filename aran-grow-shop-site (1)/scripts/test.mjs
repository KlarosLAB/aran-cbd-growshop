// End-to-end check of the server side with a stand-in for Airtable and for the payment provider.
// Run: npm test
import { BlobsServer } from "@netlify/blobs/server";
import Stripe from "stripe";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PRODUCT_ROWS } from "./airtable-rows.mjs";

// local blob storage
const blobs = new BlobsServer({ directory: mkdtempSync(join(tmpdir(), "ags-")), token: "t" });
const { port } = await blobs.start();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}`, token: "t", siteID: "site" })).toString("base64");
Object.assign(process.env, { AIRTABLE_TOKEN: "pat_test", AIRTABLE_BASE_ID: "appTEST", SYNC_KEY: "una-clave-de-sync-larga", STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_test" });
globalThis.Netlify = { env: { get: (k) => process.env[k] } };
console.error = () => {};   // expected noise: cache purge is unavailable outside Netlify, and the forged webhook is logged

// stand-in Airtable: three tables in memory, counting requests
const tables = { "Productos": PRODUCT_ROWS.map((f, i) => ({ id: "recP" + i, fields: Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "" && v !== false)) })), "Pedidos": [], "Reseñas": [] };
let airtableCalls = 0, stripeCall = null;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  if (url.startsWith("https://api.airtable.com/v0/appTEST/")) {
    airtableCalls++;
    assert.equal(init.headers.Authorization, "Bearer pat_test");
    const table = tables[decodeURIComponent(url.split("/")[5].split("?")[0])];
    const body = init.body ? JSON.parse(init.body) : null;
    if (!init.method || init.method === "GET") return Response.json({ records: table });
    if (init.method === "PATCH") { for (const r of body.records) Object.assign(table.find((x) => x.id === r.id).fields, r.fields); return Response.json({ records: body.records }); }
    if (init.method === "POST") { const made = body.records.map((r) => ({ id: "recN" + table.length, fields: r.fields })); table.push(...made); return Response.json({ records: made }); }
  }
  if (url.startsWith("https://api.stripe.com/")) {
    stripeCall = { body: new URLSearchParams(String(init.body)) };
    return new Response(JSON.stringify({ id: "cs_test_1", object: "checkout.session", url: "https://checkout.stripe.com/c/pay/cs_test_1" }), { status: 200, headers: { "content-type": "application/json", "request-id": "req_1" } });
  }
  if (url === "https://files.example/foto.jpg") return new Response(new Uint8Array([255, 216, 255, 224]), { headers: { "content-type": "image/jpeg" } });
  return realFetch(url, init);
};
const row = (id) => tables["Productos"].find((r) => r.fields["Código"] === id).fields;

const fn = async (name) => (await import(`../netlify/functions/${name}.mts`)).default;
const [page, seo, checkout, webhook, sync, cron, img] = await Promise.all(["page", "seo", "checkout", "payment-webhook", "sync", "sync-cron", "img"].map(fn));
const J = (path, body) => new Request("http://shop.test" + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const home = async () => (await page(new Request("http://shop.test/"), { params: {} })).text();
let ok = 0; const pass = (m) => { ok++; console.log("  ok", m); };

// first visit builds the shop's copy; later visits spend no Airtable requests
let html = await home();
assert.match(html, /CBD premium en el valle/); assert.match(html, /"live":true/); assert.ok(!html.includes("%%")); assert.match(html, /data-id="oly-amnesia-bb"/); assert.match(html, /Agotado/);
assert.ok(!/Acceso tienda|adminPw|ADMIN_PASSWORD|pat_test|una-clave-de-sync/.test(html));
const afterFirst = airtableCalls; await home(); await home(); await seo(new Request("http://shop.test/llms.txt"));
assert.equal(afterFirst, 2); assert.equal(airtableCalls, 2); pass("shop reads the inventory table once (2 requests), then serves visitors from its own copy; no panel, password or token in the page");

// the owner edits the table by hand, then opens the update address
row("oly-amnesia-bb")["Stock"] = 3; for (const id of ["oly-cannatonik-sb", "oly-v1", "oly-vainilla-sb"]) row(id)["Stock"] = "4";
row("hii-wonka")["Visible"] = false; delete row("hii-wonka")["Visible"];
tables["Productos"].push({ id: "recNEW", fields: { "Nombre": "Lemon Haze Indoor", "Marca": "Olympus CBD", "Familia": "Flores", "Precio": "18,50", "Stock": "7", "Visible": "sí", "Tipo": "Sativa", "Estrellas CBD": "4", "Detalle": "Flor indoor, 5 g", "Foto": [{ id: "attFOTO1", url: "https://files.example/foto.jpg", type: "image/jpeg" }] } });
tables["Productos"].push({ id: "recBAD", fields: { "Nombre": "Fila a medias", "Visible": true } });
tables["Reseñas"].push({ id: "recR1", fields: { "Autor": "Reseña de prueba", "Estrellas": 5, "Texto": "Texto de prueba", "Fecha mostrada": "hace 1 día", "Visible": true } }, { id: "recR2", fields: { "Autor": "Oculta", "Texto": "No debe salir" } });
assert.equal((await sync(new Request("http://shop.test/api/sync?key=mala"))).status, 403);
assert.equal((await sync(new Request("http://shop.test/api/sync"))).status, 403);
let r = await sync(new Request("http://shop.test/api/sync?key=una-clave-de-sync-larga")); assert.equal(r.status, 200); assert.match(await r.text(), /Web actualizada: 15 productos visibles y 1 reseñas/);
html = await home();
assert.match(html, /data-id="lemon-haze-indoor"/); assert.match(html, /18,50 €/); assert.match(html, /src="\/img\/u\/attFOTO1"/); assert.ok(!html.includes('data-id="hii-wonka"')); assert.ok(!html.includes("Fila a medias"));
assert.match(html, /Reseña de prueba/); assert.ok(!html.includes("No debe salir")); assert.ok(!html.includes('<span class="sample">Ejemplo</span></div><div class="stars"'));
r = await img(new Request("http://shop.test/img/u/attFOTO1"), { params: { key: "attFOTO1" } }); assert.equal(r.headers.get("content-type"), "image/jpeg"); assert.equal((await r.arrayBuffer()).byteLength, 4);
pass("update address needs its key; manual stock, a new CSV-style row, a hidden product, photos and reviews all reach the shop");
r = await page(new Request("http://shop.test/p/lemon-haze-indoor"), { params: { id: "lemon-haze-indoor" } }); assert.match(await r.text(), /<title>Lemon Haze Indoor · Olympus CBD \| Aran Grow Shop<\/title>/);
assert.equal((await page(new Request("http://shop.test/p/hii-wonka"), { params: { id: "hii-wonka" } })).status, 404); pass("product pages follow the table; hidden product is a 404");
const before = airtableCalls; await cron(); assert.equal(airtableCalls, before + 2); pass("4-hourly refresh costs 2 requests");

// checkout from the shop's copy: no Airtable requests, server-side prices
const c0 = airtableCalls;
r = await checkout(J("/api/checkout", { items: { "oly-amnesia-bb": 9 }, method: "ship" })); assert.equal(r.status, 409); assert.equal((await r.json()).problems[0].have, 3);
r = await checkout(J("/api/checkout", { items: { "oly-amnesia-bb": 2, "pack-valle": 1, "fake": 3 }, code: "aran10", method: "ship", lang: "es" })); assert.equal(r.status, 200);
const b = stripeCall.body;
assert.equal(b.get("line_items[0][price_data][unit_amount]"), "1350"); assert.equal(b.get("line_items[1][price_data][unit_amount]"), "7110"); assert.equal(b.get("line_items[2][quantity]"), null);
assert.equal(b.get("shipping_options[0][shipping_rate_data][fixed_amount][amount]"), "0"); assert.equal(b.get("metadata[items]"), "oly-amnesia-bb:2,pack-valle:1");
await checkout(J("/api/checkout", { items: { "oly-amnesia-bb": 1 }, method: "ship" })); assert.equal(stripeCall.body.get("shipping_options[0][shipping_rate_data][fixed_amount][amount]"), "600");
assert.equal(airtableCalls, c0); pass("checkout: stock limit, table prices, 10 % code, shipping rules, and no Airtable requests (cannot be used to burn the quota)");

// a sale: order row in Pedidos, units out of Stock (pack items too), once
const payload = JSON.stringify({ id: "evt_1", object: "event", type: "checkout.session.completed", data: { object: { id: "cs_test_ab12cd34", object: "checkout.session", payment_status: "paid", amount_total: 9810,
  customer_details: { email: "cliente@example.com", name: "Cliente Prueba", phone: "+34600000000" }, shipping_details: { name: "Cliente Prueba", address: { line1: "Calle Mayor 1", postal_code: "25530", city: "Vielha", country: "ES" } },
  metadata: { items: "oly-amnesia-bb:2,pack-valle:1", method: "ship" } } } });
const sig = new Stripe("sk_test_x").webhooks.generateTestHeaderString({ payload, secret: "whsec_test" });
const hook = (s) => webhook(new Request("http://shop.test/api/payment-webhook", { method: "POST", headers: { "stripe-signature": s }, body: payload }));
assert.equal((await hook("t=1,v1=bad")).status, 400);
const w0 = airtableCalls;
assert.equal(await (await hook(sig)).text(), "recorded"); assert.equal(airtableCalls, w0 + 3);
assert.equal(await (await hook(sig)).text(), "duplicate"); assert.equal(airtableCalls, w0 + 3);
assert.deepEqual(["oly-amnesia-bb", "oly-cannatonik-sb", "oly-v1", "oly-vainilla-sb"].map((id) => row(id)["Stock"]), [1, 3, 3, 3]);
const o = tables["Pedidos"][0].fields; assert.equal(tables["Pedidos"].length, 1);
assert.equal(o["Pedido"], "AB12CD34"); assert.equal(o["Dirección"], "Calle Mayor 1, 25530, Vielha, ES"); assert.equal(o["Productos"], "2 × Amnesia Haze Premium Big Bud\n1 × Pack Valle"); assert.equal(o["Total"], 98.1); assert.equal(o["Estado"], "Pagado");
html = await home(); assert.match(html, /Queda 1/); pass("forged notice rejected; a sale writes one Pedidos row and lowers Stock in the table (3 requests); the shop shows the new stock");

const txt = async (p) => (await seo(new Request("http://shop.test" + p))).text();
assert.match(await txt("/sitemap.xml"), /<loc>http:\/\/shop\.test\/p\/lemon-haze-indoor<\/loc>/); assert.match(await txt("/robots.txt"), /GPTBot[\s\S]*Sitemap:/); assert.match(await txt("/llms.txt"), /Lemon Haze Indoor\]\(http:\/\/shop\.test\/p\/lemon-haze-indoor\).*En stock/); pass("sitemap, robots and llms.txt follow the table");

await blobs.stop();
console.log(`\n${ok} checks passed · Airtable requests used in the whole run: ${airtableCalls}`);
process.exit(0);
