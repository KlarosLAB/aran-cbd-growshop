// Builds the full HTML of a page (home, product, family) with the catalogue written into it,
// so search engines and AI assistants read products, prices and stock without running JavaScript.
import * as S from "./shared.mjs";
import { SHOP, FAQ, FAM_SEO } from "./content.mjs";
import { template, appJs, sharedJs } from "./assets.mjs";

const LS = String.fromCharCode(0x2028), PS = String.fromCharCode(0x2029);
const safeJson = (v) => JSON.stringify(v).replace(/</g, "\\u003c").split(LS).join("\\u2028").split(PS).join("\\u2029");
const fill = (html, token, value) => html.split(token).join(value);

export const SAMPLE_REVIEWS = [{ sample: true, rating: 5 }, { sample: true, rating: 5 }, { sample: true, rating: 5 }];

function heroHome(base) {
  return `<section class="hero">
  <img class="hero-bg" src="${base}img/shop.webp" alt="Interior de Aran Grow Shop: vitrinas, neones y el logo de Olympus CBD Premium" width="1448" height="1086">
  <div class="wrap">
    <div class="hero-copy">
      <span class="neon" data-i18n="open">Open · online 24 h</span>
      <h1 class="grad" data-i18n="hero_h1">CBD premium en el valle.</h1>
      <p class="sub" data-i18n="hero_sub">Flores, extracciones y aceites de HiiCBD y Olympus CBD. Envío discreto en 24/48 h y recogida en la Val d'Aran.</p>
      <div class="cta">
        <a class="btn" href="#tienda" data-i18n="hero_cta1">Ver la estantería</a>
        <button class="btn btn-line" data-open-offer data-i18n="hero_cta2">Quiero mi 10 %</button>
        <span class="age" data-i18n="age">Solo +18</span>
      </div>
      <div class="dist">
        <span data-i18n="dist">Distribuidor de</span>
        <button class="brandchip" data-go-brand="HiiCBD" aria-label="HiiCBD"><img src="${base}img/hiicbd.webp" alt="HiiCBD" width="700" height="351"></button>
        <button class="brandchip" data-go-brand="Olympus CBD" aria-label="Olympus CBD"><img src="${base}img/olympus.webp" alt="Olympus CBD Premium" width="700" height="198"></button>
      </div>
    </div>
  </div>
</section>`;
}

function specRows(p, byId) {
  const L = S.LABELS.es, rows = [];
  const fam = S.FAMILIES.find((f) => f[0] === p.cat);
  const add = (k, v) => rows.push(`<dt>${k}</dt><dd>${S.esc(v)}</dd>`);
  if (fam) add("Familia", fam[1]);
  if (p.type) add("Tipo", L.types[p.type]);
  if (p.type) add("Cultivo", p.grow_es || "Por confirmar");
  if (p.es) add("Formato", p.es);
  if (p.stars) add("Potencia CBD", p.stars + " / 5");
  if (p.stars) add("THC", "Dentro del límite legal");
  if (p.type) add("Aroma", p.aroma_es || "Por confirmar");
  const n = S.stockOf(p, byId);
  add("Disponibilidad", n <= 0 ? "Agotado" : n <= 3 ? L.left(n) : "En stock");
  return rows.join("");
}

function heroProduct(p, byId, base) {
  const L = S.LABELS.es, n = S.stockOf(p, byId), fam = S.FAMILIES.find((f) => f[0] === p.cat);
  const spec = p.stars
    ? `<div class="spec">${p.type ? `<span class="type t-${S.esc(p.type)}">${L.types[p.type]}</span>` : ""}<span class="stars" role="img" aria-label="CBD ${p.stars}/5">${S.starStr(p.stars)}</span></div>`
    : "";
  return `<section class="hero phero">
  <div class="wrap">
    <div class="pic">${S.picHTML(p, base)}</div>
    <div data-id="${S.esc(p.id)}">
      <p class="crumbs"><a href="/">Aran Grow Shop</a> › ${fam ? `<a href="/c/${fam[0]}">${fam[1]}</a>` : "Packs"}</p>
      <h1 class="grad">${S.esc(p.name)}</h1>
      <p class="sub">${S.esc(p.brand)}${p.es ? ". " + S.esc(p.es) : ""}</p>
      ${spec}
      <dl>${specRows(p, byId)}</dl>
      <div class="row"><span class="tag">${p.frm ? `<small>${L.from}</small>` : ""}${S.money(p.price, "es")}</span>
      <button class="add"${n <= 0 ? " disabled" : ""}>${n <= 0 ? L.soldout : L.add}</button></div>
    </div>
  </div>
</section>`;
}

