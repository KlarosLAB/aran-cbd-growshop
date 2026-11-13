// The shop serves visitors from a saved copy of the inventory table, so browsing never spends
// Airtable requests. The copy is renewed every few hours, on demand, and after each sale.
import { getStore } from "@netlify/blobs";
import { TABLES, listAll, updateRecords, createRecord, mapProducts, mapReviews } from "./airtable.mjs";
import { refreshPages } from "./http.mjs";

const shop = () => getStore({ name: "shop", consistency: "strong" });
const photos = () => getStore("product-images");

async function savePhotos(images) {
  const store = photos();
  for (const img of images) {
    try {
      if ((await store.getMetadata(img.key)) !== null) continue;     // Airtable photo links expire, so the site keeps its own copy
      const r = await fetch(img.url);
      if (!r.ok) throw new Error("download " + r.status);
      await store.set(img.key, await r.arrayBuffer(), { metadata: { type: img.type } });
    } catch (e) { console.error("photo not copied", img.key, e); }
  }
}

/** Reads the inventory table and saves a fresh copy for the shop. Two Airtable requests. */
export async function syncCatalog() {
  const [prows, rrows] = await Promise.all([listAll(TABLES.products), listAll(TABLES.reviews)]);
  const { items, images } = mapProducts(prows);
  await savePhotos(images);
  const catalog = { items, reviews: mapReviews(rrows), at: Date.now() };
  await shop().setJSON("catalog", catalog);
  await refreshPages();
  return catalog;
}

export async function getCatalog() {
  return (await shop().get("catalog", { type: "json" })) || (await syncCatalog());
}

/**
 * A payment was completed: write the order into the Pedidos table and take its units out of
 * Stock in the Productos table. Each payment is handled once. Three Airtable requests.
 */
export async function fulfilOrder(order) {
  const store = shop();
  const mark = await store.set("paid/" + order.sessionId, String(Date.now()), { onlyIfNew: true });
  if (!mark.modified) return "duplicate";
  let rec, items, recOf, updates = [], short = [];
  try {
    ({ items, recOf } = mapProducts(await listAll(TABLES.products)));
    const byId = Object.fromEntries(items.map((p) => [p.id, p]));
    const lines = [], units = {};
    for (const id of Object.keys(order.cart)) {
      const p = byId[id], qty = order.cart[id];
      if (!p || !(qty > 0)) continue;
      lines.push(qty + " × " + p.name);
      for (const part of p.cat === "pack" ? p.items || [] : [id]) units[part] = (units[part] || 0) + qty;
    }
    for (const id of Object.keys(units)) {
      const p = byId[id];
      if (!p) continue;
      if (units[id] > p.stock) short.push(p.name);
      p.stock = Math.max(0, p.stock - units[id]);
      updates.push({ id: recOf[id], fields: { Stock: p.stock } });
    }
    rec = await createRecord(TABLES.orders, {
      "Pedido": order.sessionId.slice(-8).toUpperCase(), "Fecha": new Date().toISOString(), "Cliente": order.name, "Email": order.email,
      "Teléfono": order.phone, "Entrega": order.method === "pickup" ? "Recogida en tienda" : "Envío", "Dirección": order.address,
      "Productos": lines.join("\n"), "Total": order.totalCents / 100, "Estado": short.length ? "Revisar stock" : "Pagado",
      "Referencia de pago": order.sessionId,
    });
  } catch (e) {
    await store.delete("paid/" + order.sessionId);      // nothing was written yet: let the payment provider try again
    throw e;
  }
  try {
    await updateRecords(TABLES.products, updates);
    const old = (await store.get("catalog", { type: "json" })) || {};
    await store.setJSON("catalog", { items, reviews: old.reviews || [], at: Date.now() });
    await refreshPages();
  } catch (e) {
    console.error("order saved but stock not updated", order.sessionId, e);
    try { await updateRecords(TABLES.orders, [{ id: rec.id, fields: { "Estado": "Revisar stock" } }]); } catch (x) { /* already logged */ }
  }
  return "recorded";
}

export { photos };
