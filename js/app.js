/* ==========================================================================
   ULTRA FOOTBALL SHIRTS — CLIENT-SIDE INTERACTIVE DEMO
   - Embedded Instant Locker Filter Console (Era: All/1980s/1990s/2000s/Modern, Size: All/S/M/L/XL)
   - Die-Cut Garment Swing-Tag Card Renderer with Brass Eyelet, Condition Meter & Perforated Stub
   - Accessible Click & Collect Reserve Modal (2 Danby Wynd, Yarm TS15 9SF)
   - Fanzine Two-Ticket Selector (sell-find.html)
   - 10-Second Handheld Rail Pad Admin Demo (sessionStorage + localStorage sync)
   - Zero external network requests · XSS-safe DOM escaping
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'ultra_football_shirts_demo_stock_v2';
  var MODIFIED_KEY = 'ultra_football_shirts_demo_modified_v2';
  var EXACT_DEMO_MSG = 'Demo only – in the live site this would go straight to Ultra Football Shirts.';
  var SAMPLE_TAG = '[Illustrative sample listing – owner stock to supply]';
  var PRICE_TAG = '[£Price – owner to confirm]';
  var P2P_TAG = '[P2P cm – owner]';

  var DEFAULT_STOCK = [
    {
      id: 'UFS-01',
      title: '1995–96 Teesside Crimson Chest-Band Home Style',
      era: '1990s',
      decadeBadge: '90s CULT',
      size: 'L',
      condition: '9/10 Mint',
      score: 9,
      kit: 'crimson-band',
      status: 'Available',
      notes: 'Classic woven fold-over collar, crisp white chest band, heavy 90s jacquard weave.',
      p2p: '',
      demoPriceHint: ''
    },
    {
      id: 'UFS-02',
      title: '1988–90 Turf Emerald & Gold Pinstripe Third Style',
      era: '1980s',
      decadeBadge: '80s CLASSIC',
      size: 'M',
      condition: '8/10 Very Good',
      score: 8,
      kit: 'turf-pinstripes',
      status: 'Reserved',
      notes: 'Late-80s twin pinstripe cut; held on demo Click & Collect for Danby Wynd inspection.',
      p2p: '',
      demoPriceHint: ''
    },
    {
      id: 'UFS-03',
      title: '1993–95 Claret & Sky Jacquard Stripe Home Style',
      era: '1990s',
      decadeBadge: '90s CULT',
      size: 'M',
      condition: '9.5/10 Mint',
      score: 10,
      kit: 'claret-sky-stripes',
      status: 'Available',
      notes: 'Traditional vertical stripes with ribbed V-neck trim and clean stitched cuffs.',
      p2p: '',
      demoPriceHint: ''
    },
    {
      id: 'UFS-04',
      title: '1986–88 Matchday Amber & Charcoal Chevron Away Style',
      era: '1980s',
      decadeBadge: '80s CLASSIC',
      size: 'XL',
      condition: '8/10 Very Good',
      score: 8,
      kit: 'amber-chevrons',
      status: 'Available',
      notes: 'Bold terrace away geometry, vibrant colourway, honest age-consistent patina.',
      p2p: '',
      demoPriceHint: ''
    },
    {
      id: 'UFS-05',
      title: '2002–04 Albiceleste Sky & White Stripe Home Style',
      era: '2000s',
      decadeBadge: '00s ICON',
      size: 'L',
      condition: '9/10 Mint',
      score: 9,
      kit: 'sky-white-stripes',
      status: 'Available',
      notes: 'Early-2000s dual-layer mesh panelling with contrast midnight collar and cuffs.',
      p2p: '',
      demoPriceHint: ''
    },
    {
      id: 'UFS-06',
      title: '2005–06 Viola & Chalk Halves European Cup Style',
      era: '2000s',
      decadeBadge: '00s ICON',
      size: 'S',
      condition: '10/10 BNWT',
      score: 10,
      kit: 'viola-halves',
      status: 'Available',
      notes: 'Unworn deadstock collector piece retaining original manufacturer tags and piping.',
      p2p: '',
      demoPriceHint: ''
    },
    {
      id: 'UFS-07',
      title: '1997–98 Midnight & Turf Diagonal Sash Away Style',
      era: '1990s',
      decadeBadge: '90s CULT',
      size: 'XL',
      condition: '9/10 Mint',
      score: 9,
      kit: 'midnight-sash',
      status: 'Available',
      notes: 'Sharp diagonal sash across deep floodlight navy body with tailored collar.',
      p2p: '',
      demoPriceHint: ''
    },
    {
      id: 'UFS-08',
      title: '2017–18 Floodlight Navy & Copper Quarters Collector Cut',
      era: 'Modern',
      decadeBadge: 'MODERN CUT',
      size: 'S',
      condition: '9.5/10 Mint',
      score: 10,
      kit: 'navy-copper-quarters',
      status: 'Available',
      notes: 'Limited-run modern classic quartered shirt with tonal woven hem label.',
      p2p: '',
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

  function decadeBadgeForEra(era) {
    if (era === '1980s') return '80s CLASSIC';
    if (era === '1990s') return '90s CULT';
    if (era === '2000s') return '00s ICON';
    return 'MODERN CUT';
  }

  function scoreForCondition(condStr) {
    var s = String(condStr || '');
    if (s.indexOf('10') !== -1 || s.indexOf('BNWT') !== -1 || s.indexOf('9.5') !== -1) return 10;
    if (s.indexOf('9') !== -1) return 9;
    if (s.indexOf('8') !== -1) return 8;
    if (s.indexOf('7') !== -1) return 7;
    return 9;
  }

  function loadStock() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(STORAGE_KEY);
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
      if (markModified) window.sessionStorage.setItem(MODIFIED_KEY, '1');
    } catch (_) {}
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      if (markModified) window.localStorage.setItem(MODIFIED_KEY, '1');
    } catch (_) {}
  }

  function resetStockStorage() {
    memoryFallbackStock = null;
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(MODIFIED_KEY);
    } catch (_) {}
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(MODIFIED_KEY);
    } catch (_) {}
    return cloneDefaults();
  }

  function isSessionModified() {
    try {
      return (
        window.sessionStorage.getItem(MODIFIED_KEY) === '1' ||
        window.localStorage.getItem(MODIFIED_KEY) === '1'
      );
    } catch (_) {
      return false;
    }
  }

  /* ------------------------------------------------------------------------
     Bespoke Non-Branded Geometric SVG Football Kit Renderer
     ------------------------------------------------------------------------ */
  var svgUidCounter = 0;

  function renderKitSvg(kitKey, labelText) {
    svgUidCounter += 1;
    var clipId = 'shirt-clip-' + svgUidCounter;
    var safeLabel = escapeHtml(labelText || 'Illustrative geometric football shirt');

    var palettes = {
      'crimson-band': {
        base: '#B81D24',
        collar: '#F6F4EE',
        cuff: '#F6F4EE',
        pattern:
          '<rect x="18" y="46" width="84" height="18" fill="#F6F4EE"/>' +
          '<rect x="18" y="43" width="84" height="2.5" fill="#0D1115" opacity="0.35"/>' +
          '<rect x="18" y="64.5" width="84" height="2.5" fill="#0D1115" opacity="0.35"/>'
      },
      'claret-sky-stripes': {
        base: '#6E1E36',
        collar: '#7BC4E8',
        cuff: '#7BC4E8',
        pattern:
          '<rect x="10" y="18" width="16" height="92" fill="#7BC4E8"/>' +
          '<rect x="40" y="18" width="12" height="92" fill="#F6F4EE"/>' +
          '<rect x="68" y="18" width="12" height="92" fill="#F6F4EE"/>' +
          '<rect x="94" y="18" width="16" height="92" fill="#7BC4E8"/>'
      },
      'amber-chevrons': {
        base: '#F5C518',
        collar: '#0D1115',
        cuff: '#0D1115',
        pattern:
          '<polygon points="18,40 60,62 102,40 102,52 60,74 18,52" fill="#0D1115"/>' +
          '<polygon points="18,64 60,86 102,64 102,75 60,97 18,75" fill="#0D1115"/>'
      },
      'sky-white-stripes': {
        base: '#F6F4EE',
        collar: '#0D1115',
        cuff: '#0D1115',
        pattern:
          '<rect x="28" y="18" width="13" height="92" fill="#6BB6E6"/>' +
          '<rect x="53.5" y="18" width="13" height="92" fill="#6BB6E6"/>' +
          '<rect x="79" y="18" width="13" height="92" fill="#6BB6E6"/>'
      },
      'viola-halves': {
        base: '#4C2A85',
        collar: '#F5C518',
        cuff: '#F5C518',
        pattern:
          '<rect x="60" y="18" width="52" height="92" fill="#F6F4EE"/>' +
          '<rect x="58.5" y="18" width="3" height="92" fill="#F5C518"/>'
      },
      'turf-pinstripes': {
        base: '#08693A',
        collar: '#F5C518',
        cuff: '#F5C518',
        pattern:
          '<rect x="34" y="18" width="2.5" height="92" fill="#F5C518"/>' +
          '<rect x="48" y="18" width="2.5" height="92" fill="#F6F4EE"/>' +
          '<rect x="69.5" y="18" width="2.5" height="92" fill="#F6F4EE"/>' +
          '<rect x="83.5" y="18" width="2.5" height="92" fill="#F5C518"/>'
      },
      'midnight-sash': {
        base: '#162435',
        collar: '#08693A',
        cuff: '#08693A',
        pattern:
          '<polygon points="24,22 42,22 96,106 78,106" fill="#08693A"/>' +
          '<polygon points="42,22 46,22 100,106 96,106" fill="#F5C518"/>'
      },
      'navy-copper-quarters': {
        base: '#142130',
        collar: '#D97B43',
        cuff: '#D97B43',
        pattern:
          '<rect x="60" y="18" width="52" height="44" fill="#C96A34"/>' +
          '<rect x="10" y="62" width="50" height="48" fill="#C96A34"/>' +
          '<rect x="18" y="61" width="84" height="2" fill="#F6F4EE" opacity="0.5"/>'
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
        '<path d="M60 6 C65 6 67 10 64 13 C62 15 60 15.5 60 18" fill="none" stroke="#94A3B8" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M41 22 L60 17 L79 22" fill="none" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>' +
        '<g clip-path="url(#' + clipId + ')">' +
          '<rect x="10" y="18" width="100" height="92" fill="' + p.base + '"/>' +
          p.pattern +
          '<rect x="10" y="18" width="100" height="92" fill="rgba(255,255,255,0.03)"/>' +
        '</g>' +
        '<path d="' + shirtPath + '" fill="none" stroke="#F6F4EE" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M40 21.5 L60 37 L80 21.5 L73 20.5 L60 30.5 L47 20.5 Z" fill="' + p.collar + '" stroke="#0D1115" stroke-width="1.2"/>' +
        '<rect x="56" y="23" width="8" height="4" fill="#0D1115"/>' +
        '<path d="M15.5 36.5 L24.5 53.5" stroke="' + p.cuff + '" stroke-width="4" stroke-linecap="butt"/>' +
        '<path d="M104.5 36.5 L95.5 53.5" stroke="' + p.cuff + '" stroke-width="4" stroke-linecap="butt"/>' +
      '</svg>'
    );
  }

  function renderConditionSegments(score) {
    var filled = Math.max(1, Math.min(10, Number(score) || 9));
    var out = '';
    for (var s = 1; s <= 10; s++) {
      out += '<span class="cond-seg' + (s <= filled ? ' cond-seg--on' : '') + '"></span>';
    }
    return out;
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
      if (toggleBtn.getAttribute('aria-expanded') === 'true') {
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
     2. Interactive Die-Cut Swing-Tag Stock Room (index.html)
     ------------------------------------------------------------------------ */
  function initStockRoom() {
    var gridEl = document.getElementById('stock-grid');
    if (!gridEl) return;

    var countEl = document.getElementById('stock-results-count');
    var syncNoticeEl = document.getElementById('session-sync-badge');
    var resetFiltersBtn = document.getElementById('reset-filters-btn');
    var sizeNavPip = document.querySelector('[data-active-size-pip]');

    var filters = {
      era: 'All',
      size: 'All',
      availability: 'All'
    };

    function getPriceLine(item) {
      if (item.demoPriceHint && String(item.demoPriceHint).trim() !== '') {
        return PRICE_TAG + ' (' + escapeHtml(item.demoPriceHint) + ')';
      }
      return PRICE_TAG;
    }

    function getP2PLine(item) {
      if (item.p2p && String(item.p2p).trim() !== '') {
        return escapeHtml(item.p2p);
      }
      return P2P_TAG;
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

      if (sizeNavPip) {
        sizeNavPip.textContent = 'SIZE [' + (filters.size === 'All' ? 'ALL' : filters.size) + ']';
      }

      if (syncNoticeEl) {
        syncNoticeEl.textContent = isSessionModified()
          ? 'Live rail sync active from Owner Scanner Demo \u2192'
          : 'Test 1-tap rail toggles in Owner Scanner Demo \u2192';
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
          'Showing ' + filtered.length + ' of ' + stock.length + ' swing-tags';
      }

      if (filtered.length === 0) {
        gridEl.innerHTML =
          '<div class="empty-state" style="grid-column: 1 / -1;">' +
            '<h3>No sample swing-tags match that Era + Size filter</h3>' +
            '<p>Reset the locker filter above, or lodge a Shirt Finder ticket for 2 Danby Wynd.</p>' +
            '<button type="button" class="btn btn--floodlight" data-inline-reset-filters>Show All Swing-Tags</button>' +
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
        var tagClass = item.status === 'Sold' ? 'swing-tag swing-tag--sold' : 'swing-tag';
        var badgeLabel = item.decadeBadge || decadeBadgeForEra(item.era);
        var scoreNum = item.score || scoreForCondition(item.condition);
        var serialCode = String(item.id || ('UFS-0' + (j + 1))).toUpperCase();
        var shirtSummary = item.title + ' — Size ' + item.size + ' (' + item.era + ')';

        var ctaHtml = '';
        if (isAvailable) {
          ctaHtml =
            '<button type="button" class="btn btn--emerald swing-tag__btn" ' +
              'data-reserve-trigger ' +
              'data-shirt-summary="' + escapeHtml(shirtSummary) + '">' +
              'Click &amp; Collect \u00B7 2 Danby Wynd' +
            '</button>';
        } else if (item.status === 'Reserved') {
          ctaHtml =
            '<button type="button" class="btn swing-tag__btn swing-tag__btn--disabled" disabled aria-disabled="true">' +
              'Held at Counter \u00B7 2 Danby Wynd' +
            '</button>';
        } else {
          ctaHtml =
            '<button type="button" class="btn swing-tag__btn swing-tag__btn--disabled" disabled aria-disabled="true">' +
              'Sold \u00B7 1-of-1 Gone' +
            '</button>';
        }

        html +=
          '<article class="swing-tag-wrap">' +
            '<div class="swing-tag-shell">' +
              '<div class="' + tagClass + '">' +
                /* Top chamfered crown + punched brass eyelet hole */
                '<div class="swing-tag__crown">' +
                  '<span class="decade-badge">' + escapeHtml(badgeLabel) + '</span>' +
                  '<span class="swing-tag__eyelet" aria-hidden="true"></span>' +
                  '<span class="' + getStatusBadgeClass(item.status) + '">' + escapeHtml(item.status) + '</span>' +
                '</div>' +

                /* Floodlight Kit SVG Stage */
                '<div class="swing-tag__stage">' +
                  '<div class="swing-tag__svg-wrap">' +
                    renderKitSvg(item.kit, 'Illustrative geometric shirt graphic: ' + item.title) +
                  '</div>' +
                  '<div class="sample-badge">' + escapeHtml(SAMPLE_TAG) + '</div>' +
                '</div>' +

                /* Garment Swing-Tag Spec Body */
                '<div class="swing-tag__body">' +
                  '<h3 class="swing-tag__title">' + escapeHtml(item.title) + '</h3>' +
                  '<p class="swing-tag__notes">' + escapeHtml(item.notes || '1-of-1 collector rail sample listing.') + '</p>' +

                  '<div class="swing-tag__measurements" aria-label="Garment size and pit-to-pit measurement">' +
                    '<span class="size-stamp">SIZE ' + escapeHtml(item.size) + '</span>' +
                    '<span class="p2p-stamp">' + getP2PLine(item) + '</span>' +
                  '</div>' +

                  '<div class="cond-meter" aria-label="Condition grade ' + escapeHtml(item.condition) + '">' +
                    '<div class="cond-meter__row">' +
                      '<span>CONDITION</span>' +
                      '<strong>[Grade \u2013 ' + escapeHtml(item.condition) + ']</strong>' +
                    '</div>' +
                    '<div class="cond-meter__segments" aria-hidden="true">' +
                      renderConditionSegments(scoreNum) +
                    '</div>' +
                  '</div>' +

                  '<div class="swing-tag__price-row">' +
                    '<span class="swing-tag__price-k">Rail Price</span>' +
                    '<span class="swing-tag__price-v">' + getPriceLine(item) + '</span>' +
                  '</div>' +
                '</div>' +

                /* Dashed Perforated Tear-Off Stub */
                '<div class="swing-tag__stub">' +
                  '<div class="swing-tag__serial">' +
                    '<span>SERIAL // ' + escapeHtml(serialCode) + '</span>' +
                    '<strong>1 OF 1</strong>' +
                  '</div>' +
                  ctaHtml +
                '</div>' +
              '</div>' +
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
     4. Sell / Trade & Grail Finder Two-Ticket Forms (sell-find.html)
     ------------------------------------------------------------------------ */
  function initFinderForms() {
    /* Support any client-side dummy forms on sell-find.html */
    var enquirySelect = document.getElementById('enquiry-type');
    var ticketButtons = document.querySelectorAll('[data-select-enquiry]');
    for (var t = 0; t < ticketButtons.length; t++) {
      ticketButtons[t].addEventListener('click', function () {
        var mode = this.getAttribute('data-select-enquiry');
        if (enquirySelect && mode) {
          enquirySelect.value = mode;
        }
        var targetForm = document.getElementById('shirt-finder-section');
        if (targetForm) {
          targetForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        var nameField = document.getElementById('enquiry-name');
        if (nameField) {
          setTimeout(function () {
            nameField.focus();
          }, 220);
        }
      });
    }

    var form = document.getElementById('shirt-finder-form');
    var feedback = document.getElementById('finder-feedback');
    if (form && feedback) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        feedback.textContent = EXACT_DEMO_MSG;
        feedback.hidden = false;
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  /* ------------------------------------------------------------------------
     5. 10-Second Handheld Stock-Room Inventory Pad (admin.html)
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
              st.toUpperCase() +
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
                  escapeHtml(item.id) + ' \u00B7 SIZE ' + escapeHtml(item.size) + ' \u00B7 ' +
                  escapeHtml(item.era) + ' \u00B7 ' +
                  escapeHtml(item.condition) + ' \u00B7 ' +
                  escapeHtml(SAMPLE_TAG) +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="admin-item__controls">' +
              '<span class="admin-item__meta">TAP RAIL STATUS:</span>' +
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
        'RAIL PAD SYNC // "' + targetTitle + '" marked ' + newStatus.toUpperCase() +
        '. Switch to Stock Room to inspect the updated swing-tag!'
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
        var chosenEra = eraEl ? eraEl.value : '1990s';
        var chosenCond = condEl ? condEl.value : '9/10 Mint';

        var stock = loadStock();
        var nextNum = stock.length + 1;
        var serialId = 'UFS-' + (nextNum < 10 ? '0' + nextNum : String(nextNum));

        var newItem = {
          id: serialId,
          title: titleVal,
          era: chosenEra,
          decadeBadge: decadeBadgeForEra(chosenEra),
          size: sizeEl ? sizeEl.value : 'L',
          condition: chosenCond,
          score: scoreForCondition(chosenCond),
          kit: kitEl ? kitEl.value : 'crimson-band',
          status: 'Available',
          notes: 'Added via 10-Second Handheld Rail Pad Demo (local browser session preview).',
          p2p: '',
          demoPriceHint: priceEl && priceEl.value.trim() ? priceEl.value.trim() : ''
        };

        stock.unshift(newItem);
        saveStock(stock, true);
        renderAdminList();

        if (titleEl) titleEl.value = '';
        if (priceEl) priceEl.value = '';

        if (addFeedback) {
          addFeedback.innerHTML =
            '<p style="margin:0 0 0.45rem;">' + escapeHtml(EXACT_DEMO_MSG) + '</p>' +
            '<p style="margin:0; font-weight:400; font-size:0.86rem;">' +
              'Swing-tag ' + escapeHtml(serialId) + ' added to local preview \u2014 ' +
              '<a href="index.html#stock-room">inspect "' + escapeHtml(titleVal) + '" on the live Stock Room rail \u2192</a>' +
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
        showToast('Rail Pad reset to the 8 default 2 Danby Wynd sample swing-tags.');
      });
    }

    renderAdminList();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initStockRoom();
    initReserveModal();
    initFinderForms();
    initAdminDemo();
  });
})();

// === Gallery Inspiration Polish (Awwwards / Godly / Mobbin) ===
(function () {
  'use strict';

  function initGalleryPolish() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Subtle Top Header Reading-Progress Hairline
    var hdr = document.querySelector('header');
    if (hdr && !hdr.querySelector('.scroll-progress-rail')) {
      var cs = window.getComputedStyle(hdr);
      if (cs.position === 'static') {
        hdr.style.position = 'relative';
      }
      var rail = document.createElement('div');
      rail.className = 'scroll-progress-rail';
      rail.setAttribute('aria-hidden', 'true');
      hdr.appendChild(rail);
      var ticking = false;
      var updateRail = function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
        rail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateRail);
        }
      }, { passive: true });
      updateRail();
    }

    // 2. Choreographed Below-the-Fold Scroll Reveals (Godly / SiteInspire)
    if (!reduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.fanzine-panel, .sell-step-card, .finder-card, .visit-wynd-card');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

      var vh = window.innerHeight || 800;
      var staggerIdx = 0;
      targets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top > vh * 0.94) {
          el.style.setProperty('--reveal-delay', ((staggerIdx % 3) * 55) + 'ms');
          staggerIdx++;
          el.classList.add('reveal-ready');
          obs.observe(el);
        }
      });

      // Safety fallback on hash jump so targeted sections reveal immediately
      window.addEventListener('hashchange', function () {
        document.querySelectorAll('.reveal-ready:not(.is-revealed)').forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
            el.classList.add('is-revealed');
          }
        });
      });
    }

    // 3. Mobbin Smart Date Defaults + 1-Tap Quick Date Chips
    function toIso(d) {
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    }
    function nextWeekday(base, targetDow) {
      var diff = (targetDow - base.getDay() + 7) % 7;
      if (diff === 0) diff = 7;
      return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
    }

    var today = new Date();
    var todayIso = toIso(today);
    document.querySelectorAll('input[type="date"]').forEach(function (input) {
      if (!input.min) {
        input.min = todayIso;
      }
      var fieldWrap = input.parentElement;
      if (!fieldWrap || fieldWrap.querySelector('[data-friday-chips]') || fieldWrap.querySelector('.quick-date-chips')) {
        return;
      }
      var isReturn = input.id === 'return-date';
      var chipRow = document.createElement('div');
      chipRow.className = 'quick-date-chips';
      chipRow.setAttribute('aria-label', 'Quick date options');

      var presets = [];
      if (isReturn) {
        presets = [
          { label: 'Same Day', calc: function () { var o = document.getElementById('outbound-date'); return (o && o.value) ? o.value : todayIso; } },
          { label: '+2 Days', calc: function () {
            var o = document.getElementById('outbound-date');
            var base = (o && o.value) ? new Date(o.value + 'T12:00:00') : today;
            return toIso(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 2));
          } }
        ];
      } else {
        var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        var fri = today.getDay() === 5 ? today : nextWeekday(today, 5);
        var sat = today.getDay() === 6 ? today : nextWeekday(today, 6);
        presets = [
          { label: 'Tomorrow', iso: toIso(tmrw) },
          { label: (today.getDay() === 5 ? 'Tonight (Fri)' : 'This Friday'), iso: toIso(fri) },
          { label: (today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday'), iso: toIso(sat) }
        ];
      }

      presets.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-date-chip';
        btn.textContent = p.label;
        btn.addEventListener('click', function () {
          var val = p.calc ? p.calc() : p.iso;
          input.value = val;
          chipRow.querySelectorAll('.quick-date-chip').forEach(function (c) { c.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        chipRow.appendChild(btn);
      });

      input.insertAdjacentElement('afterend', chipRow);
    });

  // Awwwards 3D perspective swing-tag micro-tilt on pointer devices
  if (window.matchMedia && window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
    document.addEventListener('mousemove', function (e) {
      var shell = e.target && e.target.closest ? e.target.closest('.swing-tag-shell') : null;
      if (!shell) return;
      var r = shell.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      shell.style.transform = 'perspective(900px) rotateX(' + (-ny * 5).toFixed(2) + 'deg) rotateY(' + (nx * 6).toFixed(2) + 'deg) translateY(-3px)';
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      var shell = e.target && e.target.closest ? e.target.closest('.swing-tag-shell') : null;
      if (shell && (!e.relatedTarget || !shell.contains(e.relatedTarget))) {
        shell.style.transform = '';
      }
    }, { passive: true });
  }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryPolish);
  } else {
    initGalleryPolish();
  }
})();
