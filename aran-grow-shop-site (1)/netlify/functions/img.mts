// Serves the product photos copied from the inventory table.
import type { Config, Context } from "@netlify/functions";
import { photos } from "../lib/catalog.mjs";

export default async (req: Request, context: Context) => {
  const entry = await photos().getWithMetadata(context.params.key, { type: "stream" });
  if (entry === null) return new Response("Not found", { status: 404 });
  return new Response(entry.data as any, {
    headers: { "Content-Type": String((entry.metadata && entry.metadata.type) || "image/jpeg"), "Cache-Control": "public, max-age=31536000, immutable" },
  });
};

export const config: Config = { path: "/img/u/:key" };
