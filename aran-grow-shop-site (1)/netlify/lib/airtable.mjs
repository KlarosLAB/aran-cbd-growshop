// The inventory lives in an Airtable base that the shop owner edits. This file is the only one
// that talks to Airtable. The access token stays on the server and never reaches the browser.
import { slugify } from "./shared.mjs";

export const TABLES = { products: "Productos", orders: "Pedidos", reviews: "Reseñas" };
const API = "https://api.airtable.com/v0/";

function cfg() {
  const token = Netlify.env.get("AIRTABLE_TOKEN"), base = Netlify.env.get("AIRTABLE_BASE_ID");
  if (!token || !base) throw new Error("AIRTABLE_TOKEN and AIRTABLE_BASE_ID must be set");
  return { token, base };
}
async function call(path, init) {
  const { token, base } = cfg();
  const r = await fetch(API + base + "/" + path, { ...init, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" } });
  if (!r.ok) throw new Error(`Airtable ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

/** Every record of a table (one request per 100 records). */
export async function listAll(table) {
  const out = [];
  let offset = "";
  do {
    const d = await call(encodeURIComponent(table) + "?pageSize=100" + (offset ? "&offset=" + encodeURIComponent(offset) : ""));
    out.push(...d.records);
    offset = d.offset || "";
  } while (offset);
  return out;
}
export async function updateRecords(table, records) {
  for (let i = 0; i < records.length; i += 10) {
    await call(encodeURIComponent(table), { method: "PATCH", body: JSON.stringify({ records: records.slice(i, i + 10), typecast: true }) });
  }
}
export async function createRecord(table, fields) {
  const d = await call(encodeURIComponent(table), { method: "POST", body: JSON.stringify({ records: [{ fields }], typecast: true }) });
  return d.records[0];
}

/* ---------- Reading the owner's table. Cells are read leniently so a CSV import (all text) works too. ---------- */
const text = (v) => (v == null ? "" : typeof v === "object" && !Array.isArray(v) && v.name ? String(v.name) : Array.isArray(v) ? v.join(", ") : String(v)).trim();
const num = (v) => {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v == null ? "" : v).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const bool = (v) => v === true || /^(1|true|s[ií]|x|yes|✓)$/i.test(text(v));
const FAMILY = { flores: "flores", flor: "flores", extracciones: "extractos", extractos: "extractos", aceites: "aceites", aceite: "aceites", cosmetica: "cosmetica", gear: "gear", merch: "merch", pack: "pack", packs: "pack" };
const TYPE = { sativa: "sativa", indica: "indica", hibrida: "hibrida", "por-confirmar": "tbc" };
const EN = { "hidroponico": "Hydroponic", "indoor": "Indoor", "outdoor": "Outdoor", "premium": "Premium", "citrico": "Citrus", "dulce": "Sweet", "terroso": "Earthy", "afrutado": "Fruity" };
const COLOURS = ["#6CFF3B", "#B26BFF", "#22E4FF", "#FF2BD6", "#FF8A1F"];
const colourOf = (id) => COLOURS[[...id].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7) % COLOURS.length];
const english = (es) => EN[slugify(es)] || es;

/**
 * Airtable rows -> shop items. Returns the items, the photos to copy to the site, and the
 * Airtable record id of each product (needed to write stock back).
 */
export function mapProducts(rows) {
  const items = [], images = [], recOf = {}, idOfRec = {}, packRefs = {};
  for (const r of rows) {
    const f = r.fields || {};
    const name = text(f["Nombre"]), cat = FAMILY[slugify(text(f["Familia"]))], price = Math.round(num(f["Precio"]) * 100);
    const id = slugify(text(f["Código"])) || slugify(name);
    if (!name || !id || !cat || !(price > 0) || recOf[id]) continue;        // incomplete or duplicated rows stay off the shop
    const grow = text(f["Cultivo"]), aroma = text(f["Aroma"]), detail = text(f["Detalle"]);
    const p = {
      id, name, brand: text(f["Marca"]) || (cat === "pack" ? "Pack" : ""), cat, price, frm: bool(f["Desde"]),
      es: detail, en: text(f["Detalle EN"]) || detail, bg: colourOf(id), img: "", sample: false,
      type: TYPE[slugify(text(f["Tipo"]))] || "", stars: Math.max(0, Math.min(5, Math.round(num(f["Estrellas CBD"])))),
      grow_es: grow, grow_en: english(grow), aroma_es: aroma, aroma_en: english(aroma),
      confirmed: bool(f["Ficha confirmada"]), stock: Math.max(0, Math.floor(num(f["Stock"]))), active: bool(f["Visible"]),
      name_en: text(f["Nombre EN"]), reco: bool(f["Recomendado"]), sort: Math.floor(num(f["Orden"])),
    };
    const photo = f["Foto"];
    if (Array.isArray(photo) && photo[0] && photo[0].id && photo[0].url) {
      images.push({ key: photo[0].id, url: photo[0].url, type: photo[0].type || "image/jpeg" });
      p.img = "/img/u/" + photo[0].id;
    } else if (/^https:\/\//.test(text(photo))) p.img = text(photo);
    if (cat === "pack") packRefs[id] = f["Productos del pack"];
    recOf[id] = r.id; idOfRec[r.id] = id;
    items.push(p);
  }
  const bySlug = Object.fromEntries(items.map((p) => [slugify(p.name), p.id]));
  for (const p of items) {
    if (p.cat !== "pack") continue;
    const ref = packRefs[p.id];
    const parts = Array.isArray(ref) ? ref : text(ref).split(/[,;\n]/);
    p.items = parts.map((x) => idOfRec[x] || (recOf[slugify(x)] ? slugify(x) : bySlug[slugify(x)])).filter(Boolean);
  }
  return { items, images, recOf };
}

export function mapReviews(rows) {
  return rows.map((r) => ({ f: r.fields || {}, id: r.id }))
    .filter((r) => bool(r.f["Visible"]) && text(r.f["Autor"]) && text(r.f["Texto"]))
    .map((r) => ({ id: r.id, author: text(r.f["Autor"]), rating: Math.max(1, Math.min(5, Math.round(num(r.f["Estrellas"])) || 5)), text: text(r.f["Texto"]), when: text(r.f["Fecha mostrada"]) }))
    .slice(0, 12);
}
