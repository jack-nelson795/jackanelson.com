# jackanelson.com

Jack Nelson engineering portfolio website.

Static engineering portfolio site for Jack Nelson.

This repo is designed to be:
- **Static / no build step** (plain HTML + CSS + vanilla JS)
- **Fast + accessible** (keyboard-friendly lightbox, skip link, reduced-motion support)
- **Simple to host** on Apache/Bluehost-style setups (relative URLs, no framework tooling)

## What’s in here

- `index.html` — Home page (hero, selected work, visuals, contact, PDF preview links)
- `projects/` — Project pages
  - `micro-turbine.html`
  - `scramopt.html`
  - `eureka3.html`
  - `drone-swarm.html`
- `gallery.html` — Image gallery with deep links suitable for QR codes
- `styles.css` — Global styling (dark, defense-tech aesthetic)
- `script.js` — Lightbox modal, gallery hash routing, particles background
- `assets/img/` — Images used across the site
- `assets/pdf/` — PDFs linked from the site
- `assets/pdf/extracted/` — Text extracts used to populate project pages
- `particles.js-master/` — Vendored particles.js for the animated background
- `tools/extract_pdfs.py` — Helper script used to extract PDF text into `assets/pdf/extracted/`

## Deploy

Upload the contents of this repository to your web host’s document root.

Typical Bluehost / cPanel setup:
- Upload into `public_html/`
- Your pages will be served at:
  - `/index.html`
  - `/gallery.html`
  - `/projects/<project>.html`

No server-side code is required.

## Local preview

From the repo root:

- Python:
  - `python -m http.server 8000`
  - Visit `http://localhost:8000/`

(Using a local server is recommended so PDFs, images, and relative links behave like production.)

## Gallery deep links (QR-friendly)

`gallery.html` supports opening a specific image directly via the URL hash.

Examples:
- `gallery.html#droneani`
- `gallery.html#prop-hotfire`
- `gallery.html#control-analysis`

Closing the lightbox clears the hash so users “back out” to the gallery grid cleanly.

## Editing content

- Project pages are in `projects/`.
- Images are referenced from `assets/img/`.
- PDFs are referenced from `assets/pdf/`.

If you update a PDF and your browser still shows an older version, it’s usually caching. A quick workaround is:
- Hard refresh / open in an incognito window, or
- Change the filename (best), or
- Add a one-time query string when sharing (e.g. `...pdf?v=20260221`).

## Notes

- `particles.js-master/` is vendored to avoid external CDN dependencies.
- The site disables the particles effect when `prefers-reduced-motion: reduce` is enabled.
