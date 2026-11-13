# Aran Grow Shop — online store

CBD store for Aran Grow Shop (Val d'Aran). Built by Klaros Lab.

- Storefront with age gate, product families, spec cards, packs, reviews, cart and mailing list (Spanish, English toggle).
- **The inventory is an Airtable base.** The owner edits a table (or imports a CSV); the website reads it. There is no admin page on the website and no password in it.
- When something is sold, the website lowers `Stock` in the table and adds a row to `Pedidos`.
- Pages are written on the server, so Google and AI assistants read products, prices and stock without running JavaScript.
- Card payment through a hosted payment page; WhatsApp order as a second route.

## Status

| Part | State |
|---|---|
| Storefront and cart | Tested in a browser |
| Server: reading the table, update address, checkout, sale → stock and order row, SEO files | Tested locally with a stand-in for Airtable and for the payment API (`npm test`, 7 checks) |
| Real Airtable base | **Not created yet.** `scripts/airtable-setup.mjs` has not been run against a real account |
| Running on Netlify | **Not yet deployed** |
| Real payments | **Not connected.** Needs the payment provider's approval and keys (see "Payments") |

## 1. Create the inventory in Airtable

Create an empty base, then either:

- **Script (right column types):** create a personal access token with scopes `schema.bases:write`, `data.records:read`, `data.records:write`, limited to that base. Then
  `AIRTABLE_TOKEN=pat… AIRTABLE_BASE_ID=app… npm run airtable:setup`
- **By hand:** import `airtable/productos.csv`, `airtable/pedidos.csv` and `airtable/resenas.csv` as three tables named exactly **Productos**, **Pedidos** and **Reseñas**. Delete the example rows in the last two.

Do not rename the tables or the columns: the website finds them by name.

## 2. Put the website on Netlify

1. Create a Netlify site from this folder (Git or `netlify deploy`). Turn on Forms → "Enable form detection" for the mailing list.
2. Environment variables (scope: Functions), then redeploy:
   - `AIRTABLE_TOKEN` — a token for the website with only `data.records:read` and `data.records:write` on this base.
   - `AIRTABLE_BASE_ID` — starts with `app`.
   - `SYNC_KEY` — a long random text (16+ characters) for the update address.
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — from the payment provider.
3. In the payment provider, add a webhook to `https://<domain>/api/payment-webhook` for `checkout.session.completed`.
4. Fill in `SHOP.whatsapp` in `netlify/lib/content.mjs`, and the address, phone and hours in the footer of `src/template.html`.

Test with the provider's test keys first: pay with a test card, then check the new row in **Pedidos** and the lower `Stock` in **Productos**.

## How the owner runs the shop (all in Airtable)

| To do this | Do this in the Productos table |
|---|---|
| Add or remove units | Change the number in `Stock` |
| Sell out | `Stock` = 0 → the website shows "Agotado" |
| New product | Add a row: `Nombre`, `Marca`, `Familia`, `Precio`, `Stock`, tick `Visible`. For strains: `Tipo`, `Estrellas CBD`, `Cultivo`, `Aroma`. Drop a photo in `Foto` |
| Many products at once | Import a CSV with the same column names |
| Hide a product | Untick `Visible` |
| Remove a product | Delete the row |
| Pack | `Familia` = Pack, and in `Productos del pack` the `Código` of each product, separated by commas. A pack's stock follows its scarcest product |

- **When do changes show?** Automatically within 4 hours. To see them at once, open `https://<domain>/api/sync?key=<SYNC_KEY>` (save it as a bookmark; it answers "Web actualizada").
- **Sales** lower `Stock` by themselves and add a row to **Pedidos** with customer, address, products and total. Set `Estado` to "Enviado" when it ships. "Revisar stock" means more was sold than the table had.
- **Reviews:** paste real Google reviews into **Reseñas** and tick `Visible`.
- **Mailing list:** Netlify → Forms → `lista` (CSV export there).
- **Who can edit:** only people invited to the Airtable base. Turn on two-step sign-in in Airtable.

## Airtable plan

The free plan allows 1,000 API requests per workspace per month and 1,000 records per base. The website is built to stay low:

| Action | Requests |
|---|---|
| Visitors browsing, adding to cart, opening checkout | 0 |
| Automatic refresh, every 4 hours | 2 each (about 360 a month) |
| Update address opened by the owner | 2 each |
| Each paid order | 3 |

That leaves room for roughly 150 orders a month plus daily manual updates. Beyond that, or past about 900 order rows, move to Airtable's Team plan or archive old orders. To change the refresh frequency edit the schedule in `netlify/functions/sync-cron.mts`.

## Payments

All provider code is in `netlify/lib/payments.mjs` (two functions), written for Stripe Checkout.

Before launch, **ask Stripe to approve the business**. Stripe lists CBD with negligible THC as a *restricted* business that needs its review, and lists equipment marketed for growing marijuana as *prohibited* (https://stripe.com/legal/restricted-businesses). Approval is not guaranteed and can be withdrawn. If Stripe declines, replace the two functions in `payments.mjs` with another provider; nothing else changes.

## Known limits

- The website checks stock against its own copy of the table. If the owner lowers `Stock` by hand and does not open the update address, the website can sell units that are gone for up to 4 hours. The order is then marked "Revisar stock".
- Two people can pay for the last unit at the same moment.
- If Airtable is unreachable when a payment completes, the provider retries the notice; the payment itself is always visible in the provider's dashboard.

## Layout

```
airtable/                       CSV files for the three tables
src/template.html, src/app.js   page and browser script
netlify/lib/shared.mjs          cards, money and cart totals (used by server and browser)
netlify/lib/content.mjs         shop settings, starting catalogue, FAQ
netlify/lib/airtable.mjs        reading and writing the inventory base
netlify/lib/catalog.mjs         the shop's saved copy, sync, sale → stock and order
netlify/lib/render.mjs          page, product page, family page, sitemap, robots, llms.txt
netlify/lib/payments.mjs        payment provider
netlify/functions/              page, checkout, payment-webhook, sync, sync-cron, img, seo
public/                         images and the form definition for the mailing list
scripts/                        build, Airtable setup, CSV writer, tests
```

## Still open

- Product specs are provisional until checked against lab sheets (tick `Ficha confirmada`).
- Legal pages, cookie notice, and a review of the CBD wording by someone qualified.
- Mailing tool (Brevo or similar) and double opt-in.
- English is a toggle on the same URL; separate `/en/` pages are needed for English search results.
