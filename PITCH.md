# Walk-In Pitch Guide: Ultra Football Shirts (`2 Danby Wynd, Yarm TS15 9SF`)

Prepared for **Mark Aszkenasy** — Danby Wynd In-Person Demo Brief

---

## 1. Key Phase 1 Intelligence (Your Secret Weapon)

Before walking down **Danby Wynd** off Yarm High Street, keep these two verified technical discoveries in mind:

1. **Legacy Storefront (`copaclassics.co.uk`) is Dead (HTTP 404):**
   Returns `"This store is unavailable"` — an abandoned hosted storefront.
2. **`ultrafootballshirts.co.uk` is Already Owned (`05 Apr 2025 – 05 Apr 2027`) — But Currently Broken:**
   - WHOIS confirms the domain is actively registered right through to **05 April 2027**.
   - However, visiting `ultrafootballshirts.co.uk` currently throws an **SSL handshake failure / Cloudflare Error 1001** because a previous **Shopify / Cloudflare** DNS connection broke when the store plan lapsed or disconnected.
   - **Why this matters:** You are *not* trying to talk them into buying a domain or signing back up to a £30/month e-commerce subscription they already got tired of paying for. You can offer to **fix the domain they already own** and point it at a **zero-monthly-fee** site built specifically around **1-of-1 shirts** and **2 Danby Wynd Click & Collect**.

---

## 2. 20-Second Danby Wynd Walk-In Script

> *"Hiya — I’m Mark, I’m local and build websites for independent Yarm shops. I noticed `ultrafootballshirts.co.uk` is registered right through to 2027, so you already own the domain, though at the minute it’s throwing a broken Cloudflare/Shopify error screen. Because 1-of-1 shirts are a pain to manage on heavy monthly shop platforms, I mocked up a lightweight concept on my phone showing a Click & Collect rail for 2 Danby Wynd with a 1-tap phone stock toggle. Have you got 30 seconds to have a quick look?"*

---

## 3. The 3-Tap Counter Demo (Under 30 Seconds on Your Phone)

Have `index.html` open on your phone before stepping in:

1. **Tap 1 — Filter the Rail (`index.html#stock-room`):**
   Tap **`1980s–90s`** and **`L`** in the Stock Room filter bar.
   *Say:* *"Collectors travelling into Yarm want to know if you’ve got their size before walking down the wynd — they can filter the rail in one tap."*
2. **Tap 2 — Reserve for Danby Wynd Inspection:**
   Tap **`Reserve / Enquire (Click & Collect)`** on any shirt card to pop open the pre-filled reservation drawer.
   *Say:* *"Instead of fiddly shipping matrices or card chargebacks, a local buyer taps Reserve to hold that exact shirt for a few hours and inspects it over the counter right here."*
3. **Tap 3 — 10-Second Owner Stock Toggle (`admin.html`):**
   Tap **`Owner Admin Demo`** in the top bar -> tap **`Reserved`** (or **`Sold`**) on the top shirt -> tap **`Check Changes on Shopfront →`**.
   *Say:* *"And if someone buys a shirt over the counter five minutes later, you tap 'Sold' once on your phone and it’s updated immediately — no £30/month Shopify fees."*

---

## 4. Likely Objections & Crisp Replies

- **"We tried Shopify before and paying £25–£35 every month wasn’t worth the hassle."**
  > *"That’s exactly why `ultrafootballshirts.co.uk` is showing Error 1001 right now — Shopify’s Cloudflare record stays stuck when a plan stops. This setup has **zero monthly platform fee**. We just repoint two DNS records on the domain you’ve already paid for until April 2027."*

- **"Every shirt is a 1-of-1 — uploading stock takes way too long."**
  > *"Standard online shops expect SKU tables, weight tiers, and five variants. With a 1-of-1 setup, it’s just one phone photo on the hanger, size, condition grade (like 9/10 Mint), and price — 15 seconds from your phone, and one tap to mark it Sold."*

