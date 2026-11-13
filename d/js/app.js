/* Ultra Football Shirts — Concept D: The Sticker Album (demo only)
   All shirts are illustrative samples drawn in SVG; no real clubs, crests or stock. */
(function () {
  'use strict';

  var SHIRTS = [
    { no: 1, era: '80s', pat: 'stripes', a: '#C8102E', b: '#FFFFFF', bg: '#F6D9DD' },
    { no: 2, era: '80s', pat: 'plain', a: '#1D4E9E', b: '#FFFFFF', bg: '#D9E4F5' },
    { no: 3, era: '80s', pat: 'sash', a: '#FFFFFF', b: '#C8102E', bg: '#E8E2D0' },
    { no: 4, era: '90s', pat: 'zigzag', a: '#0B7A4B', b: '#FFCB05', bg: '#D5EBDD', foil: true },
    { no: 5, era: '90s', pat: 'halves', a: '#7A1F3D', b: '#8FC1E3', bg: '#EAD7DE' },
    { no: 6, era: '90s', pat: 'hoops', a: '#111111', b: '#F2F2F2', bg: '#DDDDDD' },
    { no: 7, era: '90s', pat: 'stripes', a: '#0F3B82', b: '#111111', bg: '#D6DDEC', foil: true },
    { no: 8, era: '00s', pat: 'plain', a: '#F58220', b: '#111111', bg: '#FBE3CC' },
    { no: 9, era: '00s', pat: 'sash', a: '#FFCB05', b: '#0B7A4B', bg: '#FFF3C2' },
    { no: 10, era: '00s', pat: 'halves', a: '#FFFFFF', b: '#1D4E9E', bg: '#E3E9F2' },
    { no: 11, era: '10s', pat: 'hoops', a: '#0B7A4B', b: '#FFFFFF', bg: '#D5EBDD' },
    { no: 12, era: '10s', pat: 'zigzag', a: '#5B2A86', b: '#F9A8D4', bg: '#E8DCF2', foil: true }
  ];
  var EMPTY = [{ no: 13, era: '80s' }, { no: 14, era: '10s' }];
  var ERA = { '80s': '1980s', '90s': '1990s', '00s': '2000s', '10s': '2010s' };
  var SHAPE = 'M30 8 L42 2 Q50 9 58 2 L70 8 L92 22 L82 40 L72 34 L72 96 L28 96 L28 34 L18 40 L8 22 Z';

  function shirtSVG(s) {
    var id = 'c' + s.no, fill = '';
    if (s.pat === 'plain') fill = '';
    if (s.pat === 'stripes') for (var x = 8; x < 92; x += 16) fill += '<rect x="' + x + '" y="0" width="8" height="100" fill="' + s.b + '"/>';
    if (s.pat === 'hoops') for (var y = 6; y < 100; y += 18) fill += '<rect x="0" y="' + y + '" width="100" height="9" fill="' + s.b + '"/>';
    if (s.pat === 'halves') fill = '<rect x="50" y="0" width="50" height="100" fill="' + s.b + '"/>';
    if (s.pat === 'sash') fill = '<polygon points="22,0 40,0 100,78 100,100 82,100" fill="' + s.b + '"/>';
    if (s.pat === 'zigzag') for (var z = 20; z < 100; z += 22) fill += '<polyline points="0,' + z + ' 12,' + (z - 9) + ' 25,' + z + ' 37,' + (z - 9) + ' 50,' + z + ' 62,' + (z - 9) + ' 75,' + z + ' 87,' + (z - 9) + ' 100,' + z + '" fill="none" stroke="' + s.b + '" stroke-width="6"/>';
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="' + SHAPE + '"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + ')"><rect width="100" height="100" fill="' + s.a + '"/>' + fill + '</g>' +
      '<path d="' + SHAPE + '" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1.5"/>' +
      '<path d="M42 2 Q50 13 58 2" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="3"/></svg>';
  }

  /* State (kept only in this browser, if storage is available) */
  var KEY = 'ufs-album-d';
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { state = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ } }

  var pageEl = document.querySelector('[data-page]');
  var era = 'all';
  function label(s) { return 'Sample ' + (s.no < 10 ? '0' : '') + s.no; }

  function renderPage() {
    pageEl.textContent = '';
    var items = SHIRTS.concat(EMPTY).sort(function (a, b) { return a.no - b.no; });
    items.forEach(function (s) {
      if (era !== 'all' && s.era !== era) return;
      var li = document.createElement('li');
      li.className = 'slot';
      if (!s.pat) {
        li.className += ' slot--empty';
        li.innerHTML = '<b>' + s.no + '</b><span>Empty slot. Waiting for the next drop.</span>';
        pageEl.appendChild(li);
        return;
      }
      var st = state[s.no] || '';
      li.setAttribute('data-state', st);
      li.innerHTML =
        '<article class="sticker" style="--tilt:' + (s.no % 2 ? -1.2 : 1.1) + 'deg">' +
          '<div class="sticker__art' + (s.foil ? ' foil' : '') + '" style="--bg:' + s.bg + '">' + shirtSVG(s) +
            '<span class="sticker__no">' + s.no + '</span><span class="sticker__era">' + ERA[s.era] + '</span></div>' +
          '<h3 class="sticker__name">' + label(s) + (s.foil ? ' · shiny' : '') + '</h3>' +
          '<p class="sticker__meta">[Club / season] · [Size] · [£—]</p>' +
          '<div class="sticker__btns">' +
            '<button type="button" data-act="got" aria-pressed="' + (st === 'got') + '" aria-label="Got ' + label(s) + '">Got</button>' +
            '<button type="button" data-act="need" aria-pressed="' + (st === 'need') + '" aria-label="Need ' + label(s) + '">Need</button>' +
          '</div></article>';
      li.querySelector('.sticker__btns').addEventListener('click', function (e) {
        var act = e.target.getAttribute('data-act');
        if (!act) return;
        state[s.no] = state[s.no] === act ? '' : act;
        save(); renderPage(); renderNeeds();
      });
      pageEl.appendChild(li);
    });
  }

  function renderNeeds() {
    var list = document.querySelector('[data-needlist]');
    var need = SHIRTS.filter(function (s) { return state[s.no] === 'need'; });
    var got = SHIRTS.filter(function (s) { return state[s.no] === 'got'; });
    document.querySelector('[data-stat-total]').textContent = SHIRTS.length;
    document.querySelector('[data-stat-need]').textContent = need.length;
    document.querySelector('[data-stat-got]').textContent = got.length;
    document.querySelector('[data-needs-empty]').hidden = need.length > 0;
    list.textContent = '';
    need.forEach(function (s) {
      var li = document.createElement('li');
      li.innerHTML = '<span>No. ' + s.no + ' · ' + label(s) + ' · ' + ERA[s.era] + '</span><button type="button" aria-label="Remove ' + label(s) + '">×</button>';
      li.querySelector('button').addEventListener('click', function () { state[s.no] = ''; save(); renderPage(); renderNeeds(); });
      list.appendChild(li);
    });
  }

  var tabs = document.querySelectorAll('[data-era]');
  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener('click', function () {
      era = t.getAttribute('data-era');
      Array.prototype.forEach.call(tabs, function (o) { o.setAttribute('aria-selected', o === t ? 'true' : 'false'); });
      renderPage();
    });
  });

  /* Countdown to the next Friday 18:00 (illustrative drop time) */
  function nextDrop() {
    var d = new Date();
    var add = (5 - d.getDay() + 7) % 7;
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + add, 18, 0, 0);
    if (t <= d) t.setDate(t.getDate() + 7);
    return t;
  }
  var target = nextDrop();
  document.querySelector('[data-drop-when]').textContent =
    target.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ', 6pm.';
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var s = Math.max(0, Math.floor((target - new Date()) / 1000));
    document.querySelector('[data-c-d]').textContent = Math.floor(s / 86400);
    document.querySelector('[data-c-h]').textContent = pad(Math.floor(s % 86400 / 3600));
    document.querySelector('[data-c-m]').textContent = pad(Math.floor(s % 3600 / 60));
    document.querySelector('[data-c-s]').textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  /* Finder form */
  var form = document.querySelector('[data-finder]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, err = document.querySelector('[data-finder-error]'), done = document.querySelector('[data-finder-done]');
    if (!f.name.value.trim() || !f.contact.value.trim()) { err.hidden = false; done.hidden = true; return; }
    err.hidden = true; done.hidden = false;
    var n = SHIRTS.filter(function (s) { return state[s.no] === 'need'; }).length;
    done.textContent = n + (n === 1 ? ' sticker' : ' stickers') + ' held for you at 2 Danby Wynd' +
      (f.want.value.trim() ? ', and we will look for: ' + f.want.value.trim() : '') + '. Demo only, nothing has been sent.';
  });

  renderPage(); renderNeeds();
})();
