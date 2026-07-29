/* ============================================================================
   SIXTH VISION COMMERCIAL — THE LIGHT ENGINE (v255)
   Drives --sun (0 → 1) from scroll position with zero layout thrashing.

   v255 AUDIT PASS — the changes, each documented at its site:
     1. preload is NEVER force-promoted at startup.        See §VIDEO
     2. The rAF loop no longer duplicates observer work.   See §FRAME
     3. .floating-cta hoisted; class write state-gated.    See §FRAME
     4. The brief form no longer reports failure as success. See §FORM
   ========================================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- debug override: ?sun=0..1 ---------------------------------------- */
  let forced = null;
  const m = /[?&]sun=([0-9.]+)/.exec(location.search);
  if (m) {
    forced = Math.max(0, Math.min(1, parseFloat(m[1])));
    root.style.setProperty('--sun', forced);
  }

  /* ---- collect the light ranges each chapter declares -------------------- */
  const chapters = Array.from(document.querySelectorAll('[data-sun-from]')).map(el => ({
    el,
    from: parseFloat(el.getAttribute('data-sun-from')),
    to: parseFloat(el.getAttribute('data-sun-to'))
  }));

  /* ---- reveal & animation targets ---------------------------------------- */
  const targets = Array.from(document.querySelectorAll('[data-rise],[data-line],[data-unmask]'));
  const parallax = Array.from(document.querySelectorAll('[data-parallax]'));
  const progress = Array.from(document.querySelectorAll('[data-progress]'));

  /* Hoisted out of frame(). v254 ran document.querySelector('.floating-cta')
     on EVERY animation frame — a DOM lookup 60x/second for a static element. */
  const floatingCta = document.querySelector('.floating-cta');
  let lastCtaVisible = null;              /* null = never written yet */

  /* ALL module state is declared HERE, above the prefers-reduced-motion guard
     below. That guard calls initInteractions() and then returns, so any `let`
     or `const` declared after it would still be in its temporal dead zone when
     the interaction layer (or a later visibilitychange -> kick -> frame) tried
     to touch it — a ReferenceError that would break the entire page for every
     visitor who has reduced motion enabled. */
  let ticking = false;
  let idleAt = 0;
  let scrollY = 0;
  let lastPar = -1;
  let lastSun = -1;                       /* last QUANTISED --sun written */
  const lastProgress = [];                /* last quantised --p per element */
  const compareSizers = [];

  function sizeCompares() { for (let i = 0; i < compareSizers.length; i++) compareSizers[i](); }

  function revealAll() {
    targets.forEach(el => el.classList.add('is-in'));
    progress.forEach(el => el.style.setProperty('--p', '1'));
  }

  /* Reduced motion: Midday, static, everything shown. Interaction code still
     has to run, so it lives in initInteractions() and is called on both paths.
     v254 returned early here and got away with it only because everything
     interactive happened to be registered above the guard. */
  if (reduce) {
    revealAll();
    initInteractions();
    return;
  }

  const still = /[?&]still=1/.test(location.search);
  if (!still) {
    root.classList.add('reveal-ready');
    setTimeout(sweep, 120);
    setTimeout(sweep, 700);
    setTimeout(revealAll, 2600);
    if (document.visibilityState === 'hidden') revealAll();
  }

  /* ---- the sun calculation -----------------------------------------------
     Chapter geometry is CACHED, not measured per frame. Reading offsetTop /
     offsetHeight forces a synchronous layout, and doing it for every chapter on
     every scroll frame cost ~1050 ms of forced reflow in Lighthouse — the single
     biggest contributor to Total Blocking Time. Positions only change when the
     document reflows, so we measure on load/resize and read plain numbers after.
     measureChapters() is the ONLY place these properties are touched. */
  function measureChapters() {
    for (let i = 0; i < chapters.length; i++) {
      chapters[i].top = chapters[i].el.offsetTop;
      chapters[i].h = chapters[i].el.offsetHeight || 1;
    }
  }

  function sunAt(head) {
    if (!chapters.length) return 0.5;
    const first = chapters[0];
    const last = chapters[chapters.length - 1];
    for (let i = 0; i < chapters.length; i++) {
      const c = chapters[i];
      const top = c.top, h = c.h || 1;      /* cached — no layout read */
      if (head < top) return i === 0 ? first.from : chapters[i - 1].to;
      if (head < top + h) {
        const t = (head - top) / h;
        return c.from + (c.to - c.from) * (t < 0 ? 0 : t > 1 ? 1 : t);
      }
    }
    return last.to;
  }

  /* Re-measure whenever the document can have changed height: after late media
     settles (lazy images below the fold move every chapter's offsetTop), and
     when scrolling stops — deep chapters use content-visibility:auto, so their
     real height is only known once they have rendered. Resize is handled by the
     single consolidated resize listener further down. */
  measureChapters();
  addEventListener('load', () => { measureChapters(); setTimeout(measureChapters, 1200); });

  let reMeasure;
  addEventListener('scroll', () => {
    clearTimeout(reMeasure);
    reMeasure = setTimeout(measureChapters, 250);
  }, { passive: true });

  /* ---- frame execution (STRICT SEPARATION: ALL READS THEN ALL WRITES) ---- */

  /* sweep() is the on-load catch-up for anything already inside the viewport
     before the IntersectionObserver first fires. It runs three times total
     (120ms, 700ms, and via revealAll at 2600ms) — it is NOT in the scroll loop. */
  function sweep() {
    /* READ */
    const vhNow = window.innerHeight;
    const pending = [];
    for (let i = 0; i < targets.length; i++) {
      const el = targets[i];
      if (el.classList.contains('is-in')) continue;
      if (el.getBoundingClientRect().top < vhNow * 0.88) pending.push(el);
    }
    /* WRITE */
    for (let i = 0; i < pending.length; i++) pending[i].classList.add('is-in');
  }

  function frame() {
    /* =========================================================================
       §FRAME — 1. READ PHASE (Zero DOM Mutations Allowed Here)

       v255: the reveal-target loop that used to live here has been REMOVED. It
       called getBoundingClientRect() on every un-revealed [data-rise],
       [data-line] and [data-unmask] — 99 elements on this page — on top of 17
       parallax nodes: up to 116 forced layout reads per frame. The
       IntersectionObserver at the bottom of this file already computes exactly
       those intersections, off the main thread, at no main-thread cost. Paying
       twice for the same information was pure waste. Reveals are now owned
       solely by the observer, with sweep() as the on-load catch-up and
       revealAll() as the 2600ms safety net.
       ========================================================================= */
    scrollY = window.pageYOffset || root.scrollTop;
    const vhNow = window.innerHeight;
    const head = scrollY + vhNow / 2;
    const sun = forced === null ? sunAt(head) : forced;

    /* Read progress targets */
    const progressValues = [];
    for (let pi = 0; pi < progress.length; pi++) {
      const r = progress[pi].getBoundingClientRect();
      const p = (vhNow * 0.82 - r.top) / (vhNow * 0.48);
      progressValues.push(p < 0 ? 0 : p > 1 ? 1 : p);
    }

    /* Read parallax targets (only if scroll changed) */
    const parallaxOffsets = [];
    const shouldUpdateParallax = parallax.length && lastPar !== scrollY;
    if (shouldUpdateParallax) {
      const limit = Math.min(56, vhNow * 0.07);
      for (let k = 0; k < parallax.length; k++) {
        const el2 = parallax[k];
        if (el2.tagName && el2.tagName.toLowerCase() === 'video') {
          parallaxOffsets.push(null);
          continue;
        }
        const rate = parseFloat(el2.getAttribute('data-parallax')) || 0.08;
        const rect = el2.getBoundingClientRect();
        const o = (rect.top + rect.height / 2 - vhNow / 2) * -rate;
        parallaxOffsets.push(Math.max(-limit, Math.min(limit, o)));
      }
    }

    /* Floating CTA state: decided in the read phase, written below. */
    const wantCta = scrollY > vhNow * 0.7;

    /* =========================================================================
       2. WRITE PHASE (Zero Layout Reads Allowed Here)
       ========================================================================= */
    /* --sun is the most expensive property on the page to change: dozens of
       nested color-mix() chains across the whole document depend on it, so a
       single write invalidates style for the entire tree. Written raw at 4dp it
       changed on essentially every frame and Style & Layout dominated the main
       thread (5.4 s in Lighthouse). QUANTISE it: ~400 discrete steps across the
       whole journey, which is far finer than the eye can resolve on a gradient,
       and skip the write entirely when the step has not changed. Same logic for
       --p on each progress element. */
    if (forced === null) {
      const q = Math.round(sun * 400) / 400;
      if (q !== lastSun) { lastSun = q; root.style.setProperty('--sun', q.toFixed(4)); }
    }

    for (let pj = 0; pj < progress.length; pj++) {
      const qp = Math.round(progressValues[pj] * 200) / 200;
      if (qp !== lastProgress[pj]) {
        lastProgress[pj] = qp;
        progress[pj].style.setProperty('--p', qp.toFixed(3));
      }
    }

    if (shouldUpdateParallax) {
      for (let k2 = 0; k2 < parallax.length; k2++) {
        if (parallaxOffsets[k2] !== null) {
          parallax[k2].style.transform = `translate3d(0,${parallaxOffsets[k2].toFixed(2)}px,0)`;
        }
      }
      lastPar = scrollY;
    }

    /* v255: state-gated. v254 wrote classList on EVERY frame regardless of
       whether the state had changed — the same waste the --sun quantisation
       above exists to avoid, simply never extended down here. */
    if (floatingCta && wantCta !== lastCtaVisible) {
      lastCtaVisible = wantCta;
      floatingCta.classList.toggle('is-visible', wantCta);
    }
  }

  /* ---- scroll-gated loop -------------------------------------------------- */
  function loop() {
    frame();
    if (Date.now() < idleAt) {
      requestAnimationFrame(loop);
    } else {
      ticking = false;
    }
  }

  function kick() {
    scrollY = window.pageYOffset || root.scrollTop;
    idleAt = Date.now() + 500;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(loop);
    }
  }

  /* ONE resize handler. v254 registered three separate listeners on resize
     (measureChapters, the debounced kick, and one per compare slider). */
  let resizeRaf;
  addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      measureChapters();
      sizeCompares();
      kick();
    });
  }, { passive: true });

  addEventListener('scroll', kick, { passive: true });
  addEventListener('load', kick);
  kick();

  /* ---- IntersectionObserver: now the SOLE owner of reveals ---------------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('is-in');
          io.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    targets.forEach(t => io.observe(t));
  } else {
    /* No IO support: the rAF loop no longer reveals, so sweep on scroll. Without
       this a browser lacking IntersectionObserver would show nothing until the
       2600ms revealAll() safety net fired. */
    addEventListener('scroll', sweep, { passive: true });
  }

  initInteractions();

  /* ========================================================================
     INTERACTION LAYER — video transfer policy, compare slider, brief form.
     In a function so the prefers-reduced-motion early return above still gets
     working video, sliders and a working form.
     ===================================================================== */
  function initInteractions() {

    /* ---- §VIDEO — playback AND, critically, TRANSFER policy ---------------
       THE MOST IMPORTANT FIX IN THIS FILE.

       v254 did this at startup:

           vids.forEach(v => { ...; v.preload = 'auto'; });

       That DOM property write supersedes the preload="metadata" attribute set
       in the HTML, on every [data-hero] video, immediately. Both videos began
       downloading in full on first paint — including the 2.7 MB loop that sits
       roughly twelve screens below the fold. The observer below controls
       PLAYBACK; it has never controlled TRANSFER, so it could not prevent this.

       Measured consequence: ~4.0 MB of non-lazy first-load payload, of which
       3.65 MB (91%) was video, contending with the 51 KB LCP poster and the
       fonts for the same connection. On the Lighthouse mobile profile
       (1.6 Mbps) that is ~20 s of transfer before any CPU work.

       v255: preload is left exactly as the HTML declares it ("metadata"), and
       promoted to "auto" only when a video is genuinely approaching the
       viewport. rootMargin gives the below-fold video a 300px runway so it is
       buffered before it is seen. The hero is already intersecting at load, so
       it promotes instantly and behaves visually exactly as it always did. */
    const vids = Array.from(document.querySelectorAll('video[data-hero]'));

    vids.forEach(v => {
      v.muted = true;         /* required for autoplay; harmless to assert */
      v.playsInline = true;   /* iOS: play in place rather than fullscreen  */
      /* v.preload is DELIBERATELY NOT SET HERE. Do not re-add it. */
    });

    function playVideo(video) {
      const go = () => {
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      };
      if (video.readyState >= 3) {
        go();
      } else if (!video.__waiting) {
        video.__waiting = true;
        video.addEventListener('canplaythrough', () => {
          video.__waiting = false;
          go();
        }, { once: true });
        setTimeout(() => { if (video.__waiting) { video.__waiting = false; go(); } }, 2500);
      }
    }

    function promote(video) {
      if (video.preload !== 'auto') {
        video.preload = 'auto';
        /* An explicit load() is required: changing preload after the element
           has already settled on "metadata" does not by itself restart
           buffering in every engine. */
        if (video.readyState < 3) video.load();
      }
    }

    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const video = entry.target;
          if (entry.isIntersecting && !document.hidden) {
            promote(video);          /* transfer — opted into, only now */
            playVideo(video);        /* playback */
          } else {
            video.pause();
          }
        }
      }, { threshold: 0.08, rootMargin: '0px 0px 300px 0px' });
      vids.forEach(v => videoObserver.observe(v));
    } else {
      vids.forEach(v => { promote(v); playVideo(v); });
    }

    /* Single consolidated visibilitychange handler. v254 registered two. */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        vids.forEach(v => v.pause());
      } else {
        ticking = false;
        kick();
        vids.forEach(v => { if (v.preload === 'auto') playVideo(v); });
      }
    });

    /* ---- Day/Dusk compare slider with WCAG AAA ARIA semantics ------------- */
    document.querySelectorAll('.compare').forEach(c => {
      const win = c.querySelector('.compare__win');
      const after = c.querySelector('.compare__after');
      const afterImg = after ? after.querySelector('img') : null;
      const bar = c.querySelector('.compare__bar');
      if (!win || !after || !bar) return;

      win.setAttribute('role', 'slider');
      win.setAttribute('aria-label', 'Day to dusk lighting comparison');
      win.setAttribute('aria-valuemin', '0');
      win.setAttribute('aria-valuemax', '100');
      win.setAttribute('tabindex', '0');

      function size() {
        if (afterImg) afterImg.style.width = `${win.getBoundingClientRect().width}px`;
      }
      function set(p) {
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        const pct = `${(p * 100).toFixed(2)}%`;
        after.style.width = pct;
        bar.style.left = pct;
        const valNow = Math.round(p * 100);
        win.setAttribute('aria-valuenow', valNow.toString());
        /* aria-valuetext: a bare number is meaningless read aloud. */
        win.setAttribute('aria-valuetext', `${valNow}% dusk`);
      }
      function fromX(x) {
        const r = win.getBoundingClientRect();
        set((x - r.left) / r.width);
      }

      compareSizers.push(size);
      size();
      if (afterImg && !afterImg.complete) {
        afterImg.addEventListener('load', size, { once: true });
      }

      let down = false;
      win.addEventListener('pointerdown', (e) => {
        down = true;
        try { win.setPointerCapture(e.pointerId); } catch (err) {}
        fromX(e.clientX);
        e.preventDefault();
      });
      win.addEventListener('pointermove', (e) => { if (down) fromX(e.clientX); });
      win.addEventListener('pointerup', () => { down = false; });
      win.addEventListener('pointercancel', () => { down = false; });

      win.addEventListener('keydown', (e) => {
        const cur = parseFloat(after.style.width) || 50;
        if (e.key === 'ArrowLeft') { set((cur - 4) / 100); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { set((cur + 4) / 100); e.preventDefault(); }
        else if (e.key === 'Home') { set(0); e.preventDefault(); }
        else if (e.key === 'End') { set(1); e.preventDefault(); }
      });

      set(0.5);
    });

    /* ---- §FORM — Commercial Brief modal + GA4 ---------------------------- */
    const modal = document.querySelector('.brief-modal');
    if (!modal) return;

    const openBtns = document.querySelectorAll('[data-open-brief]');
    const closeBtns = document.querySelectorAll('.brief-modal__close, .brief-modal__backdrop');
    let lastFocused = null;

    const openModal = (e) => {
      if (e) e.preventDefault();
      lastFocused = document.activeElement;
      modal.classList.add('is-open');
      modal.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea, button');
      if (firstInput) firstInput.focus();
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'open_brief_modal', { event_category: 'engagement' });
      }
    };
    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    openBtns.forEach(b => b.addEventListener('click', openModal));
    closeBtns.forEach(b => b.addEventListener('click', closeModal));
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    /* Focus trap — a modal that leaks focus to the page behind it fails
       WCAG 2.4.3 and strands keyboard and screen-reader users. */
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = Array.from(modal.querySelectorAll(
        'a[href],button:not([disabled]),input:not([type="hidden"]):not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
      )).filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });

    const form = modal.querySelector('form');
    if (!form) return;

    const status = modal.querySelector('.brief-form__status');
    const btn = form.querySelector('.brief-form__btn');
    const BTN_IDLE = 'Submit Commercial Brief \u2192';

    function say(msg) { if (status) status.textContent = msg; }
    function resetBtn() {
      if (!btn) return;
      btn.disabled = false;
      btn.textContent = BTN_IDLE;
      btn.style.background = '';
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (btn) { btn.disabled = true; btn.textContent = 'Sending brief\u2026'; }
      say('Sending your brief\u2026');

      /* v255: the GA4 generate_lead event has been MOVED OUT of this handler.
         Firing it here counted a conversion the instant the button was pressed
         — before the request resolved, and regardless of whether it ever
         reached an inbox. That inflates the conversion number and makes every
         decision taken from it unsound. It now fires only on confirmed success. */

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      })
        .then(res => res.json().catch(() => ({ success: false, message: 'Malformed response' })))
        .then(data => {
          /* v255: Web3Forms returns HTTP 200 with {"success": false} for an
             invalid, revoked or over-quota access key. v254 never inspected the
             body, so the UI reported success in precisely the scenario where
             every lead is being silently dropped. */
          if (!data || data.success !== true) {
            throw new Error((data && data.message) || 'Submission rejected');
          }

          if (btn) {
            btn.textContent = 'Brief received \u2014 we will call you';
            btn.style.background = '#4A8C57';
          }
          say('Brief received. We will call you back shortly.');

          if (typeof window.gtag === 'function') {
            window.gtag('event', 'generate_lead', {
              event_category: 'conversion',
              event_label: 'Commercial Media Brief',
              value: 1
            });
          }

          setTimeout(() => { closeModal(); form.reset(); resetBtn(); say(''); }, 2500);
        })
        .catch(() => {
          /* v255: a failure now LOOKS like a failure, and hands the visitor the
             phone number — which is the fallback conversion path. v254 printed
             the success message here, so a network drop or a dead access key
             lost the lead while telling the agent they would be called. */
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Could not send \u2014 call 0474 126 276';
            btn.style.background = '#8C4A4A';
          }
          say('That did not send. Please call 0474 126 276 or email sixthvision.mel@gmail.com and we will pick it up straight away.');
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'brief_submit_failed', { event_category: 'error' });
          }
        });
    });
  }

  /* ---- Footer year -------------------------------------------------------- */
  const y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear().toString();
})();
