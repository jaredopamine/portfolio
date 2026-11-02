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
