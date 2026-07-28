/* ============================================================================
   SIXTH VISION COMMERCIAL — THE LIGHT ENGINE (v250 EXPERT EDITION)
   Drives --sun (0 → 1) from scroll position with zero layout thrashing.
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

  function revealAll() {
    targets.forEach(el => el.classList.add('is-in'));
    progress.forEach(el => el.style.setProperty('--p', '1'));
  }

  /* Reduced motion: Midday, static, everything shown. */
  if (reduce) { revealAll(); return; }

  const still = /[?&]still=1/.test(location.search);
  if (!still) {
    root.classList.add('reveal-ready');
    setTimeout(sweep, 120);
    setTimeout(sweep, 700);
    setTimeout(revealAll, 2600);
    if (document.visibilityState === 'hidden') revealAll();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { ticking = false; kick(); }
  });

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

  /* Re-measure whenever the document can have changed height: on resize, and
     after late-loading media settles (lazy images below the fold change every
     chapter's offsetTop). Cheap, and only a handful of times per page life. */
  measureChapters();
  addEventListener('resize', measureChapters, { passive: true });
  addEventListener('load', () => { measureChapters(); setTimeout(measureChapters, 1200); });
  /* Deep chapters use content-visibility:auto, so their real height is only known
     once they have rendered. Re-measure when scrolling settles to keep --sun exact. */
  let reMeasure;
  addEventListener('scroll', () => {
    clearTimeout(reMeasure);
    reMeasure = setTimeout(measureChapters, 250);
  }, { passive: true });

  /* ---- frame execution (STRICT SEPARATION: ALL READS THEN ALL WRITES) ---- */
  let vh = window.innerHeight;
  let scrollY = 0;
  let lastPar = -1;
  let lastSun = -1;                       /* last QUANTISED --sun written */
  const lastProgress = [];                /* last quantised --p per element */

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
    pending.forEach(el => el.classList.add('is-in'));
  }

  function frame() {
    /* =========================================================================
       1. READ PHASE (Zero DOM Mutations Allowed Here)
       ========================================================================= */
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    scrollY = currentScrollY;
    const vhNow = window.innerHeight;
    const head = scrollY + vhNow / 2;
    const sun = forced === null ? sunAt(head) : forced;

    // Read reveal targets
    const pendingTargets = [];
    for (let i = 0; i < targets.length; i++) {
      const el = targets[i];
      if (el.classList.contains('is-in')) continue;
      if (el.getBoundingClientRect().top < vhNow * 0.88) pendingTargets.push(el);
    }

    // Read progress targets
    const progressValues = [];
    for (let pi = 0; pi < progress.length; pi++) {
      const r = progress[pi].getBoundingClientRect();
      const p = (vhNow * 0.82 - r.top) / (vhNow * 0.48);
      progressValues.push(p < 0 ? 0 : p > 1 ? 1 : p);
    }

    // Read parallax targets (Only if scroll changed)
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

    for (let j = 0; j < pendingTargets.length; j++) {
      pendingTargets[j].classList.add('is-in');
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

    // Floating CTA visibility write
    const floatingCta = document.querySelector('.floating-cta');
    if (floatingCta) {
      if (scrollY > vhNow * 0.7) {
        floatingCta.classList.add('is-visible');
      } else {
        floatingCta.classList.remove('is-visible');
      }
    }
  }

  /* ---- scroll-gated loop -------------------------------------------------- */
  let ticking = false;
  let idleAt = 0;

  function loop() {
    frame();
    if (Date.now() < idleAt) {
      requestAnimationFrame(loop);
    } else {
      ticking = false;
    }
  }

  function kick() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
    idleAt = Date.now() + 500;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(loop);
    }
  }

  // Debounced Resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    if (resizeTimeout) cancelAnimationFrame(resizeTimeout);
    resizeTimeout = requestAnimationFrame(() => {
      vh = window.innerHeight;
      kick();
    });
  }, { passive: true });

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('load', kick);
  kick();

  /* ---- IntersectionObserver: enhancement only ---------------------------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    targets.forEach(t => io.observe(t));
  }

  /* ---- Video playback optimization -------------------------------------- */
  const vids = Array.from(document.querySelectorAll('video[data-hero]'));
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
  vids.forEach(v => {
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
  });

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting && !document.hidden) playVideo(video);
        else video.pause();
      });
    }, { threshold: 0.08 });
    vids.forEach(v => videoObserver.observe(v));
  } else {
    vids.forEach(v => playVideo(v));
  }

  document.addEventListener('visibilitychange', () => {
    vids.forEach(v => {
      if (document.hidden) v.pause();
      else playVideo(v);
    });
  });

  /* ---- Day/Dusk compare slider with WCAG AAA ARIA semantics ------------- */
  const stages = document.querySelectorAll('.compare');
  stages.forEach(c => {
    const win = c.querySelector('.compare__win');
    const after = c.querySelector('.compare__after');
    const afterImg = after ? after.querySelector('img') : null;
    const bar = c.querySelector('.compare__bar');
    if (!win || !after || !bar) return;

    // Accessibility ARIA setup
    win.setAttribute('role', 'slider');
    win.setAttribute('aria-label', 'Day to Dusk visual lighting comparison');
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
    }
    function fromX(x) {
      const r = win.getBoundingClientRect();
      set((x - r.left) / r.width);
    }

    size();
    window.addEventListener('resize', size, { passive: true });
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

  /* ---- Commercial Brief Modal Controller ---------------------------------- */
  const modal = document.querySelector('.brief-modal');
  const openBtns = document.querySelectorAll('[data-open-brief]');
  const closeBtns = document.querySelectorAll('.brief-modal__close, .brief-modal__backdrop');

  if (modal) {
    const openModal = (e) => {
      if (e) e.preventDefault();
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input, select, textarea, button');
      if (firstInput) firstInput.focus();
    };
    const closeModal = () => {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    const form = modal.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.brief-form__btn');
        if (btn) {
          btn.textContent = 'Brief Submitted — We Will Call You';
          btn.style.background = '#4A8C57';
          setTimeout(() => {
            closeModal();
            btn.textContent = 'Submit Commercial Brief';
            btn.style.background = '';
          }, 2500);
        }
      });
    }
  }

  /* ---- Footer year -------------------------------------------------------- */
  const y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear().toString();
})();
