import { purgeCache } from "@netlify/cache";
import { createHash, timingSafeEqual } from "node:crypto";

export const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

/** Drops the cached pages so shoppers see new stock and products straight away. */
export async function refreshPages() {
  try { await purgeCache({ tags: ["catalog"] }); } catch (e) { console.error("cache purge failed", e); }
}

/** Compares two secrets without leaking where they differ. */
export function sameSecret(a, b) {
  const h = (v) => createHash("sha256").update(String(v)).digest();
  return timingSafeEqual(h(a), h(b));
}
