// Shop settings, the starting catalogue and the FAQ.
// Prices are integer cents. Spec values (type, stars, grow, aroma) are provisional until
// `confirmed` is true: the product card then stops showing "Ficha provisional".

export const SHOP = {
  name: "Aran Grow Shop",
  freeShip: 5000,   // free shipping from 50,00 €
  shipCost: 600,    // 6,00 € below that
  code: "ARAN10",   // welcome code for subscribers
  codePct: 10,
  whatsapp: "",     // shop number with country code, e.g. "34600111222"
  offerDelay: 8,    // seconds before the welcome pop-up
  underageUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
};

const P = (id, name, brand, cat, price, frm, es, en, bg, extra = {}) => ({
  id, name, brand, cat, price, frm, es, en, bg, img: "", sample: false, type: "", stars: 0,
  grow_es: "", grow_en: "", aroma_es: "", aroma_en: "", confirmed: false, feat: false, stock: 0, active: true, ...extra,
});

// `stock` here is demo stock for the preview only. The live shop starts every product at 0
// and the owner enters the real units in the shop panel.
export const SEED = [
  P("hii-amnesia", "Amnesia Hidropónica", "HiiCBD", "flores", 3000, true, "Flor hidropónica", "Hydroponic flower", "#6CFF3B",
    { type: "sativa", stars: 4, grow_es: "Hidropónico", grow_en: "Hydroponic", aroma_es: "Cítrico", aroma_en: "Citrus", stock: 12, feat: true }),
  P("oly-cannatonik-sb", "Cannatonik Indoor Small Bud", "Olympus CBD", "flores", 3000, false, "Flor indoor, 15 g", "Indoor flower, 15 g", "#B26BFF",
    { type: "hibrida", stars: 4, grow_es: "Indoor", grow_en: "Indoor", stock: 8, feat: true }),
  P("oly-amnesia-bb", "Amnesia Haze Premium Big Bud", "Olympus CBD", "flores", 1500, false, "Flor premium, 3,5 g", "Premium flower, 3.5 g", "#22E4FF",
    { type: "sativa", stars: 4, grow_es: "Premium", grow_en: "Premium", aroma_es: "Cítrico", aroma_en: "Citrus", stock: 3, feat: true }),
  P("oly-cannatonic-bb", "Cannatonic Premium Big Bud", "Olympus CBD", "flores", 1500, false, "Flor premium, 3,5 g", "Premium flower, 3.5 g", "#FF2BD6",
    { type: "hibrida", stars: 5, grow_es: "Premium", grow_en: "Premium", stock: 10, feat: true }),
  P("oly-v1", "V1 Indoor Small Bud", "Olympus CBD", "flores", 3000, false, "Flor indoor, 15 g", "Indoor flower, 15 g", "#6CFF3B",
    { type: "tbc", stars: 3, grow_es: "Indoor", grow_en: "Indoor", stock: 6 }),
  P("oly-vainilla-sb", "Vainilla Indoor Small Bud", "Olympus CBD", "flores", 3000, false, "Flor indoor, 15 g", "Indoor flower, 15 g", "#FF8A1F",
    { type: "indica", stars: 3, grow_es: "Indoor", grow_en: "Indoor", aroma_es: "Dulce", aroma_en: "Sweet", stock: 5 }),
  P("oly-vainilla-pr", "Vainilla Premium", "Olympus CBD", "flores", 1500, false, "Flor premium", "Premium flower", "#B26BFF",
    { type: "indica", stars: 4, grow_es: "Premium", grow_en: "Premium", aroma_es: "Dulce", aroma_en: "Sweet", stock: 9, feat: true }),
  P("hii-butter", "Black Butter 70%", "HiiCBD", "extractos", 3000, true, "Extracción", "Extract", "#FF2BD6", { stars: 4, stock: 7 }),
  P("hii-yellow", "The Yellow King 50%", "HiiCBD", "extractos", 3000, true, "Extracción", "Extract", "#FF8A1F", { stars: 3, stock: 0 }),
  P("hii-wonka", "Willy Wonka 30%", "HiiCBD", "extractos", 3000, true, "Extracción", "Extract", "#22E4FF", { stars: 2, stock: 9 }),
  P("hii-aceite30", "Aceite CBD Full Spectrum 30% Classic", "HiiCBD", "aceites", 4999, true, "Frasco de 10 ml", "10 ml bottle", "#6CFF3B", { stock: 6 }),
  P("hii-gel", "Gel Efecto Calor 3000 mg CBD", "HiiCBD", "cosmetica", 2490, true, "Cosmética de uso externo", "Cosmetic for external use", "#B26BFF", { stock: 5 }),
  // Example items so the Gear and Merch families can be seen working. Not seeded into the live shop.
  P("gear-sustrato", "Sustrato Light Mix 50 L", "Gear", "gear", 1490, false, "Sustrato", "Substrate", "#FF8A1F", { sample: true, stock: 20 }),
  P("gear-maceta", "Maceta textil 11 L", "Gear", "gear", 450, false, "Maceta", "Fabric pot", "#22E4FF", { sample: true, stock: 40 }),
  P("gear-led", "Panel LED 100 W", "Gear", "gear", 8900, false, "Iluminación", "Lighting", "#FF2BD6", { sample: true, stock: 2 }),
  P("gear-nutri", "Fertilizante crecimiento 1 L", "Gear", "gear", 1290, false, "Nutrientes", "Nutrients", "#6CFF3B", { sample: true, stock: 15 }),
  P("merch-gorra", "Gorra Aran Grow Shop", "Merch", "merch", 2500, false, "Gorra con el logo", "Cap with the logo", "#6CFF3B", { sample: true, stock: 10 }),
  P("merch-hoodie", "Sudadera del camaleón", "Merch", "merch", 4500, false, "Sudadera negra", "Black hoodie", "#FF8A1F", { sample: true, stock: 6 }),
  // Packs, highest price first so the recommended one is read against a bigger number.
  P("pack-completo", "Pack Completo", "Pack", "pack", 9700, false, "", "", "", { name_en: "Full Pack", items: ["hii-amnesia", "hii-butter", "hii-aceite30"], sort: 1 }),
  P("pack-valle", "Pack Valle", "Pack", "pack", 7900, false, "", "", "", { name_en: "Valley Pack", items: ["oly-cannatonik-sb", "oly-v1", "oly-vainilla-sb"], reco: true, sort: 2 }),
  P("pack-cata", "Pack Cata", "Pack", "pack", 3990, false, "", "", "", { name_en: "Tasting Pack", items: ["oly-amnesia-bb", "oly-cannatonic-bb", "oly-vainilla-pr"], sort: 3 }),
];

