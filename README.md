# schillan-website

Static website for schillan. Plain HTML, no framework — optimized for SEO, load
time and AI crawling.

## Structure

The **CNDWN** countdown-app site is published in three languages, each on its own
URL (proper multilingual SEO with `hreflang` + per-language `canonical`):

| Page | English | German | Spanish |
| --- | --- | --- | --- |
| Landing | `/cndwn/` | `/cndwn/de/` | `/cndwn/es/` |
| Privacy policy | `/cndwn/privacy/` | `/cndwn/de/privacy/` | `/cndwn/es/privacy/` |

`/cndwn/share/` is a standalone (hand-edited, not generated) redirect page: it
takes a `?data=…` query param from a share link, forwards it to the app via
the `cndwn://share?data=…` custom URL scheme, and falls back to an App Store
badge if the app isn't installed. It replaces the old `cndwn-share.schillan.com`
subdomain — share links should now point to `https://schillan.com/cndwn/share/?data=…`.
It's `noindex` and not listed in the sitemap since it has no content of its own.

- `cndwn/img/` — shared assets (app icon, official App Store badges, cropped
  device screenshots), referenced with root-absolute `/cndwn/img/…` paths.
- `robots.txt`, `sitemap.xml`, `llms.txt` — crawler and AI-assistant discovery
  files, served from the site root. The sitemap lists every language URL with
  `hreflang` alternates.

## Editing content (i18n build)

The six HTML pages are **generated** — do not hand-edit them. Edit the trilingual
templates and regenerate:

1. Edit `tools/templates/landing.html` and/or `tools/templates/privacy.html`.
   Each translatable piece is three sibling elements: `<span lang="en">…</span>`,
   `<span lang="de">…</span>`, `<span lang="es">…</span>`.
2. Regenerate the six pages:

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
# then visit http://localhost:8000/cndwn/  (or /cndwn/de/, /cndwn/es/privacy/, …)
```
