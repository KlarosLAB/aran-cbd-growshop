// Serves the home page, one page per product (/p/<id>) and one per family (/c/<family>).
import type { Config, Context } from "@netlify/functions";
import { getCatalog } from "../lib/catalog.mjs";
import { renderPage } from "../lib/render.mjs";
import { FAMILIES } from "../lib/shared.mjs";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const { items, reviews } = await getCatalog();
  let route: any = { kind: "home" };
  let status = 200;
  if (context.params.id) {
    if (items.some((p: any) => p.id === context.params.id && p.active)) route = { kind: "product", id: context.params.id };
    else status = 404;
  } else if (context.params.cat) {
    if (FAMILIES.some((f: any) => f[0] === context.params.cat)) route = { kind: "cat", cat: context.params.cat };
    else status = 404;
  }
  const html = renderPage({ items, reviews, siteUrl: url.origin, live: true, base: "/", route });
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": status === 200 ? "public, durable, s-maxage=3600, stale-while-revalidate=86400" : "no-store",
      "Netlify-Cache-Tag": "catalog",
      "Netlify-Vary": "query=pago",
    },
  });
};

export const config: Config = { path: ["/", "/p/:id", "/c/:cat"] };