export const FAQ = [
  ["¿Dónde comprar CBD en la Val d'Aran?",
    "En Aran Grow Shop: en la tienda física de la Val d'Aran (Lleida) y en esta web, con envío discreto a toda la península en 24/48 h.",
    "Where can I buy CBD in the Val d'Aran?",
    "At Aran Grow Shop: in the physical shop in the Val d'Aran (Lleida) and on this website, with discreet shipping across mainland Spain in 24/48 h."],
  ["¿Es legal comprar CBD en España?",
    "Sí, dentro de su categoría. En España los productos con CBD se venden como cosmética de uso externo o como artículos de coleccionismo y aromáticos, con el THC dentro del límite legal.",
    "Is it legal to buy CBD in Spain?",
    "Yes, within its category. In Spain CBD products are sold as cosmetics for external use or as collectors' and aromatic items, with THC within the legal limit."],
  ["¿Para qué son las flores y las extracciones?",
    "Son artículos de coleccionismo y uso aromático. No son aptas para el consumo humano y no son medicamentos.",
    "What are the flowers and extracts for?",
    "They are collectors' and aromatic items. They are not fit for human consumption and they are not medicines."],
  ["¿Qué diferencia hay entre sativa, índica e híbrida?",
    "Son las familias genéticas del cáñamo. Sativa e índica describen el linaje y la forma de la planta, y una híbrida cruza las dos. Cada ficha indica de cuál viene la variedad.",
    "What is the difference between sativa, indica and hybrid?",
    "They are the genetic families of hemp. Sativa and indica describe the plant's lineage and shape, and a hybrid crosses the two. Each spec card says which one the strain comes from."],
  ["¿Qué significan las estrellas de cada ficha?",
    "Indican la potencia de CBD de esa variedad en una escala de 1 a 5, según la analítica del lote. No miden ningún efecto.",
    "What do the stars on each spec card mean?",
    "They show that strain's CBD strength on a 1 to 5 scale, taken from the batch lab analysis. They do not measure any effect."],
  ["¿Qué es un aceite full spectrum?",
    "Es un aceite que conserva el conjunto de cannabinoides y terpenos de la planta, con el THC dentro del límite legal, en lugar de llevar solo CBD aislado.",
    "What is a full spectrum oil?",
    "It is an oil that keeps the plant's range of cannabinoids and terpenes, with THC within the legal limit, instead of containing only isolated CBD."],
  ["¿Quién puede comprar en Aran Grow Shop?",
    "Solo mayores de 18 años. Te lo preguntamos al entrar en la web y lo confirmas otra vez al hacer el pedido.",
    "Who can buy at Aran Grow Shop?",
    "Adults aged 18 or over only. We ask when you enter the site and you confirm again when you place your order."],
  ["¿Cómo y cuándo llega mi pedido?",
    "En un paquete discreto, sin nada fuera que indique el contenido. A la península llega en 24/48 h. El envío es gratis desde 50 € y cuesta 6 € por debajo.",
    "How and when does my order arrive?",
    "In a discreet parcel with nothing on the outside showing the contents. Mainland Spain takes 24/48 h. Shipping is free from €50 and costs €6 below that."],
  ["¿Puedo recoger mi pedido en la tienda?",
    "Sí. Elige «Recoger en tienda» al hacer el pedido y pásate por la tienda en la Val d'Aran. La recogida no tiene coste.",
    "Can I pick up my order at the shop?",
    "Yes. Choose \"Pick up at the shop\" when you order and come by the shop in the Val d'Aran. Pickup is free."],
  ["¿Qué marcas de CBD tiene Aran Grow Shop?",
    "HiiCBD y Olympus CBD. De las dos tenemos flores y extracciones, y de HiiCBD también aceites full spectrum y cosmética.",
    "Which CBD brands does Aran Grow Shop carry?",
    "HiiCBD and Olympus CBD. We carry flowers and extracts from both, plus full spectrum oils and cosmetics from HiiCBD."],
];

export const FAM_SEO = {
  flores: ["Flores de CBD", "Flores de CBD de HiiCBD y Olympus CBD, con ficha de tipo, cultivo y potencia. Envío discreto en 24/48 h desde la Val d'Aran."],
  extractos: ["Extracciones de CBD", "Extracciones de CBD de HiiCBD con su potencia indicada. Envío discreto en 24/48 h desde la Val d'Aran."],
  aceites: ["Aceites de CBD full spectrum", "Aceites de CBD full spectrum en frasco de 10 ml. Envío discreto en 24/48 h desde la Val d'Aran."],
  cosmetica: ["Cosmética con CBD", "Cosmética con CBD de uso externo. Envío discreto en 24/48 h desde la Val d'Aran."],
  gear: ["Gear de cultivo", "Sustratos, macetas, iluminación y nutrientes en Aran Grow Shop, el grow shop de la Val d'Aran."],
  merch: ["Merch de Aran Grow Shop", "Gorras y sudaderas de Aran Grow Shop con el camaleón."],
};
