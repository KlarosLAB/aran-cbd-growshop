// Shared by the server (page rendering, checkout) and the browser (the build inlines this file
// into the page with the "export" keywords removed). Keep it free of imports and of DOM/Node APIs.

export const INK = "#0B0D08";

export const FAMILIES = [
  ["flores", "Flores", "Flowers"],
  ["extractos", "Extracciones", "Extracts"],
  ["aceites", "Aceites", "Oils"],
  ["cosmetica", "Cosmética", "Cosmetics"],
  ["gear", "Gear", "Gear"],
  ["merch", "Merch", "Merch"],
];

export const LABELS = {
  es: {
    add: "Añadir", see: "Ver ficha", from: "desde", soldout: "Agotado", left: (n) => (n === 1 ? "Queda 1" : "Quedan " + n), sample: "Ejemplo",
    save: "Ahorras", reco: "Nuestro recomendado", packFree: "Envío gratis incluido",
    types: { sativa: "Sativa", indica: "Índica", hibrida: "Híbrida", tbc: "Tipo por confirmar" },
  },
  en: {
    add: "Add", see: "See card", from: "from", soldout: "Sold out", left: (n) => n + " left", sample: "Example",
    save: "You save", reco: "Our pick", packFree: "Free shipping included",
    types: { sativa: "Sativa", indica: "Indica", hibrida: "Hybrid", tbc: "Type to be confirmed" },
  },
};

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Money: all amounts are integer cents. */
export function money(cents, lang) {
  const v = (cents / 100).toFixed(2);
  if (lang === "en") return "€" + v.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return v.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
}

