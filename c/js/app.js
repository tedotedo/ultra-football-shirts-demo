/* ==========================================================================
   ULTRA FOOTBALL SHIRTS — Concept C Collector's Marketplace Controller
   - Sticky segmented top tabs (Rail · Shirt Finder · Owner Scanner)
   - Toggleable inline Owner Scanner flipping sample shirts Available <-> Reserved
   - Clean 2-column mobile catalog grid with live count + Era/Size filter chips
   - Mobbin 3-Step Click & Collect / Shirt-Finder Stepper
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "ultra_football_shirts_demo_stock_v2";
  var EXACT_DEMO_MSG = "Demo only – in the live site this would go straight to Ultra Football Shirts.";
  var SAMPLE_SHORT = "[Illustrative sample – owner stock]";
  var PRICE_TAG = "[£Price – owner to confirm]";

  var DEFAULT_STOCK = [
    { id: "UFS-01", title: "1995–96 Teesside Crimson Chest-Band Home Style", era: "1990s", size: "L", condition: "9/10 Mint", kit: "crimson-band", status: "Available" },
    { id: "UFS-02", title: "1988–90 Turf Emerald & Gold Pinstripe Third Style", era: "1980s", size: "M", condition: "8/10 Very Good", kit: "turf-pinstripes", status: "Reserved" },
    { id: "UFS-03", title: "1993–95 Claret & Sky Jacquard Stripe Home Style", era: "1990s", size: "M", condition: "9.5/10 Mint", kit: "claret-sky-stripes", status: "Available" },
    { id: "UFS-04", title: "1986–88 Matchday Amber & Charcoal Chevron Away Style", era: "1980s", size: "XL", condition: "8/10 Very Good", kit: "amber-chevrons", status: "Available" },
    { id: "UFS-05", title: "2002–04 Albiceleste Sky & White Stripe Home Style", era: "2000s", size: "L", condition: "9/10 Mint", kit: "sky-white-stripes", status: "Available" },
    { id: "UFS-06", title: "2005–06 Viola & Chalk Halves European Cup Style", era: "2000s", size: "S", condition: "10/10 BNWT", kit: "viola-halves", status: "Available" },
    { id: "UFS-07", title: "1997–98 Midnight & Turf Diagonal Sash Away Style", era: "1990s", size: "XL", condition: "9/10 Mint", kit: "midnight-sash", status: "Available" },
    { id: "UFS-08", title: "2017–18 Floodlight Navy & Copper Quarters Collector Cut", era: "Modern", size: "S", condition: "9.5/10 Mint", kit: "navy-copper-quarters", status: "Available" }
  ];

  var memStock = null;
  var filterEra = "All";
  var filterSize = "All";
  var availOnly = false;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
              '<div class="cat-card__specs">' +
                esc(item.condition) + '<br>' + esc(PRICE_TAG) +
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
    });
  }

  /* Delegated Clicks: Scanner 1-Tap Flip, Catalog Filters, Load Stepper */
  document.addEventListener("click", function (e) {
    var flipBtn = e.target.closest("[data-flip-id]");
    if (flipBtn) {
      var id = flipBtn.getAttribute("data-flip-id");
      var list = getStock();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i].status = list[i].status === "Available" ? "Reserved" : "Available";
          break;
        }
      }
      saveStock(list);
      renderCatalogAndScanner();
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
      var finderSec = document.getElementById("shirt-finder");
      if (finderSec) finderSec.scrollIntoView({ behavior: "smooth" });
    }
  });

  var availChip = document.getElementById("avail-only-chip");
  if (availChip) {
    availChip.addEventListener("click", function () {
      availOnly = !availOnly;
      this.setAttribute("aria-pressed", String(availOnly));
      renderCatalogAndScanner();
    });
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

  var marketForm = document.getElementById("c-market-form");
  var successBox = document.getElementById("m-success");
  var successMeta = document.getElementById("m-success-meta");
  var resetStepperBtn = document.getElementById("m-reset-stepper");

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
      if (successMeta) {
        successMeta.textContent = "Logged in demo preview for " + n + " — " + modeInput.value + " (" + document.getElementById("m-shirt-input").value + ").";
      }
      marketForm.hidden = true;
      successBox.hidden = false;
      successBox.focus();
    });
  }

  if (resetStepperBtn) {
    resetStepperBtn.addEventListener("click", function () {
      successBox.hidden = true;
      marketForm.hidden = false;
      goMarketStep(1);
    });
  }

  renderCatalogAndScanner();
})();
