# schillan-website

Static website for schillan.

## Structure

- `cndwn/privacy/index.html` — Privacy Policy / Datenschutzerklärung for the **CNDWN** app, served at `/cndwn/privacy` (bilingual EN/DE, GDPR/DSGVO).

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
