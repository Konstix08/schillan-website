# schillan-website

Static website for schillan. Plain HTML, no framework — optimized for SEO, load
time and AI crawling.

## Structure

Every page is published in **seven languages** — English (`en`), German (`de`),
Spanish (`es`), French (`fr`), Japanese (`ja`), Italian (`it`) and Portuguese
(`pt`) — each on its own URL, with proper multilingual SEO (`hreflang` +
per-language `canonical`). English lives at the bare path; every other language
sits under `/<lang>/`:

| Page | English | Other languages |
| --- | --- | --- |
| Homepage | `/` | `/de/`, `/es/`, `/fr/`, `/ja/`, `/it/`, `/pt/` |
| CNDWN landing | `/cndwn/` | `/cndwn/de/`, … `/cndwn/pt/` |
| CNDWN privacy policy | `/cndwn/privacy/` | `/cndwn/de/privacy/`, … `/cndwn/pt/privacy/` |
| CNDWN guides | `/cndwn/<slug>/` | `/cndwn/de/<slug>/`, … `/cndwn/pt/<slug>/` |

The guide slugs are `best-countdown-app-iphone`, `countdown-widget-ios`,
`how-to-add-countdown-widget`, `countdown-live-activities`,
`vacation-countdown`, `countdown-icloud-sync` and `wedding-countdown`. The
authoritative list of languages, page types and URLs is `LANGS` + the `*Path`
maps at the top of `tools/build-i18n.mjs`.

`/cndwn/share/` is a standalone (hand-edited, not generated) redirect page: it
takes a `?data=…` query param from a share link, forwards it to the app via
the `cndwn://share?data=…` custom URL scheme, and falls back to an App Store
badge if the app isn't installed. It replaces the old `cndwn-share.schillan.com`
subdomain — share links should now point to `https://schillan.com/cndwn/share/?data=…`.
It's `noindex` and not listed in the sitemap since it has no content of its own.

- `cndwn/img/` — shared assets (app icon, official App Store badges, cropped
  device screenshots), referenced with root-absolute `/cndwn/img/…` paths.
- `img/` — homepage-only assets (favicon/wordmark), referenced with
  root-absolute `/img/…` paths.
- `robots.txt`, `sitemap.xml`, `llms.txt` — crawler and AI-assistant discovery
  files, served from the site root. The sitemap lists every language URL with
  `hreflang` alternates.

## Editing content (i18n build)

All of the pages above are **generated** — do not hand-edit them. Edit the
multilingual templates and regenerate:

1. Edit the template in `tools/templates/` (`home.html`, `landing.html`,
   `privacy.html` or one of the guide templates). Each translatable piece is one
   sibling element per language, in `LANGS` order: `<span lang="en">…</span>`,
   `<span lang="de">…</span>`, `<span lang="es">…</span>`, `<span lang="fr">…</span>`,
   `<span lang="ja">…</span>`, `<span lang="it">…</span>`, `<span lang="pt">…</span>`.
   Page-level metadata (title, description, Open Graph, breadcrumb and HowTo
   JSON-LD) is not in the template — it lives in the `META` table in
   `tools/build-i18n.mjs` and needs an entry per language.
2. Regenerate all pages:

   ```sh
   npm install cheerio      # once
   node tools/build-i18n.mjs
   ```

The generator strips each page down to a single language, sets `<html lang>`,
localizes the `<title>`/description/Open Graph/JSON-LD, wires up per-language
`canonical` + `hreflang`, and turns the language switcher into crawlable links.
The templates carry `noindex` and live under `/tools/` (disallowed in
`robots.txt`) so only the generated pages are indexed.

## Local preview

Serve the folder (root-absolute paths need an HTTP server, not `file://`):

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/  (or /de/, /pt/, /cndwn/, /cndwn/de/, /cndwn/pt/privacy/, …)
```
