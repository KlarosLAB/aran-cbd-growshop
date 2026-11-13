// The starting inventory as Airtable rows (shared by the CSV writer and the setup script).
// Every product starts with 0 units: the owner types in the real stock.
import { SEED } from "../netlify/lib/content.mjs";

const FAM = { flores: "Flores", extractos: "Extracciones", aceites: "Aceites", cosmetica: "Cosmética", gear: "Gear", merch: "Merch", pack: "Pack" };
const TYPE = { sativa: "Sativa", indica: "Índica", hibrida: "Híbrida", tbc: "Por confirmar" };

export const PRODUCT_ROWS = SEED.filter((p) => !p.sample).map((p) => ({
  "Nombre": p.name, "Código": p.id, "Marca": p.brand, "Familia": FAM[p.cat], "Precio": p.price / 100, "Stock": 0, "Visible": true,
  "Desde": !!p.frm, "Detalle": p.es, "Detalle EN": p.en, "Tipo": TYPE[p.type] || "", "Estrellas CBD": p.stars || 0,
  "Cultivo": p.grow_es, "Aroma": p.aroma_es, "Ficha confirmada": false, "Productos del pack": (p.items || []).join(", "),
  "Nombre EN": p.name_en || "", "Recomendado": !!p.reco, "Orden": p.sort || 0,
}));

export const SCHEMA = [
  { name: "Productos", description: "Inventario de la tienda. Cambia Stock a mano cuando entre o salga género; la web lo descuenta sola cuando se vende.", fields: [
    { name: "Nombre", type: "singleLineText" },
    { name: "Código", type: "singleLineText", description: "Identificador corto, sin espacios. Si lo dejas vacío se saca del nombre. No lo cambies después: es la dirección de la página del producto." },
    { name: "Marca", type: "singleSelect", options: { choices: ["HiiCBD", "Olympus CBD", "Gear", "Merch", "Pack"].map((name) => ({ name })) } },
    { name: "Familia", type: "singleSelect", options: { choices: Object.values(FAM).map((name) => ({ name })) } },
    { name: "Precio", type: "currency", options: { precision: 2, symbol: "€" } },
    { name: "Stock", type: "number", options: { precision: 0 }, description: "Unidades disponibles. Con 0 la web muestra «Agotado»." },
    { name: "Visible", type: "checkbox", options: { icon: "check", color: "greenBright" }, description: "Sin marcar, el producto no sale en la web." },
    { name: "Desde", type: "checkbox", options: { icon: "check", color: "grayBright" }, description: "Muestra «desde» delante del precio." },
    { name: "Detalle", type: "singleLineText", description: "Formato, gramos…" },
    { name: "Detalle EN", type: "singleLineText" },
    { name: "Tipo", type: "singleSelect", options: { choices: Object.values(TYPE).map((name) => ({ name })) } },
    { name: "Estrellas CBD", type: "rating", options: { icon: "star", max: 5, color: "yellowBright" }, description: "Potencia de CBD de 1 a 5 según la analítica." },
    { name: "Cultivo", type: "singleLineText" },
    { name: "Aroma", type: "singleLineText" },
    { name: "Ficha confirmada", type: "checkbox", options: { icon: "check", color: "greenBright" }, description: "Márcalo cuando tipo, estrellas, cultivo y aroma estén comprobados con la analítica del lote." },
    { name: "Foto", type: "multipleAttachments" },
    { name: "Productos del pack", type: "singleLineText", description: "Solo para la familia Pack: códigos de sus productos separados por comas." },
    { name: "Nombre EN", type: "singleLineText" },
    { name: "Recomendado", type: "checkbox", options: { icon: "star", color: "yellowBright" } },
    { name: "Orden", type: "number", options: { precision: 0 } },
  ] },
  { name: "Pedidos", description: "La web añade aquí cada pedido pagado. Cambia Estado a «Enviado» cuando salga.", fields: [
    { name: "Pedido", type: "singleLineText" },
    { name: "Fecha", type: "dateTime", options: { dateFormat: { name: "european" }, timeFormat: { name: "24hour" }, timeZone: "Europe/Madrid" } },
    { name: "Cliente", type: "singleLineText" },
    { name: "Email", type: "email" },
    { name: "Teléfono", type: "phoneNumber" },
    { name: "Entrega", type: "singleSelect", options: { choices: [{ name: "Envío" }, { name: "Recogida en tienda" }] } },
    { name: "Dirección", type: "singleLineText" },
    { name: "Productos", type: "multilineText" },
    { name: "Total", type: "currency", options: { precision: 2, symbol: "€" } },
    { name: "Estado", type: "singleSelect", options: { choices: [{ name: "Pagado" }, { name: "Enviado" }, { name: "Revisar stock" }] } },
    { name: "Referencia de pago", type: "singleLineText" },
  ] },
  { name: "Reseñas", description: "Reseñas reales copiadas de Google. Solo salen en la web las que tienen Visible marcado.", fields: [
    { name: "Autor", type: "singleLineText" },
    { name: "Estrellas", type: "rating", options: { icon: "star", max: 5, color: "yellowBright" } },
    { name: "Texto", type: "multilineText" },
    { name: "Fecha mostrada", type: "singleLineText", description: "Tal como sale en Google: «hace 2 semanas»." },
    { name: "Visible", type: "checkbox", options: { icon: "check", color: "greenBright" } },
  ] },
];
