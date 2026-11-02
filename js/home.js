/* Home: the hero's floating colour follows the pointer a little, and work
   cards play a hover preview. (Reveals and count-ups live in main.js.) */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches;

  var hero = document.getElementById('hero');
  if (hero && !reduce && !touch) {
    var orbs = $$('.orb', hero), raf = 0, tx = 0, ty = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        orbs.forEach(function (o, i) { o.style.translate = (tx * (i ? -36 : 28)) + 'px ' + (ty * (i ? -24 : 20)) + 'px'; });
      });
    });
  }

  if (!reduce) {
    $$('.work-card').forEach(function (card) {
      var cover = card.querySelector('[data-preview]');
      var img = cover && cover.querySelector('.win-view img');
      var vid = cover && cover.querySelector('.win-view video');
      if (!cover || (!img && !vid)) return;
      var hovered = false, focused = false, timer = 0;
      function update() {
        clearTimeout(timer);
        if (hovered || focused) { cover.classList.add('is-playing'); if (vid) { try { vid.currentTime = 0; vid.play(); } catch (e) {} } }
        else {
          cover.classList.remove('is-playing');
          timer = setTimeout(function () { if (img) { img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; } if (vid) { vid.pause(); try { vid.currentTime = 0; } catch (e) {} } }, 700);
        }
      }
      card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; hovered = true; update(); });
      card.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch') return; hovered = false; update(); });
      card.addEventListener('focus', function () { focused = card.matches(':focus-visible'); update(); });
      card.addEventListener('blur', function () { focused = false; update(); });
    });
  }
})();
