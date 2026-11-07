/* About: the collector card leans toward the cursor and catches the light. */
(function () {
  'use strict';
  var card = document.getElementById('tcard');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!card || reduce || touch) return;
  card.addEventListener('pointermove', function (e) {
    var r = card.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.classList.add('is-live');
    card.style.setProperty('--ry', ((x - 0.5) * 18).toFixed(2) + 'deg');
    card.style.setProperty('--rx', (-(y - 0.5) * 14).toFixed(2) + 'deg');
    card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
  });
  card.addEventListener('pointerleave', function () {
    card.classList.remove('is-live');
    card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg');
  });
})();

/* About: scrolling media rows, and one viewer for photos and YouTube. The clicked media grows out of its spot;
   a YouTube video starts playing once it has finished growing. Nothing from YouTube loads until a video is clicked. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Media rows: they drift sideways in an endless loop, and you can hold and drag (or swipe) to move them yourself. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-car]'), function (car) {
    var tr = car.querySelector('.x-car-track');
    var kids = Array.prototype.slice.call(tr.children);
    var gap = 28, W = 0, loop = false, x = 0, vel = 0, fling = 0, vis = false, hover = false, drag = null, hold = 0, last = 0, suppress = false;
    var SPEED = 0.034;   /* px per ms, about 34 px a second */
    function wrap(v) { return W ? ((v % W) + W) % W : 0; }
    function measure() {
      gap = parseFloat(getComputedStyle(tr).columnGap) || 28;
      var clones = tr.querySelectorAll('[data-clone]'); Array.prototype.forEach.call(clones, function (c) { c.remove(); });
      W = 0; kids.forEach(function (k) { W += k.getBoundingClientRect().width + gap; });
      loop = W > car.clientWidth + 40;
      car.classList.toggle('is-static', !loop);
      if (loop) {
        kids.forEach(function (k) { var c = k.cloneNode(true); c.setAttribute('data-clone', ''); c.setAttribute('aria-hidden', 'true'); tr.appendChild(c); });
        x = wrap(x);
      } else { x = 0; }
      render();
    }
    function render() { tr.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)'; }
    window.addEventListener('resize', measure); window.addEventListener('load', measure); setTimeout(measure, 400); measure();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: 0.1 }).observe(car); else vis = true;
    car.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') hover = true; });
    car.addEventListener('pointerleave', function () { hover = false; });
    car.addEventListener('pointerdown', function (e) {
      if (!loop || (e.pointerType === 'mouse' && e.button !== 0)) return;
      drag = { id: e.pointerId, sx: e.clientX, sp: x, lx: e.clientX, lt: performance.now(), v: 0, moved: false }; fling = 0;
    });
    car.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.sx;
      if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; car.classList.add('is-drag'); try { car.setPointerCapture(e.pointerId); } catch (_) {} }
      if (!drag.moved) return;
      x = wrap(drag.sp - dx); render();
      var now = performance.now(); drag.v = 0.75 * drag.v + 0.25 * ((drag.lx - e.clientX) / Math.max(1, now - drag.lt)); drag.lx = e.clientX; drag.lt = now;
    });
    function release(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      if (drag.moved) { fling = Math.max(-2.2, Math.min(2.2, drag.v)); suppress = true; setTimeout(function () { suppress = false; }, 0); }
      hold = performance.now() + 1800; drag = null; car.classList.remove('is-drag');
    }
    car.addEventListener('pointerup', release); car.addEventListener('pointercancel', release);
    car.addEventListener('click', function (e) { if (suppress) { e.preventDefault(); e.stopPropagation(); } }, true);
    car.addEventListener('wheel', function (e) {
      if (!loop || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); x = wrap(x + e.deltaX); hold = performance.now() + 1800; render();
    }, { passive: false });
    function tick(t) {
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (loop) {
        var go = vis && !drag && t > hold && !reduce && !open;
        vel += ((go ? SPEED : 0) - vel) * Math.min(1, dt / 320);          /* ease in and out */
        fling *= Math.pow(0.94, dt / 16);
        if (Math.abs(fling) < 0.003) fling = 0;
        if (!drag && (vel > 0.0005 || fling)) { x = wrap(x + (vel + fling) * dt); render(); }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  var open = null, EASE = 'cubic-bezier(.2,.8,.2,1)';
  function fit(ar) {
    var vw = window.innerWidth, vh = window.innerHeight, k = Math.min((vw * .92) / ar, (vh * .78));
    var w = Math.round(k * ar), h = Math.round(k);
    return { left: Math.round((vw - w) / 2), top: Math.round((vh - h) / 2 - 20), width: w, height: h };
  }
  function place(box, r) { box.style.left = r.left + 'px'; box.style.top = r.top + 'px'; box.style.width = r.width + 'px'; box.style.height = r.height + 'px'; }

  function show(srcEl, kind) {
    if (open) return;
    var fig = srcEl.closest('figure'), frame = srcEl.closest('.x-mf') || srcEl;
    var from = frame.getBoundingClientRect();
    var ar = kind === 'yt' ? 16 / 9 : ((srcEl.naturalWidth || 4) / (srcEl.naturalHeight || 3));
    var to = fit(ar);
    var capEl = fig && fig.querySelector('figcaption');
    var ov = document.createElement('div'); ov.className = 'x-lb'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="x-lb-bg"></div><div class="x-lb-img"></div><div class="x-lb-cap"></div><button class="x-lb-x" type="button">Close ✕</button>';
    var box = ov.querySelector('.x-lb-img'), cap = ov.querySelector('.x-lb-cap');
    cap.textContent = capEl ? capEl.textContent : '';
    cap.style.top = (to.top + to.height + 16) + 'px';
    var thumb = kind === 'yt' ? srcEl.querySelector('img') : srcEl;
    if (thumb) { var im = document.createElement('img'); im.src = thumb.currentSrc || thumb.src; im.alt = ''; box.appendChild(im); }
    place(box, from);
    box.style.borderRadius = '12px';
    document.body.appendChild(ov); document.documentElement.style.overflow = 'hidden';
    frame.style.visibility = 'hidden';
    open = { ov: ov, box: box, frame: frame, to: to, kind: kind, ar: ar };
    syncAllFeats();
    void box.offsetWidth;
    requestAnimationFrame(function () { ov.classList.add('on'); place(box, to); box.style.borderRadius = '6px'; });
    if (kind === 'yt') {
      var id = srcEl.getAttribute('data-yt');
      var start = function () {
        if (!open || open.ov !== ov || box.querySelector('iframe')) return;
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
        f.title = cap.textContent || 'Video'; f.referrerPolicy = 'strict-origin-when-cross-origin'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
        box.appendChild(f);
      };
      setTimeout(start, reduce ? 0 : 520);
    }
    ov.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('iframe')) return; close(); });
  }

  function close() {
    if (!open) return;
    var o = open; open = null;
    var f = o.box.querySelector('iframe'); if (f) f.remove();
    o.ov.classList.remove('on');
    place(o.box, o.frame.getBoundingClientRect()); o.box.style.borderRadius = '12px';
    var done = function () { syncAllFeats(); o.frame.style.visibility = ''; if (o.ov.parentNode) o.ov.parentNode.removeChild(o.ov); document.documentElement.style.overflow = ''; };
    if (reduce) done(); else setTimeout(done, 520);
  }

  /* The big YouTube video beside each row plays on its own (muted) while it is on screen. */
  var feats = [];
  Array.prototype.forEach.call(document.querySelectorAll('a[data-autoplay]'), function (a) {
    var st = { a: a, id: a.getAttribute('data-yt'), vis: false, ifr: null };
    feats.push(st);
    if (!('IntersectionObserver' in window) || reduce) return;
    new IntersectionObserver(function (es) { st.vis = es[0].isIntersecting; syncFeat(st); }, { threshold: 0.5 }).observe(a.closest('.x-mf'));
  });
  /* The player stays in place once it has started. Leaving the screen (or opening the overlay) only pauses it,
     and coming back resumes from the same spot. */
  function ytCmd(st, fn) {
    try { st.ifr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: fn, args: '' }), '*'); } catch (_) {}
  }
  function applyFeat(st) {
    if (!st.ifr || !st.ready) return;
    ytCmd(st, st.want ? 'playVideo' : 'pauseVideo');
  }
  function syncFeat(st) {
    st.want = st.vis && !open;
    if (st.want && !st.ifr) {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(st.id) + '?autoplay=1&mute=1&loop=1&playlist=' + encodeURIComponent(st.id) + '&playsinline=1&rel=0&modestbranding=1&enablejsapi=1';
      f.title = 'Video'; f.className = 'x-vframe'; f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
      f.addEventListener('load', function () {
        try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: st.id }), '*'); } catch (_) {}
        setTimeout(function () { st.ready = true; applyFeat(st); }, 900);
      });
      st.a.hidden = true; st.a.parentNode.insertBefore(f, st.a.nextSibling); st.ifr = f; st.ready = false;
    } else if (st.ifr) { applyFeat(st); }
  }
  function syncAllFeats() { feats.forEach(syncFeat); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.x-hit, .x-expand') : null;
    if (!b) return;
    e.preventDefault(); var a = b.parentNode.querySelector('a[data-yt]'); if (a) show(a, 'yt');
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null; if (!t) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    var yt = t.closest('a[data-yt]');
    if (yt) { e.preventDefault(); show(yt, 'yt'); return; }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', function () { if (open) { open.to = fit(open.ar); place(open.box, open.to); } });
})();
