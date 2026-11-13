// "Update the website now": the owner opens this address after editing the inventory table.
import type { Config } from "@netlify/functions";
import { syncCatalog } from "../lib/catalog.mjs";
import { sameSecret } from "../lib/http.mjs";

export default async (req: Request) => {
  const key = new URL(req.url).searchParams.get("key") || "", real = Netlify.env.get("SYNC_KEY") || "";
  const page = (msg: string, status: number) => new Response(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Aran Grow Shop</title><p style="font:20px system-ui;padding:2rem">${msg}</p>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  if (real.length < 16 || !sameSecret(key, real)) return page("Esta dirección no es válida.", 403);
  try {
    const c = await syncCatalog();
    return page(`Web actualizada: ${c.items.filter((p: any) => p.active).length} productos visibles y ${c.reviews.length} reseñas.`, 200);
  } catch (e) {
    console.error("sync failed", e);
    return page("No se ha podido leer la tabla de inventario. Revisa que las columnas sigan llamándose igual y vuelve a intentarlo.", 502);
  }
};

export const config: Config = { path: "/api/sync", rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 5 } };
