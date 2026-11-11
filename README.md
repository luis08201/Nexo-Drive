# Nexo Drive

Bilingual driving-school website with public pages and demonstration portals for administrators, instructors, and students. Includes the approved Nexo Drive design, local images and fonts, and GSAP animations.

## Local preview

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000/. No installation or build step is required.

## GitHub Pages

In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. The workflow `.github/workflows/pages.yml` validates and publishes `dist/` on changes to `main` or manual dispatch. If the first run failed because Pages was not enabled, rerun it after selecting the source.

Relative assets work at both `/` and `/Nexo-Drive/`. Hash-based application routes support refresh and direct links without server rewrites. The successful deployment's output is the authoritative live URL.

## Structure

- `dist/index.html`: shell and CSS.
- `dist/assets/app.js`: public pages, dashboard demos, interactions and animations.
- `dist/assets/i18n.js`: English/Spanish translations and persistent preference.
- `dist/assets/fonts/`: General Sans and Inter.
- `dist/assets/vendor/`: GSAP, ScrollTrigger and Flip.
- `scripts/check_assets.py`: path and asset validation.

English is the default. The footer language selector remembers the visitor's choice. The internal `ruta-language` key is retained for compatibility.

## Validation

```sh
node --check dist/assets/app.js
node --check dist/assets/i18n.js
python3 scripts/check_assets.py
```

These checks do not replace visual browser QA. Check responsive layouts, language switching, form interactions, filtering, scroll animations and testimonial loops in a browser.

## Demo limitations

Login and all portals are frontend demonstrations. There is no secure authentication, server-side authorization, database, actual payment processing or email delivery. Do not enter sensitive data. A backend is required for production account and payment features.

## Third-party assets

General Sans comes from Fontshare; Inter from Rasmus Andersson. GSAP files retain their upstream license headers. Review the respective licenses and image rights before commercial redistribution. This repository does not grant ownership of third-party assets or claim an open-source license for them.