function heroCat(cat) {
  const [title, desc] = FAM_SEO[cat];
  return `<section class="hero chero">
  <div class="wrap">
    <p class="crumbs"><a href="/">Aran Grow Shop</a> › ${S.esc(title)}</p>
    <h1 class="grad">${S.esc(title)}</h1>
    <p class="sub">${S.esc(desc)}</p>
  </div>
</section>`;
}

function productLd(p, byId, siteUrl) {
  const n = S.stockOf(p, byId);
  const d = {
    "@type": "Product", "@id": `${siteUrl}/p/${p.id}#product`, name: p.name, sku: p.id, category: p.cat,
    description: [p.brand, p.es].filter(Boolean).join(". "),
    brand: { "@type": "Brand", name: p.brand }, url: `${siteUrl}/p/${p.id}`,
    offers: {
      "@type": "Offer", price: (p.price / 100).toFixed(2), priceCurrency: "EUR", url: `${siteUrl}/p/${p.id}`,
      availability: "https://schema.org/" + (n > 0 ? "InStock" : "OutOfStock"), seller: { "@id": `${siteUrl}/#store` },
    },
  };
  if (p.img) d.image = /^https?:/.test(p.img) ? p.img : siteUrl + (p.img.startsWith("/") ? "" : "/") + p.img;
  // Only confirmed specs are published as facts.
  if (p.confirmed && p.type && p.type !== "tbc") {
    d.additionalProperty = [
      { "@type": "PropertyValue", name: "Tipo", value: S.LABELS.es.types[p.type] },
      ...(p.stars ? [{ "@type": "PropertyValue", name: "Potencia CBD (1-5)", value: p.stars }] : []),
    ];
  }
  return d;
}

/**
 * @param {{items:any[], reviews:any[], siteUrl:string, live:boolean, base:string, route:{kind:"home"|"product"|"cat", id?:string, cat?:string}}} o
 */
export function renderPage(o) {
  const base = o.base || "";
  const siteUrl = (o.siteUrl || "").replace(/\/$/, "");
  const items = o.items.filter((p) => p.active !== false);
  const byId = S.indexById(items);
  const shop = items.filter((p) => p.cat !== "pack");
  const packs = items.filter((p) => p.cat === "pack").sort((a, b) => (a.sort || 0) - (b.sort || 0));
  const reviews = o.reviews && o.reviews.length ? o.reviews : SAMPLE_REVIEWS;
  const hasReal = reviews.some((r) => !r.sample);
  const route = o.route || { kind: "home" };
  const product = route.kind === "product" ? byId[route.id] : null;
  const cat = route.kind === "cat" && FAM_SEO[route.cat] ? route.cat : product && product.cat !== "pack" ? product.cat : "flores";

  let title = "CBD premium en la Val d'Aran | Aran Grow Shop";
  let desc = "Tienda de CBD premium en la Val d'Aran: flores, extracciones y aceites de HiiCBD y Olympus CBD. Envío discreto en 24/48 h y recogida en tienda. Venta solo a mayores de 18 años.";
  let path = "/", hero = heroHome(base);
  if (product) {
    title = `${product.name} · ${product.brand} | Aran Grow Shop`;
    desc = `${product.name} de ${product.brand}${product.es ? ": " + product.es : ""}. ${S.money(product.price, "es")}. Envío discreto en 24/48 h desde la Val d'Aran. Solo mayores de 18.`;
    path = "/p/" + product.id; hero = heroProduct(product, byId, base);
  } else if (route.kind === "cat" && FAM_SEO[route.cat]) {
    title = `${FAM_SEO[cat][0]} | Aran Grow Shop`; desc = FAM_SEO[cat][1]; path = "/c/" + cat; hero = heroCat(cat);
  }

  const graph = [
    { "@type": "Store", "@id": `${siteUrl}/#store`, name: SHOP.name, url: siteUrl || undefined,
      description: "Grow shop y tienda de CBD premium en la Val d'Aran. Distribuidor de HiiCBD y Olympus CBD. Venta solo a mayores de 18 años.",
      image: siteUrl ? `${siteUrl}/img/shop.webp` : undefined, logo: siteUrl ? `${siteUrl}/img/logo.webp` : undefined,
      address: { "@type": "PostalAddress", addressRegion: "Val d'Aran, Lleida", addressCountry: "ES" }, areaServed: "ES",
      brand: [{ "@type": "Brand", name: "HiiCBD" }, { "@type": "Brand", name: "Olympus CBD" }],
      currenciesAccepted: "EUR" },
    { "@type": "WebSite", "@id": `${siteUrl}/#web`, name: SHOP.name, url: siteUrl || undefined, inLanguage: "es", publisher: { "@id": `${siteUrl}/#store` } },
  ];
  if (product) {
    graph.push(productLd(product, byId, siteUrl));
    graph.push({ "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: SHOP.name, item: siteUrl + "/" },
      { "@type": "ListItem", position: 2, name: product.name, item: siteUrl + path }] });
  } else {
    const list = (route.kind === "cat" ? shop.filter((p) => p.cat === cat) : shop.concat(packs)).filter((p) => !p.sample);
    graph.push({ "@type": "ItemList", name: route.kind === "cat" ? FAM_SEO[cat][0] : "Catálogo de Aran Grow Shop",
      itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: productLd(p, byId, siteUrl) })) });
    graph.push({ "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
  }

  const head =
    `<title>${S.esc(title)}</title>\n<meta name="description" content="${S.esc(desc)}">\n` +
    (siteUrl ? `<link rel="canonical" href="${siteUrl}${path}">\n<meta property="og:url" content="${siteUrl}${path}">\n<meta property="og:image" content="${siteUrl}/img/shop.webp">\n` : "") +
    `<meta property="og:type" content="${product ? "product" : "website"}">\n<meta property="og:site_name" content="${SHOP.name}">\n<meta property="og:locale" content="es_ES">\n` +
    `<meta property="og:title" content="${S.esc(title)}">\n<meta property="og:description" content="${S.esc(desc)}">\n<meta name="twitter:card" content="summary_large_image">\n` +
    `<link rel="icon" href="${base}img/logo.webp">\n` +
    `<script type="application/ld+json">${safeJson({ "@context": "https://schema.org", "@graph": graph })}</script>\n`;

  const en = {};
  FAQ.forEach(([, , q, a], i) => { en["q" + (i + 1)] = q; en["a" + (i + 1)] = a; });
  const boot = { live: !!o.live, base, cat, shop: SHOP, items, reviews, en };

  let html = template;
  const parts = {
    "%%HEAD%%": head,
    "%%HERO%%": hero,
    "%%REVSUM%%": S.reviewsSummary(reviews, "es"),
    "%%REVIEWS%%": S.reviewsHTML(reviews, "es"),
    "%%REVNOTE_HIDDEN%%": hasReal ? " hidden" : "",
    "%%FAMS%%": S.famsHTML(shop, "es", cat),
    "%%CARDS%%": shop.map((p) => S.cardHTML(p, byId, "es", base)).join("\n"),
    "%%PACKS%%": packs.map((p) => S.packHTML(p, byId, "es", SHOP.freeShip)).join("\n"),
    "%%FAQ%%": FAQ.map(([q, a], i) => `<details><summary><h3 data-i18n="q${i + 1}">${S.esc(q)}</h3></summary><p data-i18n="a${i + 1}">${S.esc(a)}</p></details>`).join("\n"),
    "%%BOOT%%": safeJson(boot),
    "%%SHARED_JS%%": sharedJs,
    "%%APP_JS%%": appJs,
    "%%BASE%%": base,
  };
  for (const k of Object.keys(parts)) html = fill(html, k, parts[k]);
  return html;
}

