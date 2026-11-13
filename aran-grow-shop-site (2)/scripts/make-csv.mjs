// Writes the CSV files in airtable/ for importing the inventory by hand.
import { writeFileSync } from "node:fs";
import { PRODUCT_ROWS, SCHEMA } from "./airtable-rows.mjs";
const cell = (v) => { const s = v === true ? "sí" : v === false ? "" : String(v ?? ""); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = (cols, rows) => "﻿" + [cols, ...rows.map((r) => cols.map((c) => r[c]))].map((r) => r.map(cell).join(",")).join("\n") + "\n";
const cols = (t) => SCHEMA.find((x) => x.name === t).fields.map((f) => f.name);
const out = (name, text) => writeFileSync(new URL("../airtable/" + name, import.meta.url), text);
out("productos.csv", csv(cols("Productos"), PRODUCT_ROWS.map((r) => ({ ...r, "Precio": r["Precio"].toFixed(2).replace(".", ","), "Estrellas CBD": r["Estrellas CBD"] || "" }))));
out("pedidos.csv", csv(cols("Pedidos"), [{ "Pedido": "EJEMPLO", "Fecha": "2026-11-13 12:00", "Cliente": "Fila de ejemplo: bórrala", "Entrega": "Envío", "Productos": "1 × Ejemplo", "Total": "0,00", "Estado": "Pagado" }]));
out("resenas.csv", csv(cols("Reseñas"), [{ "Autor": "Fila de ejemplo: bórrala", "Estrellas": 5, "Texto": "Aquí va el texto de una reseña real de Google.", "Fecha mostrada": "hace 2 semanas", "Visible": false }]));
console.log("csv written:", PRODUCT_ROWS.length, "products");