export function starStr(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export function slugify(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export function indexById(items) {
  const m = {};
  for (const p of items) m[p.id] = p;
  return m;
}

/** Units that can be sold: a pack can be sold as many times as its scarcest item allows. */
export function stockOf(p, byId) {
  if (p.cat !== "pack") return Math.max(0, p.stock | 0);
  if (!p.items || !p.items.length) return 0;
  return Math.min(...p.items.map((i) => (byId[i] && byId[i].active !== false ? Math.max(0, byId[i].stock | 0) : 0)));
}

export const SHAPES = {
  flores:
    `<rect x="60" y="46" width="80" height="86" rx="12" fill="#fff" stroke="${INK}" stroke-width="4"/>` +
    `<rect x="54" y="28" width="92" height="22" rx="6" fill="${INK}" stroke="#fff" stroke-width="2"/>` +
    `<g fill="#3FA52A" stroke="${INK}" stroke-width="3"><circle cx="84" cy="74" r="11"/><circle cx="104" cy="66" r="12"/><circle cx="120" cy="80" r="10"/></g>` +
    `<rect x="72" y="94" width="56" height="26" fill="#FF8A1F" stroke="${INK}" stroke-width="3"/>`,
  extractos:
    `<circle cx="100" cy="78" r="50" fill="${INK}" stroke="#fff" stroke-width="2"/><circle cx="100" cy="78" r="39" fill="#F4F6EA"/>` +
    `<rect x="74" y="62" width="52" height="34" rx="7" fill="#7A4B24" stroke="${INK}" stroke-width="4" transform="rotate(-12 100 78)"/>`,
  aceites:
    `<ellipse cx="100" cy="24" rx="10" ry="13" fill="${INK}" stroke="#fff" stroke-width="2"/><rect x="90" y="34" width="20" height="22" fill="${INK}" stroke="#fff" stroke-width="2"/>` +
    `<rect x="76" y="54" width="48" height="80" rx="9" fill="#8A4A16" stroke="${INK}" stroke-width="4"/>` +
    `<rect x="76" y="80" width="48" height="32" fill="#F4F6EA" stroke="${INK}" stroke-width="3"/>`,
  cosmetica:
    `<path d="M68 22H132L123 116H77Z" fill="#F4F6EA" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
    `<rect x="82" y="116" width="36" height="18" rx="3" fill="${INK}" stroke="#fff" stroke-width="2"/>` +
    `<circle cx="100" cy="66" r="15" fill="#FF8A1F" stroke="${INK}" stroke-width="3"/>`,
  gear:
    `<path d="M58 62H142L130 132H70Z" fill="#F4F6EA" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
    `<ellipse cx="100" cy="62" rx="42" ry="9" fill="#5A3A1C" stroke="${INK}" stroke-width="4"/>` +
    `<path d="M100 60V30M100 44C88 44 82 36 82 26 94 26 100 34 100 44ZM100 38C112 38 118 30 118 20 106 20 100 28 100 38Z" fill="#3FA52A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  merch:
    `<path d="M56 98a44 44 0 0 1 88 0Z" fill="#F4F6EA" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M98 98H170Q160 118 124 112Z" fill="${INK}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>` +
    `<circle cx="100" cy="76" r="12" fill="#3FA52A" stroke="${INK}" stroke-width="3"/>`,
};

/** Illustrated tile used until the product has a real photo. */
export function art(cat, bg) {
  const shape = SHAPES[cat] || SHAPES.flores;
  const c = /^#[0-9a-fA-F]{6}$/.test(bg || "") ? bg : "#B26BFF";
  return (
    `<svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">` +
    `<rect width="200" height="150" fill="#100A22"/><circle cx="100" cy="78" r="92" fill="${c}" opacity=".18"/>` +
    `<circle cx="100" cy="78" r="62" fill="${c}" opacity=".34"/>${shape}</svg>`
  );
}

export function picHTML(p, base) {
  if (p.img) {
    const src = /^(data:|https?:|\/)/.test(p.img) ? p.img : (base || "") + p.img;
    return `<img src="${esc(src)}" alt="${esc(p.name)}" loading="lazy">`;
  }
  return art(p.cat, p.bg);
}

export function stockBadge(n, L) {
  if (n <= 0) return `<span class="left out">${L.soldout}</span>`;
  if (n <= 3) return `<span class="left">${L.left(n)}</span>`;
  return "";
}

/** One product card. `lang` is "es" or "en"; `base` prefixes relative image and page links. */
export function cardHTML(p, byId, lang, base) {
  const L = LABELS[lang] || LABELS.es;
  const n = stockOf(p, byId);
  const meta = (lang === "en" ? p.en : p.es) || p.es || "";
  let spec = "";
  if (p.stars) {
    const ty = p.type ? `<span class="type t-${esc(p.type)}">${L.types[p.type] || ""}</span>` : "";
    spec = `<div class="spec">${ty}<span class="stars" role="img" aria-label="CBD ${p.stars}/5">${starStr(p.stars)}</span></div>`;
  }
  return (
    `<article class="card tilt${n <= 0 ? " soldout" : ""}" data-id="${esc(p.id)}" data-cat="${esc(p.cat)}" data-brand="${esc(p.brand)}">` +
    `<button class="pic open" aria-label="${esc(p.name)}">${picHTML(p, base)}<span class="bt">${esc(p.brand)}</span>` +
    `${p.sample ? `<span class="sample">${L.sample}</span>` : ""}${stockBadge(n, L)}</button>` +
    `<div class="body"><h3><a href="${base || ""}p/${esc(p.id)}">${esc(p.name)}</a></h3><p class="meta">${esc(meta)}</p>${spec}` +
    `<div class="row"><span class="tag">${p.frm ? `<small>${L.from}</small>` : ""}${money(p.price, lang)}</span>` +
    `<button class="add"${n <= 0 ? " disabled" : ""}>${n <= 0 ? L.soldout : L.add}</button></div></div></article>`
  );
}

/** Products the owner marked as featured (in stock). Falls back to flowers when none is marked. */
export function featured(items, byId) {
  const shop = items.filter((p) => p.active !== false && p.cat !== "pack" && stockOf(p, byId) > 0);
  const f = shop.filter((p) => p.feat);
  return (f.length ? f : shop.filter((p) => p.cat === "flores")).slice(0, 5);
}

/** Floating gallery for the home hero: picture first, name and price under it. */
export function floatersHTML(items, byId, lang, base) {
  const L = LABELS[lang] || LABELS.es;
  return featured(items, byId).map((p) => {
    const n = stockOf(p, byId);
    const ty = p.type && p.type !== "tbc" ? `<span class="type t-${esc(p.type)}">${L.types[p.type]}</span>` : "";
    const st = p.stars ? `<span class="stars" role="img" aria-label="CBD ${p.stars}/5">${starStr(p.stars)}</span>` : "";
    return (
      `<a class="floater" data-id="${esc(p.id)}" href="${base || ""}p/${esc(p.id)}"><span class="fpic">${picHTML(p, base)}${n <= 3 ? `<span class="left">${L.left(n)}</span>` : ""}</span>` +
      `<span class="fbody"><b>${esc(p.name)}</b><span class="spec">${ty}${st}</span>` +
      `<span class="frow"><span class="tag">${p.frm ? `<small>${L.from}</small>` : ""}${money(p.price, lang)}</span><span class="fgo">${L.see}</span></span></span></a>`
    );
  }).join("");
}

export function packHTML(p, byId, lang, freeShipCents) {
  const L = LABELS[lang] || LABELS.es;
  const n = stockOf(p, byId);
  const parts = (p.items || []).map((i) => byId[i]).filter(Boolean);
  const full = parts.reduce((s, x) => s + x.price, 0);
  const name = (lang === "en" && p.name_en) || p.name;
  return (
    `<article class="pack tilt${p.reco ? " star" : ""}${n <= 0 ? " soldout" : ""}" data-id="${esc(p.id)}">` +
    `${p.reco ? `<span class="reco">${L.reco}</span>` : ""}<h3>${esc(name)}</h3>` +
    `<ul>${parts.map((x) => `<li>${esc(x.name)}</li>`).join("")}</ul>` +
    (full > p.price ? `<p class="was"><s>${money(full, lang)}</s> ${L.save} <b>${money(full - p.price, lang)}</b></p>` : "") +
    (p.price >= freeShipCents ? `<p class="freeship">${L.packFree}</p>` : "") +
    `<div class="row"><span class="tag">${money(p.price, lang)}</span>` +
    `<button class="add"${n <= 0 ? " disabled" : ""}>${n <= 0 ? L.soldout : L.add}</button></div></article>`
  );
}

export function famsHTML(items, lang, current) {
  return FAMILIES.map(([key, es, en]) => {
    const n = items.filter((p) => p.cat === key).length;
    return (
      `<button class="fam" data-cat="${key}" aria-pressed="${key === current}">` +
      `<svg viewBox="30 10 140 130" aria-hidden="true">${SHAPES[key]}</svg><b>${lang === "en" ? en : es}</b><span>${n}</span></button>`
    );
  }).join("");
}

/**
 * The one place prices are added up. Used by the cart in the browser and again by the server
 * before charging, so the customer always pays what the cart showed.
 * cart: { id: qty }   opts: { codeOn, method: "ship" | "pickup", shop: { freeShip, shipCost, codePct } } (cents)
 */
export function cartTotals(cart, byId, opts) {
  const shop = opts.shop;
  const lines = [];
  let sub = 0, total = 0, n = 0;
  const problems = [];
  for (const id of Object.keys(cart || {})) {
    const p = byId[id];
    const qty = Math.floor(Number(cart[id]));
    if (!p || p.active === false || !(qty > 0)) continue;
    const have = stockOf(p, byId);
    if (qty > have) problems.push({ id, name: p.name, have });
    const unit = opts.codeOn ? Math.round((p.price * (100 - shop.codePct)) / 100) : p.price;
    lines.push({ id, name: p.name, brand: p.brand, qty, full: p.price, unit, total: unit * qty });
    sub += p.price * qty;
    total += unit * qty;
    n += qty;
  }
  const disc = sub - total;
  const ship = n === 0 || opts.method === "pickup" || total >= shop.freeShip ? 0 : shop.shipCost;
  return { lines, n, sub, disc, after: total, ship, total: total + ship, problems };
}

/* ---------- Reviews (Google-style cards). Only real reviews are shown as such; placeholders carry sample:true. ---------- */
export const REV_LABELS = {
  es: { ph: "Aquí va una reseña real, copiada tal cual de Google.", name: "Nombre del cliente", when: "Fecha", sample: "Ejemplo", src: "Reseñas de Google", count: (n) => (n === 1 ? "1 reseña" : n + " reseñas") },
  en: { ph: "A real review goes here, copied exactly from Google.", name: "Customer name", when: "Date", sample: "Example", src: "Google reviews", count: (n) => (n === 1 ? "1 review" : n + " reviews") },
};
const AVA = ["#22E4FF", "#FF2BD6", "#6CFF3B", "#FF8A1F", "#B26BFF"];

export function reviewsHTML(reviews, lang) {
  const L = REV_LABELS[lang] || REV_LABELS.es;
  return reviews.map((r, i) => {
    const name = r.sample ? L.name : r.author;
    const stars = Math.max(1, Math.min(5, r.rating | 0 || 5));
    return (
      `<article class="rev"><div class="rev-top"><span class="ava" style="background:${AVA[i % AVA.length]}">${esc((name || "?").trim().charAt(0).toUpperCase())}</span>` +
      `<div class="rev-who"><b>${esc(name)}</b><small>${esc(r.sample ? L.when : r.when || "")}</small></div>` +
      `${r.sample ? `<span class="sample">${L.sample}</span>` : ""}</div>` +
      `<div class="stars" role="img" aria-label="${stars}/5">${starStr(stars)}</div><p>${esc(r.sample ? L.ph : r.text)}</p></article>`
    );
  }).join("");
}

export function reviewsSummary(reviews, lang) {
  const L = REV_LABELS[lang] || REV_LABELS.es;
  const real = reviews.filter((r) => !r.sample);
  if (!real.length) return `<span class="stars">★★★★★</span> <span>${L.src}</span>`;
  const avg = real.reduce((s, r) => s + (r.rating | 0), 0) / real.length;
  const shown = avg.toFixed(1).replace(".", lang === "en" ? "." : ",");
  return `<b class="rev-avg">${shown}</b> <span class="stars">${starStr(Math.round(avg))}</span> <span>${L.count(real.length)} · ${L.src}</span>`;
}
