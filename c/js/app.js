/* ==========================================================================
   ULTRA FOOTBALL SHIRTS — Concept C Collector's Marketplace Controller
   - Sticky segmented top tabs (Rail · Shirt Finder · Owner Scanner) + Scroll Progress
   - Toggleable inline Owner Scanner flipping sample shirts Available <-> Reserved
   - Clean 2-column mobile catalog grid with 10-bar stitch condition meters & filter chips
   - 1-Tap Collector Presets + Non-blocking Micro-Toast
   - Mobbin 3-Step Click & Collect / Shirt-Finder Stepper + Owner Receipt Ticket
   - Native <dialog> Editorial Photo Lightbox + Frosted Dock Auto-Clearance
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "ultra_football_shirts_demo_stock_v2";
  var EXACT_DEMO_MSG = "Demo only – in the live site this would go straight to Ultra Football Shirts.";
  var SAMPLE_SHORT = "[Illustrative sample – owner stock]";
  var PRICE_TAG = "[£Price – owner to confirm]";

  var DEFAULT_STOCK = [
    { id: "UFS-01", title: "1995–96 Teesside Crimson Chest-Band Home Style", era: "1990s", size: "L", condition: "9/10 Mint", score: 9, kit: "crimson-band", status: "Available" },
    { id: "UFS-02", title: "1988–90 Turf Emerald & Gold Pinstripe Third Style", era: "1980s", size: "M", condition: "8/10 Very Good", score: 8, kit: "turf-pinstripes", status: "Reserved" },
    { id: "UFS-03", title: "1993–95 Claret & Sky Jacquard Stripe Home Style", era: "1990s", size: "M", condition: "9.5/10 Mint", score: 10, kit: "claret-sky-stripes", status: "Available" },
    { id: "UFS-04", title: "1986–88 Matchday Amber & Charcoal Chevron Away Style", era: "1980s", size: "XL", condition: "8/10 Very Good", score: 8, kit: "amber-chevrons", status: "Available" },
    { id: "UFS-05", title: "2002–04 Albiceleste Sky & White Stripe Home Style", era: "2000s", size: "L", condition: "9/10 Mint", score: 9, kit: "sky-white-stripes", status: "Available" },
    { id: "UFS-06", title: "2005–06 Viola & Chalk Halves European Cup Style", era: "2000s", size: "S", condition: "10/10 BNWT", score: 10, kit: "viola-halves", status: "Available" },
    { id: "UFS-07", title: "1997–98 Midnight & Turf Diagonal Sash Away Style", era: "1990s", size: "XL", condition: "9/10 Mint", score: 9, kit: "midnight-sash", status: "Available" },
    { id: "UFS-08", title: "2017–18 Floodlight Navy & Copper Quarters Collector Cut", era: "Modern", size: "S", condition: "9.5/10 Mint", score: 10, kit: "navy-copper-quarters", status: "Available" }
  ];

  var memStock = null;
  var filterEra = "All";
  var filterSize = "All";
  var availOnly = false;
  var toastTimer = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showMicroToast(msg) {
    var el = document.getElementById("c-micro-toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.hidden = true;
    }, 2700);
  }

  function scoreForItem(item) {
    if (item.score) return Math.max(1, Math.min(10, Number(item.score)));
    var c = String(item.condition || "");
    if (c.indexOf("10") !== -1 || c.indexOf("BNWT") !== -1 || c.indexOf("9.5") !== -1) return 10;
    if (c.indexOf("9") !== -1) return 9;
    if (c.indexOf("8") !== -1) return 8;
    if (c.indexOf("7") !== -1) return 7;
    return 9;
  }

  function stitchShortForScore(score) {
    if (score >= 10) return "Stitch: Unworn weave & tags";
    if (score === 9) return "Stitch: Firm collar & crest";
    if (score === 8) return "Stitch: Sound seams, clean";
    return "Stitch: Honest patina";
  }

  function renderCondBars(score) {
    var html = "";
    for (var i = 1; i <= 10; i++) {
      html += '<span class="cat-seg' + (i <= score ? " is-on" : "") + '"></span>';
    }
    return html;
  }

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_STOCK));
  }

  function getStock() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) {
      if (memStock) return memStock;
    }
    return memStock || cloneDefaults();
  }

  function saveStock(list) {
    memStock = list;
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
  }

  function renderJerseySvg(kitKey, idSuffix) {
    var palettes = {
      "crimson-band": { base: "#B81D24", collar: "#FFFFFF", cuff: "#FFFFFF", pat: '<rect x="18" y="46" width="84" height="18" fill="#FFFFFF"/>' },
      "claret-sky-stripes": { base: "#6E1E36", collar: "#7BC4E8", cuff: "#7BC4E8", pat: '<rect x="14" y="18" width="16" height="92" fill="#7BC4E8"/><rect x="42" y="18" width="12" height="92" fill="#FFFFFF"/><rect x="66" y="18" width="12" height="92" fill="#FFFFFF"/><rect x="90" y="18" width="16" height="92" fill="#7BC4E8"/>' },
      "amber-chevrons": { base: "#F5C518", collar: "#0F172A", cuff: "#0F172A", pat: '<polygon points="18,40 60,62 102,40 102,52 60,74 18,52" fill="#0F172A"/><polygon points="18,64 60,86 102,64 102,75 60,97 18,75" fill="#0F172A"/>' },
      "sky-white-stripes": { base: "#FFFFFF", collar: "#0F172A", cuff: "#0F172A", pat: '<rect x="28" y="18" width="13" height="92" fill="#6BB6E6"/><rect x="53.5" y="18" width="13" height="92" fill="#6BB6E6"/><rect x="79" y="18" width="13" height="92" fill="#6BB6E6"/>' },
      "viola-halves": { base: "#4C2A85", collar: "#F5C518", cuff: "#F5C518", pat: '<rect x="60" y="18" width="52" height="92" fill="#FFFFFF"/><rect x="58.5" y="18" width="3" height="92" fill="#F5C518"/>' },
      "turf-pinstripes": { base: "#0D7A4E", collar: "#F5C518", cuff: "#F5C518", pat: '<rect x="34" y="18" width="2.5" height="92" fill="#F5C518"/><rect x="48" y="18" width="2.5" height="92" fill="#FFFFFF"/><rect x="69.5" y="18" width="2.5" height="92" fill="#FFFFFF"/><rect x="83.5" y="18" width="2.5" height="92" fill="#F5C518"/>' },
      "midnight-sash": { base: "#162435", collar: "#0D7A4E", cuff: "#0D7A4E", pat: '<polygon points="24,22 42,22 96,106 78,106" fill="#0D7A4E"/><polygon points="42,22 46,22 100,106 96,106" fill="#F5C518"/>' },
      "navy-copper-quarters": { base: "#142130", collar: "#D97B43", cuff: "#D97B43", pat: '<rect x="60" y="18" width="52" height="44" fill="#C96A34"/><rect x="10" y="62" width="50" height="48" fill="#C96A34"/>' }
    };
    var p = palettes[kitKey] || palettes["crimson-band"];
    var clip = "cclip-" + esc(idSuffix);
    var shirt = "M39 22 L49 29 L60 35 L71 29 L81 22 L106 34 L96 55 L84 50 L84 104 L36 104 L36 50 L24 55 L14 34 Z";
    return (
      '<svg viewBox="0 0 120 114" aria-hidden="true">' +
        '<defs><clipPath id="' + clip + '"><path d="' + shirt + '"/></clipPath></defs>' +
        '<g clip-path="url(#' + clip + ')"><rect x="10" y="18" width="100" height="92" fill="' + p.base + '"/>' + p.pat + '</g>' +
        '<path d="' + shirt + '" fill="none" stroke="#0F172A" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M40 21.5 L60 37 L80 21.5 L73 20.5 L60 30.5 L47 20.5 Z" fill="' + p.collar + '" stroke="#0F172A" stroke-width="1.2"/>' +
        '<path d="M15.5 36.5 L24.5 53.5" stroke="' + p.cuff + '" stroke-width="4"/>' +
        '<path d="M104.5 36.5 L95.5 53.5" stroke="' + p.cuff + '" stroke-width="4"/>' +
      '</svg>'
    );
  }

  function renderCatalogAndScanner() {
    var stock = getStock();
    var availCount = stock.filter(function (s) { return s.status === "Available"; }).length;

    var topAvail = document.getElementById("top-avail-pill");
    if (topAvail) topAvail.textContent = availCount + " Available";

    var visible = stock.filter(function (item) {
      var eraOk = filterEra === "All" || item.era === filterEra;
      var sizeOk = filterSize === "All" || item.size === filterSize;
      var avOk = !availOnly || item.status === "Available";
      return eraOk && sizeOk && avOk;
    });

    var countEl = document.getElementById("catalog-live-count");
    if (countEl) {
      countEl.textContent = "Showing " + visible.length + " of " + stock.length + " shirts · " + availCount + " Available";
    }

    var grid = document.getElementById("c-catalog-grid");
    if (grid) {
      if (!visible.length) {
        grid.innerHTML = '<div class="cat-card" style="grid-column: 1 / -1;"><p style="margin:0;">No sample shirts match those filters. Tap All Eras &amp; All Sizes above to reset.</p></div>';
      } else {
        grid.innerHTML = visible.map(function (item) {
          var stCls = item.status === "Available" ? "cat-status--avail" : (item.status === "Reserved" ? "cat-status--res" : "cat-status--sold");
          var summary = item.id + " · " + item.title + " (Size " + item.size + ")";
          var isSold = item.status === "Sold";
          var sc = scoreForItem(item);
          return (
            '<article class="cat-card">' +
              '<div class="cat-card__top">' +
                '<span class="cat-card__meta-pill">' + esc(item.era) + " · " + esc(item.size) + '</span>' +
                '<span class="cat-status ' + stCls + '">' + esc(item.status) + '</span>' +
              '</div>' +
              '<div class="cat-card__plinth">' +
                renderJerseySvg(item.kit, item.id) +
                '<span class="cat-card__illus">' + esc(SAMPLE_SHORT) + '</span>' +
              '</div>' +
              '<h3 class="cat-card__title">' + esc(item.title) + '</h3>' +
              '<div class="cat-cond-meter" aria-label="Condition grade ' + esc(item.condition) + '">' +
                '<div class="cat-cond-meter__top">' +
                  '<span>' + esc(item.condition) + '</span>' +
                '</div>' +
                '<div class="cat-cond-bars" aria-hidden="true">' + renderCondBars(sc) + '</div>' +
                '<div class="cat-cond-meter__stitch">' + esc(stitchShortForScore(sc)) + '</div>' +
              '</div>' +
              '<div class="cat-card__specs">' +
                esc(PRICE_TAG) +
              '</div>' +
              '<button type="button" class="cat-card__btn" data-load-stepper="' + esc(summary) + '" data-load-size="' + esc(item.size) + '"' + (isSold ? " disabled" : "") + '>' +
                (isSold ? "Sold" : "Hold / Enquire") +
              '</button>' +
            '</article>'
          );
        }).join("");
      }
    }

    var scannerGrid = document.getElementById("scanner-rows");
    if (scannerGrid) {
      scannerGrid.innerHTML = stock.map(function (item) {
        var isAvail = item.status === "Available";
        return (
          '<div class="scan-row">' +
            '<div class="scan-row__info">' +
              '<span class="scan-row__code">' + esc(item.id) + " · Size " + esc(item.size) + '</span>' +
              '<span class="scan-row__name">' + esc(item.title) + '</span>' +
            '</div>' +
            '<button type="button" class="flip-btn ' + (isAvail ? "flip-btn--avail" : "flip-btn--res") + '" data-flip-id="' + esc(item.id) + '" aria-label="Flip status for ' + esc(item.id) + '">' +
              (isAvail ? "✓ Available" : "⏱ Reserved") +
            '</button>' +
          '</div>'
        );
      }).join("");
    }
  }

  /* Segmented Tabs + Toggleable Inline Scanner */
  var scannerDrawer = document.getElementById("owner-scanner-drawer");
  var toggleVisBtn = document.getElementById("toggle-scanner-visibility");
  var segScannerBtn = document.getElementById("seg-scanner-btn");
  var segTabs = document.querySelectorAll("[data-seg-tab]");

  function setScannerOpen(open) {
    if (!scannerDrawer) return;
    scannerDrawer.hidden = !open;
    if (toggleVisBtn) {
      toggleVisBtn.setAttribute("aria-expanded", String(open));
      toggleVisBtn.textContent = open ? "Hide Scanner" : "Open Scanner";
    }
    if (segScannerBtn) {
      segScannerBtn.setAttribute("aria-expanded", String(open));
    }
  }

  if (toggleVisBtn) {
    toggleVisBtn.addEventListener("click", function () {
      setScannerOpen(scannerDrawer.hidden);
    });
  }

  for (var st = 0; st < segTabs.length; st++) {
    segTabs[st].addEventListener("click", function () {
      for (var k = 0; k < segTabs.length; k++) {
        segTabs[k].classList.toggle("is-active", segTabs[k] === this);
      }
      if (this.getAttribute("data-seg-tab") === "scanner") {
        setScannerOpen(true);
        var scanSec = document.getElementById("owner-scanner");
        if (scanSec) scanSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  var resetStockBtn = document.getElementById("reset-c-stock");
  if (resetStockBtn) {
    resetStockBtn.addEventListener("click", function () {
      saveStock(cloneDefaults());
      renderCatalogAndScanner();
      showMicroToast("Demo stock reset to default 8 shirts.");
    });
  }

  function makeRefCode() {
    return "UFS-2026-" + Math.floor(1000 + Math.random() * 9000);
  }

  function copyText(txt, btnEl) {
    function done() {
      if (btnEl) {
        var orig = btnEl.textContent;
        btnEl.textContent = "Copied ✓";
        setTimeout(function () { btnEl.textContent = orig; }, 1800);
      }
      showMicroToast("Enquiry summary copied to clipboard.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done).catch(function () {
        fallbackCopy(txt);
        done();
      });
    } else {
      fallbackCopy(txt);
      done();
    }
  }

  function fallbackCopy(txt) {
    try {
      var ta = document.createElement("textarea");
      ta.value = txt;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (_) {}
  }

  /* Mobbin 3-Step Stepper */
  var modeCards = document.querySelectorAll("[data-req-mode]");
  var modeInput = document.getElementById("m-mode-val");
  var sizePicks = document.querySelectorAll("[data-pick-size]");
  var sizeInput = document.getElementById("m-size-input");
  var stepPills = document.querySelectorAll("[data-m-step]");
  var mPanes = document.querySelectorAll("[data-m-pane]");
  var mBar = document.getElementById("m-progress-bar");
  var mCaption = document.getElementById("m-step-caption");
  var marketForm = document.getElementById("c-market-form");
  var successBox = document.getElementById("m-success");
  var ownerTicketWrap = document.getElementById("m-owner-ticket");

  function selectMode(modeStr) {
    if (modeInput) modeInput.value = modeStr;
    for (var i = 0; i < modeCards.length; i++) {
      var match = modeCards[i].getAttribute("data-req-mode") === modeStr;
      modeCards[i].classList.toggle("is-selected", match);
      modeCards[i].setAttribute("aria-pressed", String(match));
    }
    syncStepSummary();
  }

  function selectSizeChip(sz) {
    if (sizeInput) sizeInput.value = sz;
    for (var i = 0; i < sizePicks.length; i++) {
      var match = sizePicks[i].getAttribute("data-pick-size") === sz;
      sizePicks[i].classList.toggle("is-selected", match);
      sizePicks[i].setAttribute("aria-pressed", String(match));
    }
    syncStepSummary();
  }

  for (var mc = 0; mc < modeCards.length; mc++) {
    modeCards[mc].addEventListener("click", function () {
      selectMode(this.getAttribute("data-req-mode"));
    });
  }

  for (var sp = 0; sp < sizePicks.length; sp++) {
    sizePicks[sp].addEventListener("click", function () {
      selectSizeChip(this.getAttribute("data-pick-size"));
    });
  }

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || "";
  }

  function validateMStep1() {
    var val = ((document.getElementById("m-shirt-input") || {}).value || "").trim();
    if (!val) {
      setErr("m-shirt-err", "Please enter or select a shirt to continue.");
      return false;
    }
    setErr("m-shirt-err", "");
    return true;
  }

  function syncStepSummary() {
    var sMode = document.getElementById("m-sum-mode");
    var sShirt = document.getElementById("m-sum-shirt");
    var sHand = document.getElementById("m-sum-handover");
    if (sMode && modeInput) sMode.textContent = modeInput.value;
    if (sShirt) {
      var sh = ((document.getElementById("m-shirt-input") || {}).value || "");
      var sz = (sizeInput || {}).value || "";
      sShirt.textContent = sh + " [Size: " + sz + "]";
    }
    if (sHand) {
      var ho = document.getElementById("m-handover");
      if (ho) sHand.textContent = ho.value;
    }
  }

  function goMarketStep(stepNum) {
    if (successBox && !successBox.hidden) {
      successBox.hidden = true;
      if (marketForm) marketForm.hidden = false;
    }
    for (var p = 0; p < mPanes.length; p++) {
      mPanes[p].hidden = Number(mPanes[p].getAttribute("data-m-pane")) !== stepNum;
    }
    for (var s = 0; s < stepPills.length; s++) {
      var idx = Number(stepPills[s].getAttribute("data-m-step"));
      stepPills[s].classList.toggle("is-current", idx === stepNum);
      stepPills[s].classList.toggle("is-done", idx < stepNum);
    }
    if (mBar) mBar.style.width = (stepNum * 33.333).toFixed(2) + "%";
    if (mCaption) {
      var caps = {
        1: "Step 1 of 3 — Choose request mode & shirt",
        2: "Step 2 of 3 — Select preferred size & 2 Danby Wynd handover",
        3: "Step 3 of 3 — Enter contact details & submit"
      };
      mCaption.textContent = caps[stepNum] || "";
    }
    syncStepSummary();
  }

  /* Delegated Clicks: Scanner 1-Tap Flip, Catalog Filters, Presets, Load Stepper, Lightbox & Receipt */
  document.addEventListener("click", function (e) {
    var flipBtn = e.target.closest("[data-flip-id]");
    if (flipBtn) {
      var id = flipBtn.getAttribute("data-flip-id");
      var list = getStock();
      var updatedStatus = "";
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i].status = list[i].status === "Available" ? "Reserved" : "Available";
          updatedStatus = list[i].status;
          break;
        }
      }
      saveStock(list);
      renderCatalogAndScanner();
      showMicroToast(id + " flipped to " + updatedStatus);
      return;
    }

    var eraBtn = e.target.closest("[data-c-era]");
    if (eraBtn) {
      filterEra = eraBtn.getAttribute("data-c-era");
      var allE = document.querySelectorAll("[data-c-era]");
      for (var a = 0; a < allE.length; a++) {
        var on = allE[a] === eraBtn;
        allE[a].classList.toggle("is-on", on);
        allE[a].setAttribute("aria-pressed", String(on));
      }
      renderCatalogAndScanner();
      showMicroToast("Era filter: " + filterEra);
      return;
    }

    var sizeBtn = e.target.closest("[data-c-size]");
    if (sizeBtn) {
      filterSize = sizeBtn.getAttribute("data-c-size");
      var allS = document.querySelectorAll("[data-c-size]");
      for (var b = 0; b < allS.length; b++) {
        var sOn = allS[b] === sizeBtn;
        allS[b].classList.toggle("is-on", sOn);
        allS[b].setAttribute("aria-pressed", String(sOn));
      }
      renderCatalogAndScanner();
      showMicroToast("Size filter: " + filterSize);
      return;
    }

    var presetBtn = e.target.closest("[data-c-preset]");
    if (presetBtn) {
      var key = presetBtn.getAttribute("data-c-preset");
      var allP = document.querySelectorAll("[data-c-preset]");
      for (var px = 0; px < allP.length; px++) {
        allP[px].classList.toggle("is-active", allP[px].getAttribute("data-c-preset") === key);
      }
      var shirtInp = document.getElementById("m-shirt-input");
      var handSel = document.getElementById("m-handover");
      var notesInp = document.getElementById("m-notes");

      if (key === "serie-a-grail") {
        selectMode("Shirt Finder (Grail Request)");
        if (shirtInp) shirtInp.value = "90s Serie A Grail Search — Original woven jacquard shirt (9/10 Mint+)";
        selectSizeChip("L");
        if (handSel) handSel.selectedIndex = 0;
        if (notesInp) notesInp.value = "Please message if an original mid-1990s Serie A classic in Size M or L lands at 2 Danby Wynd.";
        goMarketStep(3);
        showMicroToast("Preset loaded: 90s Serie A Grail Search → Step 3.");
      } else if (key === "sell-collection") {
        selectMode("Sell / Trade Shirts");
        if (shirtInp) shirtInp.value = "Classic 1980s/90s Collector Bundle (6 original shirts, authentic neck tags)";
        selectSizeChip("Any / Bundle");
        if (handSel) handSel.selectedIndex = 2;
        if (notesInp) notesInp.value = "Looking to bring collection into 2 Danby Wynd for over-the-counter valuation/trade.";
        goMarketStep(3);
        showMicroToast("Preset loaded: Sell a Classic Collection → Step 3.");
      } else if (key === "hold-90s") {
        filterEra = "1990s";
        var eBtns = document.querySelectorAll("[data-c-era]");
        for (var eb = 0; eb < eBtns.length; eb++) {
          var is90 = eBtns[eb].getAttribute("data-c-era") === "1990s";
          eBtns[eb].classList.toggle("is-on", is90);
          eBtns[eb].setAttribute("aria-pressed", String(is90));
        }
        renderCatalogAndScanner();
        selectMode("Click & Collect Hold");
        if (shirtInp) shirtInp.value = "UFS-01 · 1995–96 Teesside Crimson Chest-Band Home Style (Size L)";
        selectSizeChip("L");
        if (handSel) handSel.selectedIndex = 0;
        if (notesInp) notesInp.value = "Hold at 2 Danby Wynd counter to inspect woven collar and pit-to-pit fit.";
        goMarketStep(3);
        showMicroToast("Preset loaded: Top 90s Shirt ready in Step 3.");
      }
      var finderSec = document.getElementById("shirt-finder");
      if (finderSec) finderSec.scrollIntoView({ behavior: "smooth" });
      return;
    }

    var loadBtn = e.target.closest("[data-load-stepper]");
    if (loadBtn && !loadBtn.disabled) {
      var shirtVal = loadBtn.getAttribute("data-load-stepper");
      var sz = loadBtn.getAttribute("data-load-size") || "L";
      var shirtInput = document.getElementById("m-shirt-input");
      if (shirtInput) shirtInput.value = shirtVal;
      selectMode("Click & Collect Hold");
      selectSizeChip(sz);
      goMarketStep(1);
      var fSec = document.getElementById("shirt-finder");
      if (fSec) fSec.scrollIntoView({ behavior: "smooth" });
      showMicroToast("Loaded into 3-Step Hold Stepper.");
      return;
    }

    var copyBtn = e.target.closest("[data-c-copy]");
    if (copyBtn) {
      var rec = copyBtn.closest("[data-plain-receipt]");
      if (rec) copyText(rec.getAttribute("data-plain-receipt"), copyBtn);
      return;
    }

    var resetRec = e.target.closest("[data-c-reset]");
    if (resetRec) {
      if (successBox) successBox.hidden = true;
      if (marketForm) {
        marketForm.reset();
        var shInput = document.getElementById("m-shirt-input");
        if (shInput) shInput.value = "UFS-01 · 1995–96 Teesside Crimson Chest-Band Home Style (Size L)";
        selectMode("Click & Collect Hold");
        selectSizeChip("L");
        marketForm.hidden = false;
      }
      var pChips = document.querySelectorAll("[data-c-preset]");
      for (var pc = 0; pc < pChips.length; pc++) pChips[pc].classList.remove("is-active");
      goMarketStep(1);
      showMicroToast("Demo stepper reset.");
      return;
    }

    var lbTrig = e.target.closest(".is-c-lightbox");
    if (lbTrig) {
      e.preventDefault();
      openPhotoLightbox(lbTrig);
      return;
    }

    if (e.target.closest("[data-c-lightbox-close]") || e.target.closest("[data-c-lightbox-jump]")) {
      closePhotoLightbox();
    }
  });

  var availChip = document.getElementById("avail-only-chip");
  if (availChip) {
    availChip.addEventListener("click", function () {
      availOnly = !availOnly;
      this.setAttribute("aria-pressed", String(availOnly));
      renderCatalogAndScanner();
      showMicroToast(availOnly ? "Showing Available shirts only." : "Showing all shirts.");
    });
  }

  document.getElementById("m-next-2").addEventListener("click", function () {
    if (validateMStep1()) goMarketStep(2);
  });
  document.getElementById("m-back-1").addEventListener("click", function () {
    goMarketStep(1);
  });
  document.getElementById("m-next-3").addEventListener("click", function () {
    goMarketStep(3);
  });
  document.getElementById("m-back-2").addEventListener("click", function () {
    goMarketStep(2);
  });

  for (var pillIdx = 0; pillIdx < stepPills.length; pillIdx++) {
    stepPills[pillIdx].addEventListener("click", function () {
      var target = Number(this.getAttribute("data-m-step"));
      if (target === 1 || validateMStep1()) {
        goMarketStep(target);
      }
    });
  }

  if (marketForm) {
    marketForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateMStep1()) {
        goMarketStep(1);
        return;
      }
      var n = ((document.getElementById("m-name") || {}).value || "").trim();
      var c = ((document.getElementById("m-contact") || {}).value || "").trim();
      var ok = true;
      if (!n) { setErr("m-name-err", "Please enter your name."); ok = false; } else { setErr("m-name-err", ""); }
      if (!c) { setErr("m-contact-err", "Please enter an email or mobile number."); ok = false; } else { setErr("m-contact-err", ""); }
      if (!ok) {
        if (!n) document.getElementById("m-name").focus();
        else document.getElementById("m-contact").focus();
        return;
      }

      var exactEl = successBox.querySelector(".m-success__exact");
      if (exactEl) exactEl.textContent = EXACT_DEMO_MSG;

      var ref = makeRefCode();
      var reqMode = modeInput ? modeInput.value : "Click & Collect Hold";
      var shirtVal = (document.getElementById("m-shirt-input") || {}).value || "2 Danby Wynd Shirt";
      var szVal = (sizeInput || {}).value || "L";
      var hoVal = (document.getElementById("m-handover") || {}).value || "Inspect at 2 Danby Wynd";
      var notesVal = ((document.getElementById("m-notes") || {}).value || "").trim();
      var fullDetails = shirtVal + " [Size: " + szVal + "]" + (notesVal ? " — " + notesVal : "");

      var plain =
        "Ultra Football Shirts — Enquiry Ticket (" + ref + ")\n" +
        "Collector: " + n + "\n" +
        "Contact: " + c + "\n" +
        "Request Type: " + reqMode + " · " + hoVal + "\n" +
        "Shirt & Size Details: " + fullDetails;

      if (ownerTicketWrap) {
        ownerTicketWrap.innerHTML =
          '<div class="c-owner-receipt" data-plain-receipt="' + esc(plain) + '">' +
            '<div class="c-owner-receipt__head">' +
              '<span>What Ultra Football Shirts Receives</span>' +
              '<span>REF // ' + esc(ref) + '</span>' +
            '</div>' +
            '<dl class="c-owner-receipt__dl">' +
              '<div class="c-owner-receipt__row"><dt>Collector</dt><dd>' + esc(n) + '</dd></div>' +
              '<div class="c-owner-receipt__row"><dt>Contact</dt><dd>' + esc(c) + '</dd></div>' +
              '<div class="c-owner-receipt__row"><dt>Request</dt><dd>' + esc(reqMode + " · " + hoVal) + '</dd></div>' +
              '<div class="c-owner-receipt__row"><dt>Shirt Details</dt><dd>' + esc(fullDetails) + '</dd></div>' +
            '</dl>' +
            '<div class="c-owner-receipt__actions">' +
              '<button type="button" class="c-receipt-btn" data-c-copy>Copy Summary</button>' +
              '<button type="button" class="c-receipt-btn c-receipt-btn--outline" data-c-reset>Reset Demo</button>' +
            '</div>' +
          '</div>';
      }

      marketForm.hidden = true;
      successBox.hidden = false;
      successBox.focus();
      showMicroToast("3-step enquiry ticket generated.");
    });
  }

  /* Sticky Header Scroll-Progress Hairline */
  var progBar = document.getElementById("c-scroll-progress");
  if (progBar) {
    var progTick = false;
    var updateProg = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var r = h > 40 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      progBar.style.transform = "scaleX(" + r.toFixed(4) + ")";
      progTick = false;
    };
    window.addEventListener("scroll", function () {
      if (!progTick) {
        progTick = true;
        window.requestAnimationFrame(updateProg);
      }
    }, { passive: true });
    updateProg();
  }

  /* Native <dialog> Editorial Photo Lightbox */
  var lbDialog = document.getElementById("c-photo-lightbox");
  var lbImg = document.getElementById("c-lightbox-img");
  var lbCap = document.getElementById("c-lightbox-caption");
  var lastLbTrigger = null;

  function openPhotoLightbox(trigEl) {
    if (!lbDialog) return;
    var src = trigEl.getAttribute("data-lightbox-src");
    if (!src) return;
    lastLbTrigger = trigEl;
    if (lbImg) {
      lbImg.src = src;
      lbImg.alt = trigEl.getAttribute("data-lightbox-alt") || "Illustrative concept image";
    }
    if (lbCap) lbCap.textContent = trigEl.getAttribute("data-lightbox-caption") || "";
    if (typeof lbDialog.showModal === "function") {
      if (!lbDialog.open) lbDialog.showModal();
    } else {
      lbDialog.setAttribute("open", "");
    }
  }

  function closePhotoLightbox() {
    if (!lbDialog) return;
    if (lbDialog.open && typeof lbDialog.close === "function") {
      lbDialog.close();
    } else {
      lbDialog.removeAttribute("open");
    }
    if (lastLbTrigger && typeof lastLbTrigger.focus === "function") {
      lastLbTrigger.focus();
    }
  }

  if (lbDialog) {
    lbDialog.addEventListener("click", function (e) {
      if (e.target === lbDialog) closePhotoLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && document.activeElement &&
        document.activeElement.classList && document.activeElement.classList.contains("is-c-lightbox")) {
      e.preventDefault();
      openPhotoLightbox(document.activeElement);
    }
  });

  /* Frosted Floating Dock Auto-Clearance over Form & Footer */
  var dock = document.querySelector(".mobile-market-dock");
  if (dock && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll("#c-market-form, #m-success, .gallery-footer");
    var seen = new Set();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) seen.add(entry.target);
        else seen.delete(entry.target);
      });
      dock.classList.toggle("is-cleared", seen.size > 0);
    }, { threshold: 0.01 });
    targets.forEach(function (el) { obs.observe(el); });
  }

  renderCatalogAndScanner();
})();
