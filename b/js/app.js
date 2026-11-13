/* ==========================================================================
   ULTRA FOOTBALL SHIRTS — Concept B Interactive Controller
   - Horizontal touch-snap drop lookbook with 4 distinct editorial photos,
     10-bar stitch-by-stitch condition meters, live 01/0N counter & active dots
   - 1-Tap Collector Presets + Non-blocking Micro-Toast
   - 1-Tap Owner Rail Status Toggle right on the page (Available / Reserved / Sold)
   - Accessible Click & Collect Reserve Sheet + Counter Enquiry Form with
     structured "What Ultra Football Shirts Receives" Receipt Ticket
   - Native <dialog> Photo Lightbox + Sticky Scroll Progress + Frosted Dock Auto-Clearance
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
    { id: "UFS-01", title: "1995–96 Teesside Crimson Chest-Band Home Style", era: "1990s", size: "L", condition: "9/10 Mint", score: 9, kit: "crimson-band", status: "Available" },
    { id: "UFS-02", title: "1988–90 Turf Emerald & Gold Pinstripe Third Style", era: "1980s", size: "M", condition: "8/10 Very Good", score: 8, kit: "turf-pinstripes", status: "Reserved" },
    { id: "UFS-03", title: "1993–95 Claret & Sky Jacquard Stripe Home Style", era: "1990s", size: "M", condition: "9.5/10 Mint", score: 10, kit: "claret-sky-stripes", status: "Available" },
    { id: "UFS-04", title: "1986–88 Matchday Amber & Charcoal Chevron Away Style", era: "1980s", size: "XL", condition: "8/10 Very Good", score: 8, kit: "amber-chevrons", status: "Available" },
    { id: "UFS-05", title: "2002–04 Albiceleste Sky & White Stripe Home Style", era: "2000s", size: "L", condition: "9/10 Mint", score: 9, kit: "sky-white-stripes", status: "Available" },
    { id: "UFS-06", title: "2005–06 Viola & Chalk Halves European Cup Style", era: "2000s", size: "S", condition: "10/10 BNWT", score: 10, kit: "viola-halves", status: "Available" },
    { id: "UFS-07", title: "1997–98 Midnight & Turf Diagonal Sash Away Style", era: "1990s", size: "XL", condition: "9/10 Mint", score: 9, kit: "midnight-sash", status: "Available" },
    { id: "UFS-08", title: "2017–18 Floodlight Navy & Copper Quarters Collector Cut", era: "Modern", size: "S", condition: "9.5/10 Mint", score: 10, kit: "navy-copper-quarters", status: "Available" }
  ];

  var EDITORIAL_PLATES = [
    {
      src: "../images/detail-1.jpg",
      alt: "Macro close-up of 1990s woven jacquard geometric football shirt knit and stitched collar textile",
      caption: "Macro 1990s Woven Jacquard & Collar Stitch — Inspect weave density and collar tags at 2 Danby Wynd."
    },
    {
      src: "../images/detail-2.jpg",
      alt: "Neatly folded colourful 1980s and 1990s collector football jerseys stacked on a timber boutique table",
      caption: "Boutique Timber Table Stack — Folded 1980s & 1990s collector jerseys prepared for counter inspection."
    },
    {
      src: "../images/feature.jpg",
      alt: "Folded classic 1990s football shirts arranged in a flat-lay showing woven collars and bold geometric patterns",
      caption: "90s Collar & Pattern Flat-Lay — Honest grading and pit-to-pit check in Yarm."
    },
    {
      src: "../images/hero.jpg",
      alt: "Rails of colourful retro and classic football shirts hanging inside an independent football kit room",
      caption: "2 Danby Wynd Kit Room Rail — 1-of-1 classic and collector shirts off Yarm High Street."
    }
  ];

  var memoryStock = null;
  var activeEra = "All";
  var activeSize = "All";
  var lastTriggerEl = null;
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
    var el = document.getElementById("b-micro-toast");
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

  function stitchNoteForScore(score) {
    if (score >= 10) return "Stitch check: Unworn loom weave · Crisp collar · Original tags";
    if (score === 9) return "Stitch check: Firm collar rib · Sharp crest & flock · Clean hem";
    if (score === 8) return "Stitch check: Sound seams · Light wash-tag age · Matchday clean";
    return "Stitch check: Intact seams · Honest terrace patina";
  }

  function renderCondBars(score) {
    var html = "";
    for (var i = 1; i <= 10; i++) {
      html += '<span class="drop-cond-seg' + (i <= score ? " drop-cond-seg--on" : "") + '"></span>';
    }
    return html;
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
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
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
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

  /* Sync Snap Counter (01 / 0N) & Active Dots */
  function syncSnapIndicators() {
    var rail = document.getElementById("lookbook-rail");
    var counterEl = document.getElementById("b-snap-counter");
    var dotsWrap = document.getElementById("b-snap-dots");
    if (!rail) return;

    var cards = rail.querySelectorAll(".drop-card[data-snap-idx]");
    var total = cards.length;
    if (!total) {
      if (counterEl) counterEl.textContent = "00 / 00";
      if (dotsWrap) dotsWrap.innerHTML = "";
      return;
    }

    var railLeft = rail.getBoundingClientRect().left;
    var bestIdx = 0;
    var bestDist = Infinity;
    for (var i = 0; i < total; i++) {
      var d = Math.abs(cards[i].getBoundingClientRect().left - railLeft);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    if (counterEl) {
      counterEl.textContent = pad2(bestIdx + 1) + " / " + pad2(total);
    }
    if (dotsWrap) {
      var dots = dotsWrap.querySelectorAll(".b-snap-dot");
      if (dots.length !== total) {
        var dHtml = "";
        for (var j = 0; j < total; j++) {
          dHtml +=
            '<button type="button" class="b-snap-dot' + (j === bestIdx ? " is-active" : "") + '" ' +
              'data-snap-goto="' + j + '" ' +
              'aria-label="Jump to shirt ' + (j + 1) + ' of ' + total + '"></button>';
        }
        dotsWrap.innerHTML = dHtml;
      } else {
        for (var k = 0; k < dots.length; k++) {
          dots[k].classList.toggle("is-active", k === bestIdx);
        }
      }
    }
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
        rail.innerHTML = filtered.map(function (item, idx) {
          var stClass = item.status === "Available" ? "status-pill--avail" : (item.status === "Reserved" ? "status-pill--res" : "status-pill--sold");
          var disabled = item.status === "Sold" ? " disabled" : "";
          var ctaText = item.status === "Available" ? "Hold at 2 Danby Wynd →" : (item.status === "Reserved" ? "Enquire (Currently Held)" : "Sold Over Counter");
          var summary = item.id + " · " + item.title + " (Size " + item.size + ")";
          var sc = scoreForItem(item);
          var plate = EDITORIAL_PLATES[idx % EDITORIAL_PLATES.length];

          return (
            '<article class="drop-card' + (item.status === "Sold" ? " drop-card--sold" : "") + '" data-snap-idx="' + idx + '">' +
              '<div class="drop-card__top">' +
                '<span class="drop-card__era">' + esc(item.id) + " // " + esc(item.era) + '</span>' +
                '<span class="status-pill ' + stClass + '">' + esc(item.status) + '</span>' +
              '</div>' +

              '<div class="drop-card__photo is-b-lightbox" tabindex="0" role="button" ' +
                'aria-label="Inspect textile reference photo for ' + esc(item.title) + '" ' +
                'data-lightbox-src="' + esc(plate.src) + '" ' +
                'data-lightbox-alt="' + esc(plate.alt) + '" ' +
                'data-lightbox-caption="' + esc(plate.caption) + '" ' +
                'data-lightbox-shirt="' + esc(summary) + '">' +
                '<img src="' + esc(plate.src) + '" alt="' + esc(plate.alt) + '" width="1200" height="896" loading="lazy">' +
                '<span class="drop-card__photo-tag">Illustrative image</span>' +
                '<span class="drop-card__photo-zoom" aria-hidden="true">🔍 Zoom</span>' +
              '</div>' +

              '<div class="drop-card__stage">' +
                '<span class="drop-card__size-tag">SIZE ' + esc(item.size) + '</span>' +
                renderKitSvg(item.kit, item.id) +
                '<span class="drop-card__sample">' + esc(SAMPLE_LABEL) + '</span>' +
              '</div>' +

              '<h3 class="drop-card__title">' + esc(item.title) + '</h3>' +

              '<div class="drop-cond-meter" aria-label="Condition grade ' + esc(item.condition) + '">' +
                '<div class="drop-cond-meter__top">' +
                  '<span>STITCH METER</span>' +
                  '<strong>' + esc(item.condition) + '</strong>' +
                '</div>' +
                '<div class="drop-cond-meter__bars" aria-hidden="true">' + renderCondBars(sc) + '</div>' +
                '<div class="drop-cond-meter__note">' + esc(stitchNoteForScore(sc)) + '</div>' +
              '</div>' +

              '<div class="drop-card__meta">' +
                '<span>Fit: ' + esc(P2P_LABEL) + '</span>' +
                '<span style="color:#FFE885;">' + esc(PRICE_LABEL) + '</span>' +
              '</div>' +
              '<button type="button" class="drop-card__cta" data-open-reserve="' + esc(summary) + '"' + disabled + '>' + esc(ctaText) + '</button>' +
            '</article>'
          );
        }).join("");
      }
      syncSnapIndicators();
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

  function makeRefCode() {
    return "UFS-2026-" + Math.floor(1000 + Math.random() * 9000);
  }

  function buildReceiptHtml(data) {
    var ref = makeRefCode();
    var plain =
      "Ultra Football Shirts — Enquiry Ticket (" + ref + ")\n" +
      "Collector: " + data.name + "\n" +
      "Contact: " + data.contact + "\n" +
      "Request Type: " + data.mode + "\n" +
      "Shirt & Size Details: " + data.details;

    return (
      '<p class="b-verbatim-msg">' + esc(EXACT_DEMO_MSG) + '</p>' +
      '<div class="b-owner-receipt" data-plain-receipt="' + esc(plain) + '">' +
        '<div class="b-owner-receipt__head">' +
          '<span>What Ultra Football Shirts Receives</span>' +
          '<span>REF // ' + esc(ref) + '</span>' +
        '</div>' +
        '<dl class="b-owner-receipt__dl">' +
          '<div class="b-owner-receipt__row"><dt>Collector</dt><dd>' + esc(data.name) + '</dd></div>' +
          '<div class="b-owner-receipt__row"><dt>Contact</dt><dd>' + esc(data.contact) + '</dd></div>' +
          '<div class="b-owner-receipt__row"><dt>Request</dt><dd>' + esc(data.mode) + '</dd></div>' +
          '<div class="b-owner-receipt__row"><dt>Shirt Details</dt><dd>' + esc(data.details) + '</dd></div>' +
        '</dl>' +
        '<div class="b-owner-receipt__actions">' +
          '<button type="button" class="b-receipt-btn" data-b-copy>Copy Summary</button>' +
          '<button type="button" class="b-receipt-btn b-receipt-btn--ghost" data-b-reset="' + esc(data.resetTarget) + '">Reset Demo</button>' +
        '</div>' +
      '</div>'
    );
  }

  function copyText(txt, btnEl) {
    function done() {
      if (btnEl) {
        var orig = btnEl.textContent;
        btnEl.textContent = "Copied ✓";
        setTimeout(function () { btnEl.textContent = orig; }, 1800);
      }
      showMicroToast("Ticket summary copied to clipboard.");
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

  /* Delegated Clicks */
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
      showMicroToast("Era filter: " + activeEra);
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
      showMicroToast("Size filter: " + activeSize);
      return;
    }

    var presetBtn = e.target.closest("[data-b-preset]");
    if (presetBtn) {
      var key = presetBtn.getAttribute("data-b-preset");
      var allPresets = document.querySelectorAll("[data-b-preset]");
      for (var p = 0; p < allPresets.length; p++) {
        allPresets[p].classList.toggle("is-active", allPresets[p].getAttribute("data-b-preset") === key);
      }
      var modeSel = document.getElementById("b-ticket-mode");
      var notesField = document.getElementById("b-shirt-notes");
      var counterCard = document.getElementById("b-counter-form");

      if (key === "serie-a-grail") {
        if (modeSel) modeSel.value = "Grail / Shirt Finder";
        if (notesField) {
          notesField.value = "90s Serie A Grail Search: hunting an original mid-1990s Serie A woven jacquard classic in Size M or L (9/10 Mint+ with authentic collar tag).";
        }
        if (counterCard) counterCard.scrollIntoView({ behavior: "smooth", block: "center" });
        showMicroToast("Preset loaded: 90s Serie A Grail Search.");
      } else if (key === "sell-collection") {
        if (modeSel) modeSel.value = "Sell / Trade Shirts";
        if (notesField) {
          notesField.value = "Sell a Classic Collection: bringing 6 original 1980s & 1990s collector shirts (all original woven neck tags, zero repros) into 2 Danby Wynd.";
        }
        if (counterCard) counterCard.scrollIntoView({ behavior: "smooth", block: "center" });
        showMicroToast("Preset loaded: Sell a Classic Collection.");
      } else if (key === "hold-90s") {
        activeEra = "1990s";
        activeSize = "All";
        var eChips = document.querySelectorAll("[data-era]");
        for (var ec = 0; ec < eChips.length; ec++) {
          var is90 = eChips[ec].getAttribute("data-era") === "1990s";
          eChips[ec].classList.toggle("is-active", is90);
          eChips[ec].setAttribute("aria-pressed", String(is90));
        }
        renderAll();
        if (modeSel) modeSel.value = "Click & Collect Hold";
        if (notesField) {
          notesField.value = "Hold Top 90s Shirt for Danby Wynd: UFS-01 · 1995–96 Teesside Crimson Chest-Band Home Style (Size L, 9/10 Mint) for counter inspection.";
        }
        if (presetBtn.closest(".b-preset-bar--compact")) {
          var uName = document.getElementById("b-user-name");
          if (uName) uName.focus();
        } else {
          lastTriggerEl = presetBtn;
          openReserveSheet("UFS-01 · 1995–96 Teesside Crimson Chest-Band Home Style (Size L)");
        }
        showMicroToast("Preset loaded: Top 90s Shirt ready for 2 Danby Wynd hold.");
      }
      return;
    }

    var snapDot = e.target.closest("[data-snap-goto]");
    if (snapDot) {
      var idx = Number(snapDot.getAttribute("data-snap-goto")) || 0;
      var rail = document.getElementById("lookbook-rail");
      if (rail) {
        var cards = rail.querySelectorAll(".drop-card[data-snap-idx]");
        if (cards[idx]) {
          rail.scrollTo({ left: cards[idx].offsetLeft - rail.offsetLeft, behavior: "smooth" });
        }
      }
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
      showMicroToast(id + " status updated to " + nextState.toUpperCase());
      return;
    }

    var copyBtn = e.target.closest("[data-b-copy]");
    if (copyBtn) {
      var rec = copyBtn.closest("[data-plain-receipt]");
      if (rec) copyText(rec.getAttribute("data-plain-receipt"), copyBtn);
      return;
    }

    var resetRecBtn = e.target.closest("[data-b-reset]");
    if (resetRecBtn) {
      var tgt = resetRecBtn.getAttribute("data-b-reset");
      if (tgt === "sheet") {
        var rf = document.getElementById("b-reserve-form");
        var sfb = document.getElementById("sheet-feedback");
        if (rf) rf.reset();
        if (sfb) { sfb.hidden = true; sfb.innerHTML = ""; }
      } else {
        var cf = document.getElementById("b-counter-form");
        var cfb = document.getElementById("b-counter-feedback");
        if (cf) cf.reset();
        if (cfb) { cfb.hidden = true; cfb.innerHTML = ""; }
      }
      showMicroToast("Demo ticket reset.");
      return;
    }

    var reserveTrigger = e.target.closest("[data-open-reserve]");
    if (reserveTrigger && !reserveTrigger.disabled) {
      lastTriggerEl = reserveTrigger;
      openReserveSheet(reserveTrigger.getAttribute("data-open-reserve"));
      return;
    }

    var lbTrig = e.target.closest(".is-b-lightbox");
    if (lbTrig) {
      e.preventDefault();
      openPhotoLightbox(lbTrig);
      return;
    }

    if (e.target.closest("[data-b-lightbox-close]")) {
      closePhotoLightbox();
      return;
    }

    var lbRes = e.target.closest("[data-b-lightbox-reserve]");
    if (lbRes) {
      var sum = lbRes.getAttribute("data-b-lightbox-reserve") || "2 Danby Wynd Rail Enquiry";
      closePhotoLightbox();
      openReserveSheet(sum);
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
      showMicroToast("Lookbook filters reset.");
    });
  }

  var resetStockBtn = document.getElementById("reset-demo-stock");
  if (resetStockBtn) {
    resetStockBtn.addEventListener("click", function () {
      saveStock(cloneDefaults());
      renderAll();
      showMicroToast("Demo rail reset to default 8 shirts.");
    });
  }

  /* Scroll-snap prev/next buttons + scroll listener */
  var railEl = document.getElementById("lookbook-rail");
  var scrollBtns = document.querySelectorAll("[data-rail-scroll]");
  for (var b = 0; b < scrollBtns.length; b++) {
    scrollBtns[b].addEventListener("click", function () {
      if (!railEl) return;
      var dir = Number(this.getAttribute("data-rail-scroll")) || 1;
      railEl.scrollBy({ left: dir * 326, behavior: "smooth" });
    });
  }
  if (railEl) {
    var snapRaf = false;
    railEl.addEventListener("scroll", function () {
      if (!snapRaf) {
        snapRaf = true;
        window.requestAnimationFrame(function () {
          syncSnapIndicators();
          snapRaf = false;
        });
      }
    }, { passive: true });
    window.addEventListener("resize", syncSnapIndicators, { passive: true });
  }

  /* Sticky Header Scroll-Progress Hairline */
  var progBar = document.getElementById("b-scroll-progress");
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
  var lbDialog = document.getElementById("b-photo-lightbox");
  var lbImg = document.getElementById("b-lightbox-img");
  var lbCap = document.getElementById("b-lightbox-caption");
  var lbCta = lbDialog ? lbDialog.querySelector("[data-b-lightbox-reserve]") : null;
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
    if (lbCta) {
      var customShirt = trigEl.getAttribute("data-lightbox-shirt");
      lbCta.setAttribute("data-b-lightbox-reserve", customShirt || "Click & Collect / Rail Inspection Enquiry (2 Danby Wynd, Yarm)");
    }
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
        document.activeElement.classList && document.activeElement.classList.contains("is-b-lightbox")) {
      e.preventDefault();
      openPhotoLightbox(document.activeElement);
    }
  });

  /* Reserve Sheet Modal */
  var sheet = document.getElementById("reserve-sheet");
  var sheetShirtInput = document.getElementById("sheet-shirt");
  var closeSheetBtn = document.getElementById("close-reserve-sheet");
  var sheetFeedback = document.getElementById("sheet-feedback");

  function openReserveSheet(shirtSummary) {
    if (!sheet) return;
    if (sheetShirtInput) sheetShirtInput.value = shirtSummary || "2 Danby Wynd Rail Enquiry";
    if (sheetFeedback) {
      sheetFeedback.hidden = true;
      sheetFeedback.innerHTML = "";
    }
    sheet.hidden = false;
    var nameInput = document.getElementById("sheet-name");
    if (nameInput) nameInput.focus();
  }

  function closeReserveSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    if (lastTriggerEl && typeof lastTriggerEl.focus === "function") lastTriggerEl.focus();
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

      var hoSel = document.getElementById("sheet-handover");
      var hoTxt = hoSel && hoSel.options[hoSel.selectedIndex] ? hoSel.options[hoSel.selectedIndex].text : "Click & Collect";
      var noteVal = (document.getElementById("sheet-note").value || "").trim();
      var shirtVal = (sheetShirtInput && sheetShirtInput.value) || "2 Danby Wynd Rail Item";

      sheetFeedback.innerHTML = buildReceiptHtml({
        name: n,
        contact: c,
        mode: hoTxt,
        details: shirtVal + (noteVal ? " — Note: " + noteVal : ""),
        resetTarget: "sheet"
      });
      sheetFeedback.hidden = false;
      sheetFeedback.focus();
      showMicroToast("Click & Collect demo ticket generated.");
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

      var mSel = document.getElementById("b-ticket-mode");
      var mTxt = mSel ? mSel.value : "Counter Enquiry";

      counterFeedback.innerHTML = buildReceiptHtml({
        name: n,
        contact: c,
        mode: mTxt,
        details: d,
        resetTarget: "counter"
      });
      counterFeedback.hidden = false;
      counterFeedback.focus();
      showMicroToast("Counter enquiry ticket generated.");
    });
  }

  /* Frosted Floating Dock Auto-Clearance over Form & Footer */
  var dock = document.querySelector(".mobile-tunnel-dock");
  if (dock && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll("#b-counter-form, .tunnel-footer");
    var seen = new Set();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) seen.add(entry.target);
        else seen.delete(entry.target);
      });
      dock.classList.toggle("is-cleared", seen.size > 0);
    }, { threshold: 0.08 });
    targets.forEach(function (el) { obs.observe(el); });
  }

  renderAll();
})();
