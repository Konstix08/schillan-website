# schillan-website

Static website for schillan.

## Structure

- `privacy/index.html` — Privacy Policy / Datenschutzerklärung for the **CNDWN** app, served at `/privacy` (bilingual EN/DE, GDPR/DSGVO).

## Local preview

Open the file directly:

```sh
open privacy/index.html
```

Or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/privacy/
```
