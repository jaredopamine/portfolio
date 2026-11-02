/* One place for your links. Fill in these three and every nav, footer and
   button on the site updates. Anything left empty is simply hidden, so the
   site never shows a dead link. */
window.SITE = {
  linkedin: 'https://www.linkedin.com/in/jared-martinez-3a5713253/',   // e.g. 'https://www.linkedin.com/in/your-handle'
  email: 'jarmartinez@ucdavis.edu',      // e.g. 'you@example.com'
  resume: 'https://drive.google.com/file/d/1wa8P1hRwTahAgFnaaaag-2UxDFwM6eRe/view?usp=sharing'      // e.g. 'assets/Jared-Martinez-Resume.pdf' (drop the PDF in /assets) or a Drive link
};
(function () {
  'use strict';
  var S = window.SITE;
  document.querySelectorAll('[data-site]').forEach(function (a) {
    var k = a.getAttribute('data-site'), v = (S[k] || '').trim();
    if (!v) { a.hidden = true; return; }
    if (k === 'email') { a.setAttribute('href', 'mailto:' + v); a.removeAttribute('target'); a.removeAttribute('rel'); }
    else {
      a.setAttribute('href', /^(https?:|\/|\.)/.test(v) || v.indexOf('/') > -1 ? (/^https?:/.test(v) ? v : (a.dataset.root || '') + v) : v);
    }
  });
})();
