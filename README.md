# nettverk-site

Statische Website für https://nettverk.app, gebaut mit Astro (Output `static`), reines CSS, Roboto selbst gehostet (`@fontsource/roboto`). Keine CDNs, Tracker oder externen Schriften.

Herkunft: Port der Flutter-Website (Flutter-Web-Repo, Stand Commit 88ad1a0 vom 04.04.2025), optisch dem Original nachgebaut. Rechtstexte wortwörtlich aus den Dart-Dateien (`src/content/*.html`).

Hosting: GitHub Pages über `.github/workflows/deploy.yml` (withastro/action, Push auf `main`). Domain per `public/CNAME`, `public/.nojekyll`.

Alte Flutter-Hash-URLs (`/#/impressum` usw.) leitet ein Inline-Skript in `index.html` auf `/impressum/` usw. um.

Befehle: `npm ci`, `npm run dev`, `npm run build` (nach `dist/`), `npm run preview`.
Visueller Test: `npx playwright install chromium`, dann `npm run build && npm run test:visual` vergleicht den Build mit den Original-Screenshots in `tests/golden/` (Ergebnis und Diff-Bilder in `tests/out/`). `npm run golden` erzeugt die Referenzen neu, solange das Original online ist.
