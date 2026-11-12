/* ==========================================================================
   ULTRA FOOTBALL SHIRTS — CLIENT-SIDE INTERACTIVE DEMO
   - Live Stock Filter (Era, Size, Availability)
   - Accessible Click & Collect Reserve Modal (2 Danby Wynd, Yarm)
   - 10-Second Owner Stock Admin Demo (sessionStorage sync across pages)
   - Zero external network requests · XSS-safe DOM rendering
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'ultra_football_shirts_demo_stock_v1';
  var MODIFIED_KEY = 'ultra_football_shirts_demo_modified_v1';
  var EXACT_DEMO_MSG = 'Demo only – in the live site this would go straight to Ultra Football Shirts.';
  var SAMPLE_TAG = '[Illustrative sample listing – owner stock to supply]';
  var PRICE_TAG = '[£Price – owner to confirm]';

  var DEFAULT_STOCK = [
    {
      id: 'ufs-01',
      title: '1995–96 Teesside Crimson Chest-Band Home Style',
      era: '1980s–90s',
      size: 'L',
      condition: '9/10 Excellent',
      kit: 'crimson-band',
      status: 'Available',
      notes: 'Classic woven fold-over collar, crisp white chest band, heavy 90s polyester weave.',
      demoPriceHint: ''
    },
    {
      id: 'ufs-02',
      title: '1993–95 Claret & Sky Jacquard Stripe Home Style',
      era: '1980s–90s',
      size: 'M',
      condition: '9.5/10 Mint',
      kit: 'claret-sky-stripes',
      status: 'Available',
      notes: 'Traditional vertical stripes with ribbed V-neck trim and clean stitched cuffs.',
      demoPriceHint: ''
    },
    {
      id: 'ufs-03',
      title: '1991–93 Matchday Amber & Charcoal Chevron Away Style',
      era: '1980s–90s',
      size: 'XL',
      condition: '8/10 Very Good',
      kit: 'amber-chevrons',
      status: 'Available',
      notes: 'Bold terrace away geometry, vibrant colourway, minor age-consistent micro-bobble.',
      demoPriceHint: ''
    },
    {
      id: 'ufs-04',
      title: '2002–04 Albiceleste Sky & White Stripe Home Style',
      era: '2000s',
      size: 'L',
      condition: '9/10 Excellent',
      kit: 'sky-white-stripes',
      status: 'Available',
      notes: 'Early-2000s dual-layer mesh panelling with contrast midnight collar and cuffs.',
      demoPriceHint: ''
    },
    {
      id: 'ufs-05',
      title: '2005–06 Viola & Chalk Halves European Cup Style',
      era: '2000s',
      size: 'S',
      condition: 'BNWT',
      kit: 'viola-halves',
      status: 'Available',
      notes: 'Unworn deadstock collector piece retaining original swing tags and gold piping.',
      demoPriceHint: ''
    },
    {
      id: 'ufs-06',
      title: '1988–90 Turf Emerald & Gold Pinstripe Third Style',
      era: '1980s–90s',
      size: 'M',
      condition: '8/10 Very Good',
      kit: 'turf-pinstripes',
      status: 'Reserved',
      notes: 'Late-80s twin pinstripe cut; currently held on demo Click & Collect for Danby Wynd inspection.',
      demoPriceHint: ''
    },
    {
      id: 'ufs-07',
      title: '2008–09 Midnight & Turf Diagonal Sash Away Style',
      era: '2000s',
      size: 'XL',
      condition: '9/10 Excellent',
      kit: 'midnight-sash',
      status: 'Available',
      notes: 'Sharp diagonal sash across deep floodlight navy body with tailored collar.',
      demoPriceHint: ''
    },
    {
      id: 'ufs-08',
      title: '2017–18 Floodlight Navy & Copper Quarters Collector Cut',
      era: 'Modern Classics',
      size: 'S',
      condition: '9.5/10 Mint',
      kit: 'navy-copper-quarters',
      status: 'Available',
      notes: 'Limited-run modern classic quartered shirt with tonal woven hem label.',
      demoPriceHint: ''
    }
  ];

  var memoryFallbackStock = null;

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_STOCK));
  }

  function loadStock() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      if (memoryFallbackStock) {
        return memoryFallbackStock;
      }
    }
    return cloneDefaults();
  }

  function saveStock(items, markModified) {
    memoryFallbackStock = items;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      if (markModified) {
        window.sessionStorage.setItem(MODIFIED_KEY, '1');
      }
    } catch (err) {
      /* sessionStorage unavailable; memoryFallbackStock handles current view */
    }
  }

  function resetStockStorage() {
    memoryFallbackStock = null;
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(MODIFIED_KEY);
    } catch (err) {
      /* ignore */
    }
    return cloneDefaults();
  }

  function isSessionModified() {
    try {
      return window.sessionStorage.getItem(MODIFIED_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  /* ------------------------------------------------------------------------
     Bespoke Non-Branded Geometric SVG Football Kit Renderer
     Zero trademarked club crests or sportswear brand marks.
     ------------------------------------------------------------------------ */
  var svgUidCounter = 0;

  function renderKitSvg(kitKey, labelText) {
    svgUidCounter += 1;
    var clipId = 'shirt-clip-' + svgUidCounter;
    var safeLabel = escapeHtml(labelText || 'Illustrative geometric football shirt');

    var palettes = {
      'crimson-band': {
        base: '#B81D24',
        collar: '#F4F6F8',
        cuff: '#F4F6F8',
        pattern:
          '<rect x="18" y="46" width="84" height="18" fill="#F4F6F8"/>' +
          '<rect x="18" y="43" width="84" height="2.5" fill="#0E151C" opacity="0.35"/>' +
          '<rect x="18" y="64.5" width="84" height="2.5" fill="#0E151C" opacity="0.35"/>'
      },
      'claret-sky-stripes': {
        base: '#6E1E36',
        collar: '#7BC4E8',
        cuff: '#7BC4E8',
        pattern:
          '<rect x="10" y="18" width="16" height="92" fill="#7BC4E8"/>' +
          '<rect x="40" y="18" width="12" height="92" fill="#F4F6F8"/>' +
          '<rect x="68" y="18" width="12" height="92" fill="#F4F6F8"/>' +
          '<rect x="94" y="18" width="16" height="92" fill="#7BC4E8"/>'
      },
      'amber-chevrons': {
        base: '#F2C12E',
        collar: '#141D26',
        cuff: '#141D26',
        pattern:
          '<polygon points="18,40 60,62 102,40 102,52 60,74 18,52" fill="#141D26"/>' +
          '<polygon points="18,64 60,86 102,64 102,75 60,97 18,75" fill="#141D26"/>'
      },
      'sky-white-stripes': {
        base: '#F4F6F8',
        collar: '#0E151C',
        cuff: '#0E151C',
        pattern:
          '<rect x="28" y="18" width="13" height="92" fill="#6BB6E6"/>' +
          '<rect x="53.5" y="18" width="13" height="92" fill="#6BB6E6"/>' +
          '<rect x="79" y="18" width="13" height="92" fill="#6BB6E6"/>'
      },
      'viola-halves': {
        base: '#4C2A85',
        collar: '#F2C12E',
        cuff: '#F2C12E',
        pattern:
          '<rect x="60" y="18" width="52" height="92" fill="#F4F6F8"/>' +
          '<rect x="58.5" y="18" width="3" height="92" fill="#F2C12E"/>'
      },
      'turf-pinstripes': {
        base: '#0B7A53',
        collar: '#F2C12E',
        cuff: '#F2C12E',
        pattern:
          '<rect x="34" y="18" width="2.5" height="92" fill="#F2C12E"/>' +
          '<rect x="48" y="18" width="2.5" height="92" fill="#F4F6F8"/>' +
          '<rect x="69.5" y="18" width="2.5" height="92" fill="#F4F6F8"/>' +
          '<rect x="83.5" y="18" width="2.5" height="92" fill="#F2C12E"/>'
      },
      'midnight-sash': {
        base: '#162435',
        collar: '#0B7A53',
        cuff: '#0B7A53',
        pattern:
          '<polygon points="24,22 42,22 96,106 78,106" fill="#0B7A53"/>' +
          '<polygon points="42,22 46,22 100,106 96,106" fill="#F2C12E"/>'
      },
      'navy-copper-quarters': {
        base: '#142130',
        collar: '#D97B43',
        cuff: '#D97B43',
        pattern:
          '<rect x="60" y="18" width="52" height="44" fill="#C96A34"/>' +
          '<rect x="10" y="62" width="50" height="48" fill="#C96A34"/>' +
          '<rect x="18" y="61" width="84" height="2" fill="#F4F6F8" opacity="0.5"/>'
      }
    };

    var p = palettes[kitKey] || palettes['crimson-band'];
    var shirtPath = 'M39 22 L49 29 L60 35 L71 29 L81 22 L106 34 L96 55 L84 50 L84 104 L36 104 L36 50 L24 55 L14 34 Z';

    return (
      '<svg viewBox="0 0 120 114" role="img" aria-label="' + safeLabel + '">' +
        '<defs>' +
          '<clipPath id="' + clipId + '">' +
            '<path d="' + shirtPath + '"/>' +
          '</clipPath>' +
        '</defs>' +
        /* Coat hanger hook & bar */
        '<path d="M60 6 C65 6 67 10 64 13 C62 15 60 15.5 60 18" fill="none" stroke="#94A3B8" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M41 22 L60 17 L79 22" fill="none" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>' +
        /* Shirt body + clipped pattern */
        '<g clip-path="url(#' + clipId + ')">' +
          '<rect x="10" y="18" width="100" height="92" fill="' + p.base + '"/>' +
          p.pattern +
          /* Subtle vertical fabric sheen */
          '<rect x="10" y="18" width="100" height="92" fill="rgba(255,255,255,0.03)"/>' +
        '</g>' +
        /* Crisp shirt outline */
        '<path d="' + shirtPath + '" fill="none" stroke="#F4F6F8" stroke-width="1.6" stroke-linejoin="round"/>' +
        /* Classic V-neck collar */
        '<path d="M40 21.5 L60 37 L80 21.5 L73 20.5 L60 30.5 L47 20.5 Z" fill="' + p.collar + '" stroke="#0E151C" stroke-width="1.2"/>' +
        /* Woven inner size tag */
        '<rect x="56" y="23" width="8" height="4" fill="#0E151C"/>' +
        /* Sleeve cuff ribs */
        '<path d="M15.5 36.5 L24.5 53.5" stroke="' + p.cuff + '" stroke-width="4" stroke-linecap="butt"/>' +
        '<path d="M104.5 36.5 L95.5 53.5" stroke="' + p.cuff + '" stroke-width="4" stroke-linecap="butt"/>' +
      '</svg>'
    );
  }

  /* ------------------------------------------------------------------------
     1. Accessible Mobile Navigation (All Pages)
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    var toggleBtn = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('primary-nav');
    if (!toggleBtn || !nav) return;

    function closeNav(restoreFocus) {
      if (!nav.classList.contains('is-open')) return;
      nav.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      var labelEl = toggleBtn.querySelector('[data-nav-label]');
      if (labelEl) labelEl.textContent = 'Menu';
      if (restoreFocus) toggleBtn.focus();
    }

    function openNav() {
      nav.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      var labelEl = toggleBtn.querySelector('[data-nav-label]');
      if (labelEl) labelEl.textContent = 'Close';
    }

    toggleBtn.addEventListener('click', function () {
      var expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeNav(false);
      } else {
        openNav();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav(true);
      }
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeNav(false);
      }
    });

    var navLinks = nav.querySelectorAll('a');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function () {
        closeNav(false);
      });
    }
  }

  /* ------------------------------------------------------------------------
     2. Interactive Stock Room + Click & Collect Modal (index.html)
     ------------------------------------------------------------------------ */
  function initStockRoom() {
    var gridEl = document.getElementById('stock-grid');
    if (!gridEl) return;

    var countEl = document.getElementById('stock-results-count');
    var syncNoticeEl = document.getElementById('session-sync-badge');
    var resetFiltersBtn = document.getElementById('reset-filters-btn');

    var filters = {
      era: 'All',
      size: 'All',
      availability: 'All'
    };

    function getPriceLine(item) {
      if (item.demoPriceHint && String(item.demoPriceHint).trim() !== '') {
        return PRICE_TAG + ' (Demo guide: ' + escapeHtml(item.demoPriceHint) + ')';
      }
      return PRICE_TAG;
    }

    function getStatusBadgeClass(status) {
      if (status === 'Reserved') return 'status-badge status-badge--reserved';
      if (status === 'Sold') return 'status-badge status-badge--sold';
      return 'status-badge status-badge--available';
    }

    function updateAvailabilityCounts(stock) {
      var availCount = 0;
      for (var i = 0; i < stock.length; i++) {
        if (stock[i].status === 'Available') availCount += 1;
      }
      var allBtn = document.querySelector('[data-filter-group="availability"][data-filter-value="All"]');
      var availBtn = document.querySelector('[data-filter-group="availability"][data-filter-value="Available"]');
      if (allBtn) allBtn.textContent = 'All (' + stock.length + ')';
      if (availBtn) availBtn.textContent = 'Available (' + availCount + ')';
    }

    function renderGrid() {
      var stock = loadStock();
      updateAvailabilityCounts(stock);

      if (syncNoticeEl) {
        if (isSessionModified()) {
          syncNoticeEl.textContent = 'Live session update active from Owner Admin Demo →';
        } else {
          syncNoticeEl.textContent = 'Try 1-tap stock toggles in Owner Admin Demo →';
        }
      }

      var filtered = [];
      for (var i = 0; i < stock.length; i++) {
        var s = stock[i];
        var matchEra = filters.era === 'All' || s.era === filters.era;
        var matchSize = filters.size === 'All' || s.size === filters.size;
        var matchAvail = filters.availability === 'All' || s.status === 'Available';
        if (matchEra && matchSize && matchAvail) {
          filtered.push(s);
        }
      }

      if (countEl) {
        countEl.textContent =
          'Showing ' + filtered.length + ' of ' + stock.length +
          ' illustrative 1-of-1 sample listings';
      }

      if (filtered.length === 0) {
        gridEl.innerHTML =
          '<div class="empty-state" style="grid-column: 1 / -1;">' +
            '<h3>No sample shirts match that exact filter combination</h3>' +
            '<p>Try resetting the Era or Size filter, or send a Grail / Shirt Finder request for 2 Danby Wynd.</p>' +
            '<button type="button" class="btn btn--amber" data-inline-reset-filters>Show All Sample Shirts</button>' +
          '</div>';
        var inlineReset = gridEl.querySelector('[data-inline-reset-filters]');
        if (inlineReset) {
          inlineReset.addEventListener('click', resetAllFilters);
        }
        return;
      }

      var html = '';
      for (var j = 0; j < filtered.length; j++) {
        var item = filtered[j];
        var isAvailable = item.status === 'Available';
        var cardClass = item.status === 'Sold' ? 'shirt-card shirt-card--sold' : 'shirt-card';
        var shirtSummary = item.title + ' — Size ' + item.size + ' (' + item.era + ')';

        var ctaHtml = '';
        if (isAvailable) {
          ctaHtml =
            '<button type="button" class="btn btn--primary shirt-card__btn" ' +
              'data-reserve-trigger ' +
              'data-shirt-summary="' + escapeHtml(shirtSummary) + '">' +
              'Reserve / Enquire (Click &amp; Collect)' +
            '</button>';
        } else if (item.status === 'Reserved') {
          ctaHtml =
            '<button type="button" class="btn shirt-card__btn shirt-card__btn--disabled" disabled aria-disabled="true">' +
              'Reserved — Danby Wynd Hold' +
            '</button>';
        } else {
          ctaHtml =
            '<button type="button" class="btn shirt-card__btn shirt-card__btn--disabled" disabled aria-disabled="true">' +
              'Sold — 1-of-1 Piece Gone' +
            '</button>';
        }

        html +=
          '<article class="' + cardClass + '">' +
            '<div class="shirt-card__stage">' +
              '<div class="shirt-card__top-badges">' +
                '<span class="' + getStatusBadgeClass(item.status) + '">' + escapeHtml(item.status) + '</span>' +
                '<span class="rail-tag">1-of-1 stock</span>' +
              '</div>' +
              '<div class="shirt-card__svg-wrap">' +
                renderKitSvg(item.kit, 'Illustrative geometric shirt graphic: ' + item.title) +
              '</div>' +
              '<div class="sample-badge">' + escapeHtml(SAMPLE_TAG) + '</div>' +
            '</div>' +
            '<div class="shirt-card__body">' +
              '<div class="shirt-card__era">' + escapeHtml(item.era) + '</div>' +
              '<h3 class="shirt-card__title">' + escapeHtml(item.title) + '</h3>' +
              '<p class="shirt-card__notes">' + escapeHtml(item.notes || '1-of-1 collector rail sample listing.') + '</p>' +
              '<div class="woven-specs" aria-label="Shirt specifications">' +
                '<span class="woven-spec woven-spec--size">SIZE ' + escapeHtml(item.size) + '</span>' +
                '<span class="woven-spec">' + escapeHtml(item.condition) + '</span>' +
                '<span class="woven-spec">1-of-1 stock</span>' +
              '</div>' +
              '<div class="shirt-card__price-row">' +
                '<span class="shirt-card__price-label">Guide Price</span>' +
                '<span class="shirt-card__price">' + getPriceLine(item) + '</span>' +
              '</div>' +
              ctaHtml +
            '</div>' +
          '</article>';
      }

      gridEl.innerHTML = html;
    }

    function syncFilterButtons() {
      var pills = document.querySelectorAll('[data-filter-group]');
      for (var i = 0; i < pills.length; i++) {
        var btn = pills[i];
        var grp = btn.getAttribute('data-filter-group');
        var val = btn.getAttribute('data-filter-value');
        btn.setAttribute('aria-pressed', filters[grp] === val ? 'true' : 'false');
      }
    }

    function resetAllFilters() {
      filters.era = 'All';
      filters.size = 'All';
      filters.availability = 'All';
      syncFilterButtons();
      renderGrid();
    }

    var filterBtns = document.querySelectorAll('[data-filter-group]');
    for (var k = 0; k < filterBtns.length; k++) {
      filterBtns[k].addEventListener('click', function () {
        var grp = this.getAttribute('data-filter-group');
        var val = this.getAttribute('data-filter-value');
        filters[grp] = val;
        syncFilterButtons();
        renderGrid();
      });
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    renderGrid();
  }

  /* ------------------------------------------------------------------------
     3. Accessible Reserve / Click & Collect Modal Drawer (index.html)
     ------------------------------------------------------------------------ */
  function initReserveModal() {
    var backdrop = document.getElementById('reserve-modal');
    if (!backdrop) return;

    var dialog = backdrop.querySelector('.modal-dialog');
    var closeBtn = document.getElementById('reserve-modal-close');
    var shirtInput = document.getElementById('reserve-shirt');
    var nameInput = document.getElementById('reserve-name');
    var form = document.getElementById('reserve-form');
    var feedback = document.getElementById('reserve-feedback');
    var lastTrigger = null;

    function openModal(prefillText, triggerEl) {
      lastTrigger = triggerEl || document.activeElement;
      if (shirtInput) {
        shirtInput.value = prefillText || 'General Click & Collect / Rail Enquiry (2 Danby Wynd, Yarm)';
      }
      if (feedback) {
        feedback.hidden = true;
        feedback.textContent = '';
      }
      backdrop.hidden = false;
      document.body.style.overflow = 'hidden';
      if (nameInput) {
        nameInput.focus();
      } else if (closeBtn) {
        closeBtn.focus();
      }
    }

    function closeModal() {
      if (backdrop.hidden) return;
      backdrop.hidden = true;
      document.body.style.overflow = '';
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
      }
    }

    /* Delegated click handler for dynamic shirt cards & hero CTA */
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-reserve-trigger]');
      if (trigger) {
        e.preventDefault();
        var summary = trigger.getAttribute('data-shirt-summary') || '';
        openModal(summary, trigger);
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (backdrop.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key === 'Tab' && dialog) {
        var focusable = dialog.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (feedback) {
          feedback.textContent = EXACT_DEMO_MSG;
          feedback.hidden = false;
          feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     4. Sell / Trade & Grail Finder Dummy Form (sell-find.html)
     ------------------------------------------------------------------------ */
  function initFinderForm() {
    var form = document.getElementById('shirt-finder-form');
    var feedback = document.getElementById('finder-feedback');
    if (!form || !feedback) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      feedback.textContent = EXACT_DEMO_MSG;
      feedback.hidden = false;
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* ------------------------------------------------------------------------
     5. Simple 10-Second Owner Stock Admin Demo (admin.html)
     ------------------------------------------------------------------------ */
  function initAdminDemo() {
    var listEl = document.getElementById('admin-stock-list');
    if (!listEl) return;

    var addForm = document.getElementById('add-shirt-form');
    var addFeedback = document.getElementById('admin-form-feedback');
    var resetBtn = document.getElementById('reset-stock-btn');
    var toastEl = document.getElementById('admin-live-toast');

    var statTotal = document.getElementById('stat-total');
    var statAvail = document.getElementById('stat-available');
    var statRes = document.getElementById('stat-reserved');
    var statSold = document.getElementById('stat-sold');

    function updateStats(stock) {
      var a = 0;
      var r = 0;
      var s = 0;
      for (var i = 0; i < stock.length; i++) {
        if (stock[i].status === 'Available') a += 1;
        else if (stock[i].status === 'Reserved') r += 1;
        else if (stock[i].status === 'Sold') s += 1;
      }
      if (statTotal) statTotal.textContent = String(stock.length);
      if (statAvail) statAvail.textContent = String(a);
      if (statRes) statRes.textContent = String(r);
      if (statSold) statSold.textContent = String(s);
    }

    function showToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.hidden = false;
    }

    function renderAdminList() {
      var stock = loadStock();
      updateStats(stock);

      var html = '';
      for (var i = 0; i < stock.length; i++) {
        var item = stock[i];
        var statuses = ['Available', 'Reserved', 'Sold'];
        var togglesHtml = '';

        for (var j = 0; j < statuses.length; j++) {
          var st = statuses[j];
          var cls = 'toggle-btn toggle-btn--' + st.toLowerCase();
          var pressed = item.status === st ? 'true' : 'false';
          togglesHtml +=
            '<button type="button" class="' + cls + '" ' +
              'aria-pressed="' + pressed + '" ' +
              'data-admin-toggle-id="' + escapeHtml(item.id) + '" ' +
              'data-admin-toggle-status="' + st + '">' +
              st +
            '</button>';
        }

        html +=
          '<div class="admin-item">' +
            '<div class="admin-item__main">' +
              '<div class="admin-item__swatch" aria-hidden="true">' +
                renderKitSvg(item.kit, item.title) +
              '</div>' +
              '<div class="admin-item__info">' +
                '<p class="admin-item__title">' + escapeHtml(item.title) + '</p>' +
                '<div class="admin-item__meta">' +
                  'SIZE ' + escapeHtml(item.size) + ' · ' +
                  escapeHtml(item.era) + ' · ' +
                  escapeHtml(item.condition) + ' · ' +
                  escapeHtml(SAMPLE_TAG) +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="admin-item__controls">' +
              '<span class="admin-item__meta">1-Tap Rail Status:</span>' +
              '<div class="toggle-group" role="group" aria-label="Status for ' + escapeHtml(item.title) + '">' +
                togglesHtml +
              '</div>' +
            '</div>' +
          '</div>';
      }

      listEl.innerHTML = html;
    }

    listEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-admin-toggle-id]');
      if (!btn) return;
      var id = btn.getAttribute('data-admin-toggle-id');
      var newStatus = btn.getAttribute('data-admin-toggle-status');
      var stock = loadStock();
      var targetTitle = '';

      for (var i = 0; i < stock.length; i++) {
        if (stock[i].id === id) {
          stock[i].status = newStatus;
          targetTitle = stock[i].title;
          break;
        }
      }

      saveStock(stock, true);
      renderAdminList();
      showToast(
        'Updated "' + targetTitle + '" to ' + newStatus.toUpperCase() +
        ' in this browser tab. Open Stock Room to see it live!'
      );
    });

    if (addForm) {
      addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var titleEl = document.getElementById('admin-title');
        var eraEl = document.getElementById('admin-era');
        var sizeEl = document.getElementById('admin-size');
        var condEl = document.getElementById('admin-condition');
        var priceEl = document.getElementById('admin-price');
        var kitEl = document.getElementById('admin-kit');

        var titleVal = titleEl && titleEl.value.trim()
          ? titleEl.value.trim()
          : '1996–97 Classic Striped Rail Sample';

        var newItem = {
          id: 'ufs-custom-' + Date.now(),
          title: titleVal,
          era: eraEl ? eraEl.value : '1980s–90s',
          size: sizeEl ? sizeEl.value : 'L',
          condition: condEl ? condEl.value : '9/10 Excellent',
          kit: kitEl ? kitEl.value : 'crimson-band',
          status: 'Available',
          notes: 'Added via 10-Second Owner Admin Demo (local browser session preview).',
          demoPriceHint: priceEl && priceEl.value.trim() ? priceEl.value.trim() : ''
        };

        var stock = loadStock();
        stock.unshift(newItem);
        saveStock(stock, true);
        renderAdminList();

        if (titleEl) titleEl.value = '';
        if (priceEl) priceEl.value = '';

        if (addFeedback) {
          addFeedback.innerHTML =
            '<p style="margin:0 0 0.45rem;">' + escapeHtml(EXACT_DEMO_MSG) + '</p>' +
            '<p style="margin:0; font-weight:400; font-size:0.875rem;">' +
              'Preview added to this browser tab\'s sessionStorage — ' +
              '<a href="index.html#stock-room">view "' + escapeHtml(titleVal) + '" at the top of the Stock Room →</a>' +
            '</p>';
          addFeedback.hidden = false;
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        resetStockStorage();
        renderAdminList();
        if (addFeedback) addFeedback.hidden = true;
        showToast('Demo stock reset to the 8 default sample listings.');
      });
    }

    renderAdminList();
  }

  /* Initialize on DOM ready */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initStockRoom();
    initReserveModal();
    initFinderForm();
    initAdminDemo();
  });
})();