- **"We post new arrivals on Instagram / Vinted anyway."**
  > *"Instagram is brilliant for regulars, but anyone Googling 'retro football shirts Yarm' or 'football shirts Teesside' misses Danby Wynd because it’s tucked off the High Street — or worse, clicks your domain and thinks you’ve closed down because of the error page. This gives Google a proper home base and can link straight out to your Instagram or Vinted too."*

- **"People want to check vintage shirts are genuine and see how they fit before paying."**
  > *"Spot on — a 1994 Medium fits completely differently to a 2004 Medium. That’s why the whole flow pushes **Click & Collect at 2 Danby Wynd** and has a dedicated **Sell / Trade & Condition Guide** page (`sell-find.html`) so people bring collections in to you too."*

---

## 5. Complete `[...]` Placeholder Checklist (To Confirm Before Live Launch)

Every unknown or unverified detail in this demo is transparently flagged in `[...]` brackets so zero stock, reviews, or terms are fabricated:

- [ ] **`[Shop opening hours – owner to confirm]`** — Regular weekly & matchday/weekend opening times at `2 Danby Wynd, Yarm TS15 9SF`.
- [ ] **`[Phone – owner to confirm]`** — Shop phone / WhatsApp number (if the owner wants phone enquiries displayed; currently no `tel:` link is used).
- [ ] **`[Email / Instagram – owner to confirm]`** — Official email address for Reserve / Sell-or-Trade form delivery + verified social handles.
- [ ] **`[Illustrative sample listing – owner stock to supply]`** — Replace all 8 geometric SVG sample cards with real photos of authentic shirts currently on the Danby Wynd rails.
- [ ] **`[£Price – owner to confirm]`** — Actual retail prices for initial launch listings.
- [ ] **`[Postage options – owner to confirm]`** — Confirm whether UK tracked postage is offered alongside 2 Danby Wynd Click & Collect, and flat postage rate if applicable.
- [ ] **`[Hold window – owner to confirm]`** — How long a Click & Collect reservation holds a shirt (e.g. same-day / 24 hours).
- [ ] **`[Grading policy – owner to confirm]`** — Confirm exact condition scale (`BNWT`, `9/10`, `8/10`, `7/10`), sizing measurement style (pit-to-pit inches), and authenticity/returns wording on `sell-find.html`.
- [ ] **`[Buy/trade process – owner to confirm]`** — How the owner prefers locals to bring in or message photos of classic shirt collections to sell or trade.
- [ ] **Real Shop Photography** — Replace `images/hero.jpg` and `images/feature.jpg` (AI-generated illustrative placeholders) with real photos of the 2 Danby Wynd shopfront, wynd entrance off Yarm High Street, and shirt rails.
- [ ] **Domain DNS Repoint (`ultrafootballshirts.co.uk`)** — Remove stale Shopify/Cloudflare `A`/`CNAME` records causing Error 1001 and point to live hosting with fresh HTTPS.

---

## Set D — The Sticker Album (`/d/`)

- **Live Concept URL:** https://tedotedo.github.io/ultra-football-shirts-demo/d/
- **What it is:** Every 1-of-1 shirt is a sticker in an album. Collectors mark Got or Need, and the Need list becomes a Click & Collect reservation.
- **Reach it from any page:** tap **D** in the Concept switcher in the top banner.

### 3-Tap Phone Demo (Set D)
1. Tap the **1990s** page chip, then **Need** on two stickers: the counter on the cover updates.
2. Scroll to **Next drop opens in** to show the live countdown.
3. Tap **Needs list** in the bottom bar: both shirts are waiting there, ready to reserve.

### One-Line Pitch
> *"Got, got, need. Every collector knows the feeling, and it gives them a reason to check back every week."*

### Know Before You Show
- All twelve shirts are drawn sample graphics, not stock, with no real clubs or crests. The Friday 6pm drop time is an assumption.
- Demo only: no form sends anything, and unknown details stay as bracketed `[...]` placeholders for the owner to confirm.
