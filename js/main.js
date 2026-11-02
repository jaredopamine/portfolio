/* Shared page behaviour: reveals, highlighter sweeps, count-ups, meters,
   stage tabs, lightbox, and the case-study rail (a checklist of collected cards). */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* reveal on scroll */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* highlighter sweep on key phrases */
  var hio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); hio.unobserve(e.target); } });
  }, { threshold: 0.9 });
  $$('.hl').forEach(function (el) { if (!el.closest('.hero')) hio.observe(el); });

  /* count-up numbers */
  function fmt(n, d) { return d ? n.toFixed(d) : Math.round(n).toLocaleString('en-US'); }
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
      if (reduce) { el.textContent = fmt(to, dec) + suf; return; }
      var t0 = performance.now(), dur = 1300;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(to * eased, dec) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(function (el) {
    var to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    el.setAttribute('aria-label', fmt(to, dec) + suf);
    el.textContent = fmt(0, dec) + suf;
    cio.observe(el);
  });

  /* meters fill when visible */
  var bio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); bio.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('.bar').forEach(function (b) { bio.observe(b); });

  /* doodles only move while their stat row is on screen */
  var sio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
  });
  $$('.stats').forEach(function (s) { s.classList.add('is-off'); sio.observe(s); });

  /* stage tabs */
  $$('[data-tabs]').forEach(function (root) {
    var pre = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { $$('img[loading="lazy"]', root).forEach(function (i) { i.loading = 'eager'; }); pre.disconnect(); }
    }, { rootMargin: '800px 0px' });
    pre.observe(root);
    var tabs = $$('[role="tab"]', root), panels = $$('[role="tabpanel"]', root);
    var reduceM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var auto = root.hasAttribute('data-auto') && !reduceM, cur = 0, inView = false, paused = false, timer = 0, raf = 0, DWELL = 6500;

    function haltTimers() { clearTimeout(timer); cancelAnimationFrame(raf); }
    function stopAuto() { auto = false; haltTimers(); root.classList.remove('is-auto'); }
    function scrollPanel(panel) {
      var sf = panel.querySelector('.scrollframe'), img = sf && sf.querySelector('img');
      if (!sf) return;
      sf.scrollTop = 0;
      function go() {
        var max = sf.scrollHeight - sf.clientHeight;
        if (max <= 0 || !auto) return;
        var t0 = performance.now(), span = DWELL - 1400;
        (function step(now) {
          var p = Math.max(0, Math.min(1, (now - t0 - 500) / span));
          sf.scrollTop = max * (p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
          if (p < 1 && auto && !paused) raf = requestAnimationFrame(step);
        })(t0);
      }
      if (img && !img.complete) img.addEventListener('load', go, { once: true }); else go();
    }
    function play() {
      haltTimers();
      if (!auto || paused || !inView) return;
      root.style.setProperty('--dwell', DWELL + 'ms');
      var t = tabs[cur]; t.setAttribute('data-run', '0'); void t.offsetWidth; t.setAttribute('data-run', '1');
      scrollPanel(panels[cur]);
      timer = setTimeout(function () { select((cur + 1) % tabs.length); }, DWELL);
    }
    function select(i, focus) {
      cur = i;
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
      panels.forEach(function (p, j) { p.classList.toggle('on', j === i); p.hidden = j !== i; });
      if (focus) tabs[i].focus();
      if (auto) play();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stopAuto(); select(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); select((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); select((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
    select(0);
    if (auto) {
      root.classList.add('is-auto');
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) play(); else haltTimers(); }, { threshold: 0.45 }).observe(root);
      root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch' || !auto) return; paused = true; haltTimers(); var t = tabs[cur]; t.setAttribute('data-run', '0'); });
      root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch' || !auto) return; paused = false; play(); });
      root.addEventListener('pointerdown', function () { stopAuto(); });
      root.addEventListener('wheel', function () { stopAuto(); }, { passive: true });
    }
  });

  /* drag-to-compare sliders */
  $$('[data-ba]').forEach(function (ba) {
    var range = $('.ba-range', ba), touched = false;
    function set(v) { ba.style.setProperty('--p', v + '%'); }
    range.addEventListener('input', function () { touched = true; set(range.value); });
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    new IntersectionObserver(function (es, io) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      var t0 = performance.now(), D = 2600;
      (function step(now) {
        if (touched) return;
        var p = Math.min(1, (now - t0) / D), v = 50 + Math.sin(p * Math.PI * 2) * 28 * (1 - p * .3);
        set(v.toFixed(1)); range.value = v;
        if (p < 1) requestAnimationFrame(step); else { set(50); range.value = 50; }
      })(t0);
    }, { threshold: 0.6 }).observe(ba);
  });

  /* clips from the live site: play while on screen, stay still for reduced motion */
  $$('video[data-loop]').forEach(function (v) {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause(); });
    }, { threshold: 0.25 }).observe(v);
  });

  /* reading progress: a thin foil line under the navbar on case studies */
  if ($('.layout')) {
    var bar = document.createElement('div'); bar.className = 'read-progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    var tick = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)).toFixed(4) : 0);
    };
    tick(); window.addEventListener('scroll', tick, { passive: true }); window.addEventListener('resize', tick);
  }

  /* thought bubbles: stop the hand-drawn "boil" for reduced motion */
  if (reduce) $$('.personas animate').forEach(function (a) { a.parentNode.removeChild(a); });

  /* lightbox */
  var lb = $('dialog.lb');
  if (lb) {
    var lbImg = $('img', lb), lbCap = $('p', lb);
    $$('.zoomable').forEach(function (img) {
      img.addEventListener('click', function () {
        lbImg.src = img.dataset.full || img.currentSrc || img.src;
        lbImg.alt = img.alt;
        var fc = img.closest('figure') && img.closest('figure').querySelector('figcaption');
        lbCap.textContent = fc ? fc.textContent : img.alt;
        lb.showModal();
      });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lb-x') || e.target.classList.contains('lb-in')) lb.close(); });
  }

  /* case-study rail: each card-section you pass is "collected" */
  var links = $$('.rail-list .rail-link');
  var count = $('.rail-count');
  var toast = $('.toast'), unlocked = false;
  if (links.length) {
    var secs = links.map(function (l) { return $(l.getAttribute('href')); });
    var total = secs.filter(function (s) { return s && s.hasAttribute('data-card'); }).length;
    var update = function () {
      var mid = window.innerHeight * 0.4, active = -1, got = 0;
      secs.forEach(function (s, i) {
        if (!s) return;
        var passed = s.getBoundingClientRect().top < mid;
        if (passed) active = i;
        var isCard = s.hasAttribute('data-card');
        links[i].classList.toggle('got', passed && isCard && i !== active);
        if (passed && isCard) got++;
      });
      links.forEach(function (l, i) { l.classList.toggle('active', i === active); });
      if (count) $('b', count).textContent = got;
      document.body.classList.toggle('at-bottom', window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4);
      if (got === total && total && !unlocked) {
        unlocked = true;
        if (toast) { toast.classList.add('show'); setTimeout(function () { toast.classList.remove('show'); }, 3600); }
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }
})();
