/* ============================================================
   johnrice.com — shared navigation behaviour
   Mobile drawer + desktop "More" overflow menu.
   Loaded by every Basalt page. Keep this the only copy.
   ============================================================ */
(function () {
  'use strict';

  /* ── Mobile drawer ──────────────────────────────────── */
  var toggle = document.getElementById('nav-toggle');
  var drawer = document.getElementById('nav-drawer');

  function closeDrawer() {
    if (!drawer || !toggle) return;
    drawer.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close the drawer if the viewport grows past the mobile breakpoint
    // (otherwise body scroll stays locked on rotate/resize).
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && drawer.classList.contains('open')) closeDrawer();
    });
  }

  /* ── Desktop "More" overflow menu ───────────────────── */
  var moreBtn = document.getElementById('more-btn');
  var morePanel = document.getElementById('more-panel');

  function closeMore() {
    if (!moreBtn || !morePanel) return;
    morePanel.classList.remove('open');
    moreBtn.setAttribute('aria-expanded', 'false');
  }

  if (moreBtn && morePanel) {
    moreBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = morePanel.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', String(open));
    });

    // Click anywhere outside closes it.
    document.addEventListener('click', function (e) {
      if (!morePanel.contains(e.target) && e.target !== moreBtn) closeMore();
    });

    // Leaving the menu by keyboard closes it.
    morePanel.addEventListener('focusout', function (e) {
      if (!morePanel.contains(e.relatedTarget) && e.relatedTarget !== moreBtn) closeMore();
    });
  }

  /* ── Escape closes whatever is open ─────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (morePanel && morePanel.classList.contains('open')) {
      closeMore();
      if (moreBtn) moreBtn.focus();
    }
    if (drawer && drawer.classList.contains('open')) {
      closeDrawer();
      if (toggle) toggle.focus();
    }
  });
})();
