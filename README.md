# schillan-website

Static website for schillan.

## Structure

- `cndwn/index.html` — Landing page for the **CNDWN** countdown app, served at `/cndwn/` (SEO/GEO-optimized: JSON-LD structured data, Open Graph/Twitter cards, FAQ).
- `cndwn/privacy/index.html` — Privacy Policy / Datenschutzerklärung for the **CNDWN** app, served at `/cndwn/privacy` (trilingual EN/DE/ES, GDPR/DSGVO).
- `robots.txt`, `sitemap.xml`, `llms.txt` — crawler and AI-assistant discovery files, served from the site root.

## Local preview

Open the file directly:

```sh
open cndwn/privacy/index.html
```

Or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/cndwn/privacy/
```
