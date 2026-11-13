// sitemap.xml, robots.txt and llms.txt, always in step with the catalogue.
import type { Config } from "@netlify/functions";
import { getCatalog } from "../lib/catalog.mjs";
import { renderSitemap, renderRobots, renderLlms } from "../lib/render.mjs";

export default async (req: Request) => {
  const url = new URL(req.url);
  const cache = { "Netlify-CDN-Cache-Control": "public, durable, s-maxage=3600, stale-while-revalidate=86400", "Netlify-Cache-Tag": "catalog" };
  if (url.pathname === "/robots.txt") return new Response(renderRobots(url.origin), { headers: { "Content-Type": "text/plain; charset=utf-8", ...cache } });
  const { items } = await getCatalog();
  if (url.pathname === "/sitemap.xml") return new Response(renderSitemap(items, url.origin), { headers: { "Content-Type": "application/xml; charset=utf-8", ...cache } });
  return new Response(renderLlms(items, url.origin), { headers: { "Content-Type": "text/plain; charset=utf-8", ...cache } });
};

export const config: Config = { path: ["/sitemap.xml", "/robots.txt", "/llms.txt"] };
