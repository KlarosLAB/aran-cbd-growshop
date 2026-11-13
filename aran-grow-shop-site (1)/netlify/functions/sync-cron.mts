// Renews the shop's copy of the inventory every 4 hours (00:00, 04:00, 08:00… UTC),
// so manual edits to the table reach the website even if nobody presses "update".
import type { Config } from "@netlify/functions";
import { syncCatalog } from "../lib/catalog.mjs";

export default async () => {
  await syncCatalog();
};

export const config: Config = { schedule: "0 */4 * * *" };
