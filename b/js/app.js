/* ==========================================================================
   ULTRA FOOTBALL SHIRTS — Concept B Interactive Controller
   - Horizontal touch-snap drop lookbook with instant Era & Size filter pills
   - 1-Tap Owner Rail Status Toggle right on the page (Available / Reserved / Sold)
   - Accessible Click & Collect Reserve Sheet + Counter Enquiry Form
   - Exact demo string compliance · Zero external network requests
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "ultra_football_shirts_demo_stock_v2";
  var EXACT_DEMO_MSG = "Demo only – in the live site this would go straight to Ultra Football Shirts.";
  var SAMPLE_LABEL = "[Illustrative sample listing – owner stock to supply]";
  var PRICE_LABEL = "[£Price – owner to confirm]";
  var P2P_LABEL = "[P2P cm – owner]";

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

  var memoryStock = null;
  var activeEra = "All";
  var activeSize = "All";
  var lastTriggerEl = null;

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
      if (memoryStock) return memoryStock;
    }
    return memoryStock || cloneDefaults();
  }

  function saveStock(list) {
    memoryStock = list;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  }

  function renderKitSvg(kitKey, idSuffix) {
    var palettes = {
      "crimson-band": { base: "#B81D24", collar: "#F6F4EE", cuff: "#F6F4EE", pat: '<rect x="18" y="46" width="84" height="18" fill="#F6F4EE"/>' },
      "claret-sky-stripes": { base: "#6E1E36", collar: "#7BC4E8", cuff: "#7BC4E8", pat: '<rect x="14" y="18" width="16" height="92" fill="#7BC4E8"/><rect x="42" y="18" width="12" height="92" fill="#F6F4EE"/><rect x="66" y="18" width="12" height="92" fill="#F6F4EE"/><rect x="90" y="18" width="16" height="92" fill="#7BC4E8"/>' },
      "amber-chevrons": { base: "#F5C518", collar: "#080B0F", cuff: "#080B0F", pat: '<polygon points="18,40 60,62 102,40 102,52 60,74 18,52" fill="#080B0F"/><polygon points="18,64 60,86 102,64 102,75 60,97 18,75" fill="#080B0F"/>' },
      "sky-white-stripes": { base: "#F6F4EE", collar: "#080B0F", cuff: "#080B0F", pat: '<rect x="28" y="18" width="13" height="92" fill="#6BB6E6"/><rect x="53.5" y="18" width="13" height="92" fill="#6BB6E6"/><rect x="79" y="18" width="13" height="92" fill="#6BB6E6"/>' },
      "viola-halves": { base: "#4C2A85", collar: "#F5C518", cuff: "#F5C518", pat: '<rect x="60" y="18" width="52" height="92" fill="#F6F4EE"/><rect x="58.5" y="18" width="3" height="92" fill="#F5C518"/>' },
      "turf-pinstripes": { base: "#12805C", collar: "#F5C518", cuff: "#F5C518", pat: '<rect x="34" y="18" width="2.5" height="92" fill="#F5C518"/><rect x="48" y="18" width="2.5" height="92" fill="#F6F4EE"/><rect x="69.5" y="18" width="2.5" height="92" fill="#F6F4EE"/><rect x="83.5" y="18" width="2.5" height="92" fill="#F5C518"/>' },
      "midnight-sash": { base: "#162435", collar: "#12805C", cuff: "#12805C", pat: '<polygon points="24,22 42,22 96,106 78,106" fill="#12805C"/><polygon points="42,22 46,22 100,106 96,106" fill="#F5C518"/>' },
      "navy-copper-quarters": { base: "#142130", collar: "#D97B43", cuff: "#D97B43", pat: '<rect x="60" y="18" width="52" height="44" fill="#C96A34"/><rect x="10" y="62" width="50" height="48" fill="#C96A34"/>' }
    };
    var p = palettes[kitKey] || palettes["crimson-band"];
    var clip = "bclip-" + esc(idSuffix);
    var shirt = "M39 22 L49 29 L60 35 L71 29 L81 22 L106 34 L96 55 L84 50 L84 104 L36 104 L36 50 L24 55 L14 34 Z";
    return (
      '<svg viewBox="0 0 120 114" aria-hidden="true">' +
        '<defs><clipPath id="' + clip + '"><path d="' + shirt + '"/></clipPath></defs>' +
        '<g clip-path="url(#' + clip + ')"><rect x="10" y="18" width="100" height="92" fill="' + p.base + '"/>' + p.pat + '</g>' +
        '<path d="' + shirt + '" fill="none" stroke="#F4F6F8" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M40 21.5 L60 37 L80 21.5 L73 20.5 L60 30.5 L47 20.5 Z" fill="' + p.collar + '" stroke="#080B0F" stroke-width="1.2"/>' +
        '<path d="M15.5 36.5 L24.5 53.5" stroke="' + p.cuff + '" stroke-width="4"/>' +
        '<path d="M104.5 36.5 L95.5 53.5" stroke="' + p.cuff + '" stroke-width="4"/>' +
      '</svg>'
    );
  }

  function renderAll() {
    var stock = getStock();
    var availTotal = stock.filter(function (item) { return item.status === "Available"; }).length;
    var pipEl = document.getElementById("header-avail-pip");
    if (pipEl) pipEl.textContent = availTotal + " Live";

    var filtered = stock.filter(function (item) {
      var eraOk = activeEra === "All" || item.era === activeEra;
      var sizeOk = activeSize === "All" || item.size === activeSize;
      return eraOk && sizeOk;
    });

    var countEl = document.getElementById("lookbook-count");
    if (countEl) {
      countEl.textContent = "Showing " + filtered.length + " of " + stock.length + " sample shirts (" + availTotal + " available)";
    }

    var rail = document.getElementById("lookbook-rail");
    if (rail) {
      if (filtered.length === 0) {
        rail.innerHTML = '<div class="drop-card"><p style="margin:0;">No sample shirts match that Era + Size combination. Tap Reset to view all 8 sample pieces.</p></div>';
      } else {
        rail.innerHTML = filtered.map(function (item) {
          var stClass = item.status === "Available" ? "status-pill--avail" : (item.status === "Reserved" ? "status-pill--res" : "status-pill--sold");
          var disabled = item.status === "Sold" ? " disabled" : "";
          var ctaText = item.status === "Available" ? "Hold at 2 Danby Wynd →" : (item.status === "Reserved" ? "Enquire (Currently Held)" : "Sold Over Counter");
          var summary = item.id + " · " + item.title + " (Size " + item.size + ")";
          return (
            '<article class="drop-card' + (item.status === "Sold" ? " drop-card--sold" : "") + '">' +
              '<div class="drop-card__top">' +
                '<span class="drop-card__era">' + esc(item.id) + " // " + esc(item.era) + '</span>' +
                '<span class="status-pill ' + stClass + '">' + esc(item.status) + '</span>' +
              '</div>' +
              '<div class="drop-card__stage">' +
                '<span class="drop-card__size-tag">SIZE ' + esc(item.size) + '</span>' +
                renderKitSvg(item.kit, item.id) +
                '<span class="drop-card__sample">' + esc(SAMPLE_LABEL) + '</span>' +
              '</div>' +
              '<h3 class="drop-card__title">' + esc(item.title) + '</h3>' +
              '<div class="drop-card__meta">' +
                '<span>Grade: ' + esc(item.condition) + '</span>' +
                '<span>Fit: ' + esc(P2P_LABEL) + '</span>' +
                '<span style="grid-column: 1 / -1; color:#FFE885;">Price: ' + esc(PRICE_LABEL) + '</span>' +
              '</div>' +
              '<button type="button" class="drop-card__cta" data-open-reserve="' + esc(summary) + '"' + disabled + '>' + esc(ctaText) + '</button>' +
            '</article>'
          );
        }).join("");
      }
    }

    var ownerList = document.getElementById("owner-toggle-list");
    if (ownerList) {
      ownerList.innerHTML = stock.map(function (item) {
        return (
          '<div class="owner-row">' +
            '<div class="owner-row__title"><span class="owner-row__id">' + esc(item.id) + ' [' + esc(item.size) + ']</span>' + esc(item.title) + '</div>' +
            '<div class="owner-row__btns" role="group" aria-label="Set rail status for ' + esc(item.id) + '">' +
              '<button type="button" class="state-btn' + (item.status === "Available" ? " is-on-avail" : "") + '" data-toggle-id="' + esc(item.id) + '" data-toggle-state="Available" aria-pressed="' + (item.status === "Available") + '">Available</button>' +
              '<button type="button" class="state-btn' + (item.status === "Reserved" ? " is-on-res" : "") + '" data-toggle-id="' + esc(item.id) + '" data-toggle-state="Reserved" aria-pressed="' + (item.status === "Reserved") + '">Reserved</button>' +
              '<button type="button" class="state-btn' + (item.status === "Sold" ? " is-on-sold" : "") + '" data-toggle-id="' + esc(item.id) + '" data-toggle-state="Sold" aria-pressed="' + (item.status === "Sold") + '">Sold</button>' +
            '</div>' +
          '</div>'
        );
      }).join("");
    }
  }

  /* Filter Chips */
  document.addEventListener("click", function (e) {
    var eraBtn = e.target.closest("[data-era]");
    if (eraBtn) {
      activeEra = eraBtn.getAttribute("data-era");
      var allEra = document.querySelectorAll("[data-era]");
      for (var i = 0; i < allEra.length; i++) {
        var on = allEra[i] === eraBtn;
        allEra[i].classList.toggle("is-active", on);
        allEra[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      renderAll();
      return;
    }

    var sizeBtn = e.target.closest("[data-size]");
    if (sizeBtn) {
      activeSize = sizeBtn.getAttribute("data-size");
      var allSize = document.querySelectorAll("[data-size]");
      for (var s = 0; s < allSize.length; s++) {
        var sOn = allSize[s] === sizeBtn;
        allSize[s].classList.toggle("is-active", sOn);
        allSize[s].setAttribute("aria-pressed", sOn ? "true" : "false");
      }
      renderAll();
      return;
    }

    var toggleBtn = e.target.closest("[data-toggle-id]");
    if (toggleBtn) {
      var id = toggleBtn.getAttribute("data-toggle-id");
      var nextState = toggleBtn.getAttribute("data-toggle-state");
      var list = getStock();
      for (var k = 0; k < list.length; k++) {
        if (list[k].id === id) {
          list[k].status = nextState;
          break;
        }
      }
      saveStock(list);
      renderAll();
      return;
    }

    var reserveTrigger = e.target.closest("[data-open-reserve]");
    if (reserveTrigger && !reserveTrigger.disabled) {
      lastTriggerEl = reserveTrigger;
      openReserveSheet(reserveTrigger.getAttribute("data-open-reserve"));
    }
  });

  var resetFilters = document.getElementById("reset-lookbook-filters");
  if (resetFilters) {
    resetFilters.addEventListener("click", function () {
      activeEra = "All";
      activeSize = "All";
      var chips = document.querySelectorAll("[data-era], [data-size]");
      for (var i = 0; i < chips.length; i++) {
        var isAll = (chips[i].getAttribute("data-era") === "All") || (chips[i].getAttribute("data-size") === "All");
        chips[i].classList.toggle("is-active", isAll);
        chips[i].setAttribute("aria-pressed", isAll ? "true" : "false");
      }
      renderAll();
    });
  }

  var resetStockBtn = document.getElementById("reset-demo-stock");
  if (resetStockBtn) {
    resetStockBtn.addEventListener("click", function () {
      saveStock(cloneDefaults());
      renderAll();
    });
  }

  /* Scroll-snap prev/next buttons */
  var railEl = document.getElementById("lookbook-rail");
  var scrollBtns = document.querySelectorAll("[data-rail-scroll]");
  for (var b = 0; b < scrollBtns.length; b++) {
    scrollBtns[b].addEventListener("click", function () {
      if (!railEl) return;
      var dir = Number(this.getAttribute("data-rail-scroll")) || 1;
      railEl.scrollBy({ left: dir * 320, behavior: "smooth" });
    });
  }

  /* Reserve Sheet Modal */
  var sheet = document.getElementById("reserve-sheet");
  var sheetShirtInput = document.getElementById("sheet-shirt");
  var closeSheetBtn = document.getElementById("close-reserve-sheet");
  var sheetFeedback = document.getElementById("sheet-feedback");

  function openReserveSheet(shirtSummary) {
    if (!sheet) return;
    if (sheetShirtInput) sheetShirtInput.value = shirtSummary || "2 Danby Wynd Rail Enquiry";
    if (sheetFeedback) sheetFeedback.hidden = true;
    sheet.hidden = false;
    var nameInput = document.getElementById("sheet-name");
    if (nameInput) nameInput.focus();
  }

  function closeReserveSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    if (lastTriggerEl) lastTriggerEl.focus();
  }

  if (closeSheetBtn) {
    closeSheetBtn.addEventListener("click", closeReserveSheet);
  }

  if (sheet) {
    sheet.addEventListener("click", function (e) {
      if (e.target === sheet) closeReserveSheet();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sheet && !sheet.hidden) {
      closeReserveSheet();
    }
  });

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || "";
  }

  /* Reserve Sheet Submit */
  var reserveForm = document.getElementById("b-reserve-form");
  if (reserveForm) {
    reserveForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = (document.getElementById("sheet-name").value || "").trim();
      var c = (document.getElementById("sheet-contact").value || "").trim();
      var ok = true;

      if (!n) { setErr("sheet-name-err", "Please enter your name."); ok = false; } else { setErr("sheet-name-err", ""); }
      if (!c) { setErr("sheet-contact-err", "Please enter your email or mobile."); ok = false; } else { setErr("sheet-contact-err", ""); }
      if (!ok) return;

      sheetFeedback.textContent = EXACT_DEMO_MSG;
      sheetFeedback.hidden = false;
      sheetFeedback.focus();
    });
  }

  /* Inline Counter Form Submit */
  var counterForm = document.getElementById("b-counter-form");
  var counterFeedback = document.getElementById("b-counter-feedback");
  if (counterForm) {
    counterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = (document.getElementById("b-user-name").value || "").trim();
      var c = (document.getElementById("b-user-contact").value || "").trim();
      var d = (document.getElementById("b-shirt-notes").value || "").trim();
      var ok = true;

      if (!n) { setErr("b-name-err", "Please enter your name."); ok = false; } else { setErr("b-name-err", ""); }
      if (!c) { setErr("b-contact-err", "Please enter an email or mobile number."); ok = false; } else { setErr("b-contact-err", ""); }
      if (!d) { setErr("b-details-err", "Please add your shirt, size or trade details."); ok = false; } else { setErr("b-details-err", ""); }
      if (!ok) return;

      counterFeedback.textContent = EXACT_DEMO_MSG;
      counterFeedback.hidden = false;
      counterFeedback.focus();
    });
  }

  renderAll();
})();