export function renderSitemap(items, siteUrl) {
  const urls = ["/", ...S.FAMILIES.map((f) => "/c/" + f[0]), ...items.filter((p) => p.active !== false && !p.sample).map((p) => "/p/" + p.id)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${siteUrl}${u}</loc></url>`).join("\n") + `\n</urlset>\n`;
}

export function renderRobots(siteUrl) {
  const bots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot", "Googlebot"];
  return bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join("\n") + `\nUser-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

/** Plain-text summary for AI assistants (llms.txt). */
export function renderLlms(items, siteUrl) {
  const act = items.filter((p) => p.active !== false && !p.sample), byId = S.indexById(act);
  const line = (p) => `- [${p.name}](${siteUrl}/p/${p.id}): ${[p.brand, p.es].filter(Boolean).join(", ")}. ${S.money(p.price, "es")}. ${S.stockOf(p, byId) > 0 ? "En stock" : "Agotado"}.`;
  const fam = (key, label) => { const l = act.filter((p) => p.cat === key); return l.length ? `\n## ${label}\n${l.map(line).join("\n")}\n` : ""; };
  return `# Aran Grow Shop\n\n> Grow shop y tienda de CBD premium en la Val d'Aran (Lleida, España). Distribuidor de HiiCBD y Olympus CBD. Tienda física y venta online. Venta solo a mayores de 18 años.\n\n` +
    `- Envío: paquete discreto en 24/48 h a la península. Gratis desde ${S.money(SHOP.freeShip, "es")}; ${S.money(SHOP.shipCost, "es")} por debajo.\n- Recogida gratis en la tienda de la Val d'Aran.\n` +
    `- Las flores y extracciones son artículos de coleccionismo y uso aromático, no aptos para el consumo. La cosmética es de uso externo. Ningún producto es un medicamento.\n` +
    S.FAMILIES.map(([k, es]) => fam(k, es)).join("") + fam("pack", "Packs") +
    `\n## Preguntas frecuentes\n${FAQ.map(([q, a]) => `- ${q} ${a}`).join("\n")}\n`;
}
