/* Phone menu: the toggle opens the links as a panel under the navbar. */
(function () {
  'use strict';
  var bar = document.querySelector('.navbar');
  var btn = bar && bar.querySelector('.nav-toggle');
  if (!btn) return;
  function set(open) {
    bar.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { set(!bar.classList.contains('is-open')); });
  bar.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 720) set(false); });
})();
