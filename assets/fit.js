/* Fit engine for the home page.
   Every screen (intro, each page of projects, education, skills, contact) is laid
   out to fit the window, whatever its size or shape:
   - project cards go side by side when there is room, and stack when there is not;
     cards are then split across as many full-height screens as needed, so a whole
     project is always visible without scrolling;
   - a block that is still too tall is scaled down slightly (never below 72 %).
   Without JavaScript the page keeps its normal flowing layout. */
(function () {
  var root = document.documentElement;
  var work = document.getElementById('work');
  if (!work) return;
  root.classList.add('fit');

  var MIN_ZOOM = 0.72, PAD = 56, MIN_CARD = 250, GAP = 40;
  var header = document.querySelector('.site-header');
  var head = work.querySelector('.section-head');
  var cards = [].slice.call(work.querySelectorAll('.card'));
  var original = work.querySelector('.cards');
  var probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);

  function hgt(el) { return el.getBoundingClientRect().height; }
  function viewport() {
    var s = hgt(probe) || window.innerHeight;
    return Math.min(s, window.innerHeight);
  }
  function fitZoom(el, avail) {
    el.style.zoom = '';
    if (hgt(el) <= avail) return 1;
    var lo = MIN_ZOOM, hi = 1;
    for (var i = 0; i < 7; i++) {
      var m = (lo + hi) / 2;
      el.style.zoom = m;
      if (hgt(el) <= avail) lo = m; else hi = m;
    }
    el.style.zoom = lo;
    return lo;
  }

  function layoutWork(V) {
    // gather everything back into one staging grid
    var stage = document.createElement('div');
    stage.className = 'grid';
    work.appendChild(stage);
    work.insertBefore(head, stage);
    cards.forEach(function (c) { c.style.zoom = ''; stage.appendChild(c); });
    [].slice.call(work.querySelectorAll('.work-page')).forEach(function (p) { p.remove(); });
    if (original) { original.remove(); original = null; }

    var W = stage.getBoundingClientRect().width;
    var n = cards.length;
    var maxCols = Math.max(1, Math.min(n, Math.floor((W + GAP) / (MIN_CARD + GAP))));
    var headH = hgt(head);
    var availFirst = V - PAD - headH, availNext = V - PAD;
    var cols = 1, cardH = 0;
    for (var c = maxCols; c >= 1; c--) {
      if (c > 1 && n % c !== 0) continue;            // avoid a lone card on its row
      stage.style.setProperty('--cols', c);
      cardH = Math.max.apply(null, cards.map(hgt));
      cols = c;
      if (cardH <= availNext) break;
    }
    if (cardH > availNext) {                           // even alone a card is too tall: scale it
      var z = Math.max(MIN_ZOOM, availNext / cardH);
      cards.forEach(function (x) { x.style.zoom = z; });
      cardH = Math.max.apply(null, cards.map(hgt));
    }
    var rowsFirst = Math.max(cardH <= availFirst ? 1 : 0, Math.floor(availFirst / cardH));
    var rowsNext = Math.max(1, Math.floor(availNext / cardH));
    stage.remove();

    var idx = 0, first = true, pages = [];
    if (rowsFirst === 0) {                             // heading alone on the first screen would be odd: keep it with one row, scaled
      rowsFirst = 1;
    }
    while (idx < n) {
      var per = (first ? rowsFirst : rowsNext) * cols;
      var page = document.createElement('div');
      page.className = 'work-page';
      if (first) page.appendChild(head);
      var g = document.createElement('div');
      g.className = 'grid';
      g.style.setProperty('--cols', cols);
      cards.slice(idx, idx + per).forEach(function (x) { g.appendChild(x); });
      page.appendChild(g);
      work.appendChild(page);
      pages.push(page);
      idx += per; first = false;
    }
    if (pages.length > 1) {
      pages.forEach(function (p, i) {
        var note = document.createElement('p');
        note.className = 'page-note';
        note.setAttribute('aria-hidden', 'true');
        note.textContent = (i + 1) + ' / ' + pages.length;
        p.appendChild(note);
      });
    }
    var firstPage = pages[0];
    if (firstPage && hgt(firstPage) > V + 1) fitZoom(firstPage.querySelector('.grid'), availFirst);
  }

  function layout() {
    var V = viewport();
    var hh = header ? hgt(header) : 0;
    root.style.setProperty('--vh', V + 'px');
    root.style.setProperty('--hh', hh + 'px');

    var hero = document.querySelector('.hero .fit-unit');
    if (hero) fitZoom(hero, V - hh - 40);

    layoutWork(V);

    var es = document.querySelector('.edu-skills');
    if (es) {
      var unit = es.querySelector('.fit-unit');
      var edu = document.getElementById('education'), sk = document.getElementById('skills');
      es.classList.remove('split');
      [unit, edu, sk].forEach(function (e) { e.style.zoom = ''; });
      if (sk.getBoundingClientRect().top - edu.getBoundingClientRect().top > 10) {
        es.classList.add('split');
        fitZoom(edu, V - PAD);
        fitZoom(sk, V - PAD);
      } else {
        fitZoom(unit, V - PAD);
      }
    }
    var contact = document.querySelector('#contact .fit-unit');
    if (contact) fitZoom(contact, V - PAD);
  }

  var lastW = 0, lastV = 0, t;
  function maybe() {
    var w = window.innerWidth, v = viewport();
    if (w === lastW && Math.abs(v - lastV) < 2) return;  // ignore mobile toolbar jitter
    lastW = w; lastV = v;
    layout();
  }
  maybe();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { lastW = 0; maybe(); });
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(maybe, 120); });
  window.addEventListener('fit:relayout', function () { lastW = 0; maybe(); });
})();
