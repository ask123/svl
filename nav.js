/* Shared mobile navigation — adds a hamburger toggle and a dropdown menu so
   every page is reachable on phones. No-ops on desktop (CSS hides the toggle). */
(function () {
  document.querySelectorAll('.nav').forEach(function (nav) {
    var wrap = nav.querySelector('.wrap');
    var links = nav.querySelector('.nav-links');
    if (!wrap || !links) return;

    // put the page's CTA button inside the dropdown too (it's hidden in the bar on mobile)
    var cta = wrap.querySelector(':scope > .nav-cta');
    if (cta) {
      var clone = cta.cloneNode(true);
      clone.classList.add('in-menu');
      links.appendChild(clone);
    }

    var btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '☰';
    wrap.appendChild(btn);

    function close() { links.classList.remove('open'); btn.innerHTML = '☰'; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.innerHTML = open ? '✕' : '☰';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  });
})();
