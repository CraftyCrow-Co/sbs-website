/* ============================================================
   NAV — frosted on scroll
   ============================================================ */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  function tick() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ============================================================
   MOBILE HAMBURGER
   ============================================================ */
(function () {
  const btn  = document.querySelector('.nav-hamburger');
  const menu = document.querySelector('.nav-mobile');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ============================================================
   HOW IT WORKS — auto-advance with progress bars
   ============================================================ */
(function () {
  const tabs   = Array.from(document.querySelectorAll('.hiw-tab'));
  const panels = Array.from(document.querySelectorAll('.hiw-panel'));
  if (!tabs.length) return;

  const INTERVAL = 4000; // ms per step
  let current  = 0;
  let timer    = null;
  let paused   = false;

  function setFill(index, width, duration) {
    tabs.forEach((tab, i) => {
      const fill = tab.querySelector('.hiw-progress-fill');
      if (!fill) return;
      fill.style.transition = 'none';
      fill.style.width = '0%';
      if (i === index) {
        // Force reflow before re-applying transition
        fill.getBoundingClientRect();
        fill.style.transition = `width ${duration}ms linear`;
        fill.style.width = width + '%';
      }
    });
  }

  function activate(index, resetTimer) {
    tabs.forEach((t, i) => t.classList.toggle('active', i === index));
    panels.forEach((p, i) => p.classList.toggle('active', i === index));
    current = index;
    setFill(index, 100, resetTimer ? INTERVAL : 0);

    if (resetTimer) {
      clearInterval(timer);
      if (!paused) startTimer();
    }
  }

  function startTimer() {
    timer = setInterval(() => {
      activate((current + 1) % tabs.length, true);
    }, INTERVAL);
  }

  // Click to jump
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(i, true));
  });

  // Pause on hover (desktop)
  const hiw = document.querySelector('.hiw-layout');
  if (hiw) {
    hiw.addEventListener('mouseenter', () => {
      paused = true;
      clearInterval(timer);
      // Freeze the current progress bar
      const fill = tabs[current]?.querySelector('.hiw-progress-fill');
      if (fill) {
        const computed = getComputedStyle(fill).width;
        const parent   = fill.parentElement;
        const pct = parent ? (parseFloat(computed) / parent.offsetWidth) * 100 : 0;
        fill.style.transition = 'none';
        fill.style.width = pct + '%';
      }
    });

    hiw.addEventListener('mouseleave', () => {
      paused = false;
      setFill(current, 100, INTERVAL);
      startTimer();
    });
  }

  activate(0, false);
  setFill(0, 100, INTERVAL);
  startTimer();
})();

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
(function () {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question')?.addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
})();

/* ============================================================
   NEED-BASED PRICING TOGGLE (features page)
   ============================================================ */
(function () {
  const toggles = document.querySelectorAll('.nb-toggle-btn');
  toggles.forEach(btn => {
    const card = btn.closest('.nb-card');
    if (!card) return;
    btn.addEventListener('click', () => {
      const open = card.classList.toggle('nb-open');
      btn.setAttribute('aria-expanded', open);
    });
  });
})();

/* ============================================================
   PRICING CALCULATOR
   ============================================================ */
(function () {
  const calc = document.querySelector('.pricing-calc');
  if (!calc) return;

  const FREE_MAX_PROCESSES = 3;
  const FREE_MAX_RUNS      = 50;

  let designers = 2;
  let processes = 5;
  let runs      = 300;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function calculate() {
    return {
      perDesigner: designers * 999,
      perProcess:  Math.max(499, processes * 299),
      perRun:      Math.max(499, Math.ceil(runs * 1.5)),
    };
  }

  function isFree() {
    return processes <= FREE_MAX_PROCESSES && runs <= FREE_MAX_RUNS;
  }

  function fmt(n) {
    return '₹' + n.toLocaleString('en-IN') + '/mo';
  }

  function render() {
    calc.querySelector('[data-val="designers"]').textContent = designers;
    calc.querySelector('[data-val="processes"]').textContent = processes;
    calc.querySelector('[data-val="runs"]').textContent      = runs;

    const rows     = calc.querySelectorAll('.calc-result-row');
    const summary  = calc.querySelector('.calc-summary');
    const freeBanner = calc.querySelector('.calc-free-banner');

    if (isFree()) {
      rows.forEach(r => {
        r.classList.remove('best');
        const p = r.querySelector('.calc-result-price');
        if (p) p.textContent = '—';
        const s = r.querySelector('.calc-star');
        if (s) s.style.display = 'none';
      });
      if (freeBanner) freeBanner.style.display = 'block';
      if (summary)    summary.textContent = '';
      return;
    }

    if (freeBanner) freeBanner.style.display = 'none';

    const { perDesigner, perProcess, perRun } = calculate();
    const prices = [perDesigner, perProcess, perRun];
    const minVal = Math.min(...prices);

    rows.forEach((row, i) => {
      const best   = prices[i] === minVal;
      row.classList.toggle('best', best);
      const priceEl = row.querySelector('.calc-result-price');
      if (priceEl) priceEl.textContent = fmt(prices[i]);
      const star   = row.querySelector('.calc-star');
      if (star) star.style.display = best ? 'inline' : 'none';
    });

    if (summary) summary.textContent = `You'd pay ${fmt(minVal)}.`;
  }

  function bind(key, getter, setter, step, min, max) {
    calc.querySelector(`[data-dec="${key}"]`)?.addEventListener('click', () => {
      setter(clamp(getter() - step, min, max)); render();
    });
    calc.querySelector(`[data-inc="${key}"]`)?.addEventListener('click', () => {
      setter(clamp(getter() + step, min, max)); render();
    });
  }

  bind('designers', () => designers, v => { designers = v; }, 1, 1, 20);
  bind('processes', () => processes, v => { processes = v; }, 1, 1, 50);
  bind('runs',      () => runs,      v => { runs = v;      }, 50, 0, 5000);

  render();
})();
