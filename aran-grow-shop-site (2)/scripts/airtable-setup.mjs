// One-time setup of the inventory in Airtable: creates the three tables with the right column
// types in an EMPTY base and loads the starting products.
//
//   AIRTABLE_TOKEN=pat... AIRTABLE_BASE_ID=app... npm run airtable:setup
//
// The token needs the scopes schema.bases:write and data.records:write on that base.
// Not yet run against a real Airtable account: if a table fails, import the CSV files in airtable/ instead.
import { SCHEMA, PRODUCT_ROWS } from "./airtable-rows.mjs";

const token = process.env.AIRTABLE_TOKEN, base = process.env.AIRTABLE_BASE_ID;
if (!token || !base) { console.error("Set AIRTABLE_TOKEN and AIRTABLE_BASE_ID first."); process.exit(1); }
const call = async (url, body) => {
  const r = await fetch("https://api.airtable.com/v0/" + url, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${url}: ${r.status} ${JSON.stringify(d).slice(0, 400)}`);
  return d;
};
for (const table of SCHEMA) {
  await call(`meta/bases/${base}/tables`, table);
  console.log("table created:", table.name);
}
const clean = (row) => Object.fromEntries(Object.entries(row).filter(([, v]) => v !== "" && v !== 0 && v !== false));   // empty cells are left out
for (let i = 0; i < PRODUCT_ROWS.length; i += 10) {
  await call(`${base}/${encodeURIComponent("Productos")}`, { records: PRODUCT_ROWS.slice(i, i + 10).map((r) => ({ fields: { ...clean(r), "Stock": 0 } })), typecast: true });
}
console.log("products loaded:", PRODUCT_ROWS.length, "(all with 0 units: type the real stock in the Stock column)");
