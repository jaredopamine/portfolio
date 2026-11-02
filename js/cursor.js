/* Hover label. Keeps the normal system cursor; over anything tagged
   data-cursor="…" a small solid pill opens beside the pointer with that
   label. Mouse and pen only. */
(function () {
  'use strict';
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var pill = document.createElement('div');
  pill.className = 'custom-cursor__pill';
  pill.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pill);

  var current = null;

  function setLabel(text) {
    if (text === current) return;
    current = text;
    if (text) { pill.textContent = text; pill.classList.add('is-visible'); }
    else pill.classList.remove('is-visible');
  }

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var w = pill.offsetWidth || 120, h = pill.offsetHeight || 32;
    pill.style.left = (e.clientX + 18 + w > window.innerWidth - 8 ? Math.max(8, e.clientX - 18 - w) : e.clientX + 18) + 'px';
    pill.style.top = (e.clientY + 18 + h > window.innerHeight - 8 ? Math.max(8, e.clientY - 18 - h) : e.clientY + 18) + 'px';
    var t = e.target.closest ? e.target : e.target.parentElement;
    var tagged = t && t.closest('[data-cursor]');
    setLabel(tagged ? tagged.getAttribute('data-cursor') : null);
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { setLabel(null); });
  window.addEventListener('hashchange', function () { setLabel(null); });
})();
