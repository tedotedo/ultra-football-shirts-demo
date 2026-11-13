# Ultra Football Shirts — Concept Website & 10-Second Stock Admin Demo

**Concept proposal by Mark Aszkenasy** for **Ultra Football Shirts**, `2 Danby Wynd, Yarm TS15 9SF` *(not the official website of Ultra Football Shirts)*.

---

## Overview & Domain Context

Ultra Football Shirts operates from **2 Danby Wynd, Yarm TS15 9SF**, tucked just off Yarm High Street. Phase 1 technical research uncovered two critical facts:

1. Legacy domain `copaclassics.co.uk` returns **HTTP 404** (`"This store is unavailable"`).
2. **`ultrafootballshirts.co.uk` is actively registered (`05 Apr 2025 – 05 Apr 2027`)**, but currently fails with an **SSL handshake error / Cloudflare Error 1001** due to a broken Shopify/Cloudflare DNS target.

This static, zero-dependency concept demo shows how the owner can repoint the domain they *already own* to a fast, zero-monthly-fee online kit room purpose-built for **1-of-1 vintage shirts**, **Click & Collect at 2 Danby Wynd**, **buying/trading local collections**, and **10-second mobile stock status toggles**.

---

## Included Pages & Assets

| File | Purpose |
| :--- | :--- |
| `index.html` | **Home & Interactive 1-of-1 Stock Room** — Floodlight kit-room hero, multi-axis Era / Size / Availability live filter over 8 non-branded geometric SVG sample shirt listings, accessible **Click & Collect / Reserve** modal drawer, and 2 Danby Wynd directions. |
| `sell-find.html` | **Sell / Trade Your Shirts & Condition Guide** — Proposed collector condition grading scale (`BNWT`, `9/10 Mint`, `8/10 Very Good`, `7/10 Good`), pit-to-pit fit notes, and dummy **Sell / Trade or Hunting a Grail** enquiry form. |
| `admin.html` | **10-Second Owner Stock Admin Demo** — Phone-friendly rail overview with 1-tap `Available` / `Reserved` / `Sold` toggles, quick **Add 1-of-1 Shirt** form, and **Reset Demo Stock** control synced via `sessionStorage` to `index.html`. |
| `css/styles.css` | Mobile-first stylesheet (`#F4F6F8` chalk-pitch canvas, `#0E151C` floodlight midnight surfaces, `#0B7A53` electric turf emerald, `#F2C12E` matchday amber; WCAG AA contrast verified >= 4.5:1). |
| `js/app.js` | Self-contained vanilla JS powering accessible mobile nav (`Escape` closes), multi-axis stock filtering, focus-trapped reservation modal, client-side dummy form handlers, non-branded geometric SVG kit rendering, and `sessionStorage` admin sync. |
| `favicon.svg` & `images/logo-mark.svg` | Custom non-branded geometric shirt & pitch-corner SVG emblems. |
| `fonts/` | Self-hosted `woff2` fonts (`Space Grotesk`, `IBM Plex Sans`, `IBM Plex Mono`) — zero external font or CDN requests. |
| `images/hero.jpg` & `images/feature.jpg` | AI-generated illustrative editorial images (`1440x803` and `1200x896`), explicitly captioned `Illustrative image`. |
| `PITCH.md` | Walk-in script, 3-tap counter walkthrough, objection handlers, and `[...]` owner confirmation checklist. |

---

## Compliance & Honesty Safeguards

- `<meta name="robots" content="noindex, nofollow">` present in `<head>` of every HTML page.
- Persistent top banner on every page: `Concept design by Mark Aszkenasy – not the official website of Ultra Football Shirts.`
- Zero invented reviews, ratings, phone numbers, opening hours, or real stock claims:
  - Every sample shirt card displays `[Illustrative sample listing – owner stock to supply]` and `[£Price – owner to confirm]`.
  - Unknown business fields use explicit `[...]` placeholders (`[Phone – owner to confirm]`, `[Shop opening hours – owner to confirm]`, `[Postage options – owner to confirm]`, `[Grading policy – owner to confirm]`).
- Every form uses real `<label for="...">` bindings, prevents network submission, and displays the exact notice:
  `Demo only – in the live site this would go straight to Ultra Football Shirts.`
- Zero external runtime requests (only the external user-clicked Google Maps link for `2 Danby Wynd, Yarm TS15 9SF`).

---

## Local Preview

Open directly or serve statically from this directory:

```bash
python3 -m http.server 8080 --directory "/Users/odet/Downloads/Yarm websites/ultra-football-shirts-demo"
```

Then visit `http://localhost:8080/index.html`.

## Set D — The Sticker Album

- `d/index.html`, `d/css/styles.css`, `d/js/app.js` — Every 1-of-1 shirt is a sticker in an album. Collectors mark Got or Need, and the Need list becomes a Click & Collect reservation.
- Live at https://tedotedo.github.io/ultra-football-shirts-demo/d/. Reuses the root `fonts/` and `images/`; same `noindex`, zero external requests and `.ph` placeholder rules as Sets A–C.
- All twelve shirts are drawn sample graphics, not stock, with no real clubs or crests. The Friday 6pm drop time is an assumption.
