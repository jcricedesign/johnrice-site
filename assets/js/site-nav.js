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

  /* ── Display attract mode ──────────────────────────────
     Opt-in only: add ?display=1 to the URL.
     After 60 seconds without input the site begins a slow,
     self-running tour. Activity immediately hands control back.
     The tour scrolls continuously and rotates pages, keeping the
     large display from sitting on the same pixels indefinitely.
     ------------------------------------------------------------ */
  var params = new URLSearchParams(window.location.search);
  if (params.get('display') === '1') {
    var IDLE_MS = 60000;
    var START_DWELL_MS = 5000;
    var BOTTOM_DWELL_MS = 6000;
    var SCROLL_PX_PER_SECOND = 18;
    var ACTIVE_KEY = 'johnrice-attract-active';
    var pages = [
      'index.html',
      'work.html',
      'case-study.html',
      'about.html',
      'drafts.html'
    ];

    var idleTimer = null;
    var dwellTimer = null;
    var frameId = null;
    var attractActive = false;
    var lastFrame = 0;
    var nav = document.querySelector('.site-nav');

    function currentPageName() {
      var path = window.location.pathname;
      var name = path.substring(path.lastIndexOf('/') + 1);
      return name || 'index.html';
    }

    function displayUrl(page) {
      return page + '?display=1';
    }

    function hidePersistentChrome() {
      if (!nav) return;
      nav.style.transition = 'opacity 800ms ease';
      nav.style.opacity = '0';
      nav.style.pointerEvents = 'none';
    }

    function restorePersistentChrome() {
      if (!nav) return;
      nav.style.opacity = '';
      nav.style.pointerEvents = '';
    }

    function clearMotion() {
      if (frameId) cancelAnimationFrame(frameId);
      if (dwellTimer) clearTimeout(dwellTimer);
      frameId = null;
      dwellTimer = null;
      lastFrame = 0;
    }

    function nextPage() {
      var current = currentPageName();
      var index = pages.indexOf(current);
      var next = pages[(index >= 0 ? index + 1 : 0) % pages.length];
      sessionStorage.setItem(ACTIVE_KEY, '1');
      window.location.href = displayUrl(next);
    }

    function scrollFrame(timestamp) {
      if (!attractActive) return;
      if (!lastFrame) lastFrame = timestamp;
      var elapsed = Math.min((timestamp - lastFrame) / 1000, 0.1);
      lastFrame = timestamp;

      var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (window.scrollY >= maxScroll - 2) {
        frameId = null;
        dwellTimer = setTimeout(nextPage, BOTTOM_DWELL_MS);
        return;
      }

      window.scrollBy(0, SCROLL_PX_PER_SECOND * elapsed);
      frameId = requestAnimationFrame(scrollFrame);
    }

    function beginMotion() {
      if (!attractActive) return;
      lastFrame = 0;
      frameId = requestAnimationFrame(scrollFrame);
    }

    function startAttractMode() {
      if (attractActive) return;
      attractActive = true;
      sessionStorage.setItem(ACTIVE_KEY, '1');
      document.body.style.cursor = 'none';
      hidePersistentChrome();
      dwellTimer = setTimeout(beginMotion, START_DWELL_MS);
    }

    function stopAttractMode() {
      clearMotion();
      attractActive = false;
      sessionStorage.removeItem(ACTIVE_KEY);
      document.body.style.cursor = '';
      restorePersistentChrome();
    }

    function armIdleTimer() {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(startAttractMode, IDLE_MS);
    }

    function onUserActivity() {
      if (attractActive) stopAttractMode();
      armIdleTimer();
    }

    ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'].forEach(function (eventName) {
      window.addEventListener(eventName, onUserActivity, { passive: true });
    });

    // When attract mode moves to another page, continue the tour quickly
    // instead of waiting through a fresh 60-second idle period.
    if (sessionStorage.getItem(ACTIVE_KEY) === '1') {
      attractActive = true;
      document.body.style.cursor = 'none';
      hidePersistentChrome();
      window.scrollTo(0, 0);
      dwellTimer = setTimeout(beginMotion, START_DWELL_MS);
    } else {
      armIdleTimer();
    }
  }
})();
