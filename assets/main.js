(() => {
  'use strict';
  const cfg = window.SITE_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---------- basics ---------- */
  $('#year').textContent = new Date().getFullYear();
  if (cfg.email) $$('.js-email').forEach(a => { a.href = 'mailto:' + cfg.email; a.textContent = cfg.email; });
  $$('.stack-col li').forEach(li => { li.dataset.mono = li.textContent.replace(/[^A-Za-z0-9]/g, '').slice(0, 2); });

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const themeBtn = $(".theme-toggle");
  const themeMeta = $('meta[name="theme-color"]');
  const applyTheme = (t, save) => {
    root.dataset.theme = t;
    themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    themeMeta.content = t === "dark" ? "#07080b" : "#fbfbfc";
    if (save) try { localStorage.setItem("theme", t); } catch { /* storage blocked */ }
  };
  applyTheme(root.dataset.theme === "light" ? "light" : "dark");
  // Theme switch: a circle expands from the toggle (View Transitions API), plain swap as fallback.
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) { applyTheme(next, true); return; }
    const b = themeBtn.getBoundingClientRect();
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add("theme-anim");
    let applied = false;
    const vt = document.startViewTransition(() => { applied = true; applyTheme(next, true); });
    // Safety net: if the browser can't start the transition promptly, switch without it.
    setTimeout(() => { if (!applied) { vt.skipTransition(); applyTheme(next, true); root.classList.remove("theme-anim"); } }, 400);
    vt.ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 750, easing: "cubic-bezier(.7, 0, .3, 1)", pseudoElement: "::view-transition-new(root)" }
    )).catch(() => {});
    vt.finished.finally(() => root.classList.remove("theme-anim"));
  });
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", e => {
    let saved; try { saved = localStorage.getItem("theme"); } catch { /* ignore */ }
    if (!saved) applyTheme(e.matches ? "light" : "dark");
  });

  /* ---------- nav ---------- */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = $('.nav-toggle');
  const menu = $('#mobile-menu');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });
  matchMedia('(min-width: 901px)').addEventListener('change', e => e.matches && setMenu(false));

  // highlight the nav link for the section in view, with one dot that slides between links
  const links = $$('.nav-links a');
  const navList = $('.nav-links');
  const dot = document.createElement('span');
  dot.className = 'nav-dot';
  dot.setAttribute('aria-hidden', 'true');
  navList.appendChild(dot);
  let activeLink = null, lockUntil = 0;
  const placeDot = () => {
    if (!activeLink) { dot.style.opacity = '0'; return; }
    dot.style.transform = `translateX(${activeLink.offsetLeft + activeLink.offsetWidth / 2 - 2}px)`;
    dot.style.opacity = '1';
  };
  const setActive = link => {
    if (link === activeLink) return;
    activeLink = link;
    links.forEach(l => l.classList.toggle('active', l === link));
    placeDot();
  };
  // first placement without sliding in from the left edge
  dot.style.transition = 'none';
  requestAnimationFrame(() => requestAnimationFrame(() => { dot.style.transition = ''; }));

  const spy = new IntersectionObserver(entries => {
    if (Date.now() < lockUntil) return; // ignore sections passed during a nav-click scroll
    entries.forEach(e => {
      if (e.isIntersecting) setActive(links.find(l => l.getAttribute('href') === '#' + e.target.id) || null);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const s = $(l.getAttribute('href')); s && spy.observe(s); });

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
    const target = links.find(l => l.getAttribute('href') === a.getAttribute('href'));
    if (!target) return;
    setActive(target);
    lockUntil = Date.now() + 1500;
    addEventListener('scrollend', () => { lockUntil = 0; }, { once: true });
  }));
  addEventListener('resize', placeDot);
  document.fonts?.ready.then(placeDot);

  /* ---------- projects (rendered from config) ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sk = (w, hi) => `<div class="sk${hi ? ' hi' : ''}" style="width:${w}%"></div>`;
  // Product screens drawn in HTML/CSS (sizes scale with the card via container units).
  const mocks = {
    web: () => `<div class="mock ui u-web"><div class="u-bar"><i></i><i></i><i></i><span class="u-url">app.tallyroom.io/overview</span></div>
      <div class="u-app"><aside class="u-side"><b class="u-logo"><s></s>Tallyroom</b><span class="on">Overview</span><span>Invoices</span><span>Cash flow</span><span>Clients</span><span>Reports</span></aside>
      <div class="u-main"><div class="u-head"><b>Overview</b><span class="u-pill">Nov 2026</span></div>
        <div class="u-kpis"><div><small>Revenue</small><b>£48.2k</b><em>+12%</em></div><div><small>Outstanding</small><b>£6.1k</b></div><div><small>Invoices paid</small><b>132</b></div></div>
        <div class="u-chart">${[38, 52, 44, 63, 58, 72, 66, 84, 79, 92].map(h => `<span style="height:${h}%"></span>`).join('')}</div>
        <div class="u-rows"><div><span>INV-2041 · Northside Café</span><em class="ok">Paid</em></div><div><span>INV-2042 · Brightway Studio</span><em class="due">Due</em></div></div>
      </div></div></div>`,
    mobile: () => `<div class="mock ui u-phones">
      <div class="u-phone"><div class="u-status">9:41</div><small>Good morning</small><b class="u-h">Book a visit</b>
        <div class="u-dates"><span>Mon<br>10</span><span class="on">Tue<br>11</span><span>Wed<br>12</span><span>Thu<br>13</span></div>
        <div class="u-doc"><i>OM</i><div><b>Dr. Omar Malik</b><small>General physician</small></div><em>10:30</em></div>
        <div class="u-doc"><i>HR</i><div><b>Dr. Hina Raza</b><small>Dermatology</small></div><em>14:00</em></div>
        <div class="u-btn">Continue</div></div>
      <div class="u-phone u-phone-b"><div class="u-status">9:42</div><div class="u-check">✓</div><b class="u-h c">Appointment confirmed</b><small class="c">Tue 11 Nov · 10:30</small>
        <div class="u-card"><i>OM</i><div><b>Dr. Omar Malik</b><small>Room 4 · City Clinic</small></div></div>
        <div class="u-btn ghost">Add to calendar</div><div class="u-btn ghost">Get directions</div></div></div>`,
    ai: () => `<div class="mock ui u-chat"><div class="u-chat-h"><b><s></s>Quarry</b><span class="u-pill">Workspace: Handbook</span></div>
      <div class="u-msg me">What's our refund policy for annual plans?</div>
      <div class="u-msg">Annual plans can be refunded in full within 30 days of purchase. After that, unused months are credited to the account.
        <div class="u-src"><span>Billing-policy.pdf · p.4</span><span>Help centre › Refunds</span></div></div>
      <div class="u-input"><span>Ask anything about your docs…</span><i>↑</i></div></div>`,
    flow: () => `<div class="mock ui u-flow"><div class="u-chat-h"><b><s></s>Signoff</b><span class="u-pill">Purchase requests</span></div>
      <div class="u-stages"><span class="done">Submitted</span><span class="done">Manager</span><span class="now">Finance</span><span>Approved</span></div>
      <div class="u-req"><i>SK</i><div><b>Laptops for design team</b><small>£1,450 · requested by Sana K.</small></div><em class="now">Finance review</em></div>
      <div class="u-req"><i>AR</i><div><b>Annual design tool licence</b><small>£540 · requested by Ali R.</small></div><em class="ok">Approved</em></div>
      <div class="u-req"><i>MZ</i><div><b>Office chairs × 6</b><small>£1,020 · requested by Maha Z.</small></div><em>Manager</em></div></div>`,
  };
  const grid = $('#project-grid');
  if (grid && Array.isArray(cfg.projects)) {
    grid.innerHTML = cfg.projects.map((p, i) => {
      const tag = p.url ? 'a' : 'article';
      const href = p.url ? ` href="${esc(p.url)}" target="_blank" rel="noopener"` : '';
      const label = p.urlLabel || (p.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
      const visual = p.image
        ? `<div class="proj-visual is-shot"><div class="mock shot"><div class="u-bar"><i></i><i></i><i></i><span class="u-url">${esc(label)}</span></div>
            <img src="${esc(p.image)}" alt="${esc(p.title)} website screenshot" loading="lazy" decoding="async" width="1600" height="1000"></div></div>`
        : `<div class="proj-visual" aria-hidden="true">${(mocks[p.mock] || mocks.web)()}</div>`;
      return `<${tag} class="proj reveal${p.theme ? ' t-' + esc(p.theme) : ''}"${href} style="--accent:${esc(p.accent || '#7aa2ff')};--d:${(i % 2) * 0.08}s">
        ${visual.replace('">', `">${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}`)}
        <div class="proj-body">
          <p class="proj-cat">${esc(p.category)}</p>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <ul class="tags">${(p.tags || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          ${p.url ? `<span class="proj-link">Visit ${esc(label)} <span aria-hidden="true">↗</span></span>` : ''}
        </div></${tag}>`;
    }).join('');
  }

  /* ---------- reveal on scroll ---------- */
  const groupDelay = new Map();
  const revealer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealer.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(el => {
    // stagger siblings inside the same parent
    if (!el.style.getPropertyValue('--d')) {
      const n = groupDelay.get(el.parentElement) || 0;
      groupDelay.set(el.parentElement, n + 1);
      el.style.setProperty('--d', Math.min(n * 0.07, 0.42) + 's');
    }
    revealer.observe(el);
  });

  /* ---------- cursor spotlight on service cards ---------- */
  $$('.spot').forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* ---------- hero: code typing + pipeline ---------- */
  const lines = $$('.code .ln');
  if (!reduceMotion) {
    let delay = document.documentElement.classList.contains('intro-on') ? 2400 : 500;
    lines.forEach(ln => {
      const len = Math.max(ln.textContent.length, 1);
      const dur = Math.min(0.12 + len * 0.018, 0.9);
      ln.style.setProperty('--s', len);
      ln.style.setProperty('--t', dur + 's');
      setTimeout(() => ln.classList.add('typed'), delay);
      delay += dur * 1000 + 70;
    });
  }

  const pipe = $$('.pipe li');
  const bar = $('.card-pipeline .bar span');
  let stage = 0;
  const setStage = s => {
    pipe.forEach((li, i) => { li.classList.toggle('done', i < s); li.classList.toggle('now', i === s); });
    bar.style.width = ((s + 1) / pipe.length) * 100 + '%';
  };
  setStage(reduceMotion ? 2 : 0);
  if (!reduceMotion) setInterval(() => { stage = (stage + 1) % pipe.length; setStage(stage); }, 2200);

  /* ---------- process tabs (auto-advance until the user interacts) ---------- */
  const proc = $('.process');
  const tabs = $$('[role="tab"]', proc);
  const DUR = 6000;
  let current = 0, timer = null, auto = !reduceMotion, inView = false;
  proc.style.setProperty('--dur', DUR / 1000 + 's');

  const select = (i, focus) => {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach((t, j) => {
      const on = j === current;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tabs[current].focus();
    schedule();
  };
  const schedule = () => {
    clearTimeout(timer);
    proc.classList.toggle('auto', auto && inView);
    // restart the progress-bar animation
    const bar = $('.step-bar i', tabs[current]);
    bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    if (auto && inView) timer = setTimeout(() => select(current + 1), DUR);
  };
  const stopAuto = () => { auto = false; schedule(); };
  tabs.forEach((t, i) => t.addEventListener('click', () => { stopAuto(); select(i); }));
  proc.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (k && e.target.matches('[role="tab"]')) { e.preventDefault(); stopAuto(); select(current + k, true); }
  });
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; schedule(); }, { threshold: 0.4 }).observe(proc);

  /* ---------- contact form ---------- */
  const form = $('#contact-form');
  const card = $('.form-card');
  const success = $('.form-success', card);
  const alertBox = $('.form-alert', form);
  const submitBtn = $('button[type="submit"]', form);
  const msg = form.elements.message;
  const counter = $('#c-message');
  const fCfg = cfg.form || {};
  let startedAt = Date.now();

  const rules = {
    name: v => v.trim().length < 2 ? 'Please enter your full name.' : '',
    email: v => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Please enter a valid email address.' : '',
    phone: v => v.trim() && !/^[+()\d\s.-]{6,30}$/.test(v.trim()) ? 'Please enter a valid phone number.' : '',
    service: v => !v ? 'Please choose what you need.' : '',
    message: v => v.trim().length < 20 ? 'Please share a little more (at least 20 characters).' : '',
  };
  const setError = (name, text) => {
    const input = form.elements[name];
    const field = input.closest('.field');
    field.classList.toggle('invalid', !!text);
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    $('#e-' + name).textContent = text;
  };
  const validate = () => {
    let first = null;
    Object.entries(rules).forEach(([name, fn]) => {
      const err = fn(form.elements[name].value);
      setError(name, err);
      if (err && !first) first = form.elements[name];
    });
    return first;
  };
  // validate a field once the user leaves it, then live while they fix it
  Object.keys(rules).forEach(name => {
    const input = form.elements[name];
    input.addEventListener('blur', () => input.value && setError(name, rules[name](input.value)));
    input.addEventListener('input', () => input.closest('.field').classList.contains('invalid') && setError(name, rules[name](input.value)));
  });
  msg.addEventListener('input', () => { counter.textContent = `${msg.value.length} / ${msg.maxLength}`; });

  const showAlert = html => { alertBox.innerHTML = html; alertBox.hidden = false; };
  const setLoading = on => {
    submitBtn.classList.toggle('is-loading', on);
    submitBtn.disabled = on;
    $('.btn-label', submitBtn).textContent = on ? 'Sending…' : 'Send Project Inquiry';
  };
  const showSuccess = () => {
    form.hidden = true; success.hidden = false; success.focus();
  };
  const mailtoFallback = () => {
    const e = cfg.email || 'hello@yourdomain.com';
    return `<a href="mailto:${esc(e)}?subject=${encodeURIComponent('Project inquiry')}">${esc(e)}</a>`;
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    alertBox.hidden = true;
    const firstInvalid = validate();
    if (firstInvalid) { firstInvalid.focus(); return; }

    // spam checks: honeypot filled, or form completed impossibly fast → quietly drop
    if (form.elements.website.value || Date.now() - startedAt < (fCfg.minFillMs ?? 2500)) { showSuccess(); return; }

    if (!fCfg.endpoint) {
      showAlert(`Our online form is almost ready. In the meantime, email us at ${mailtoFallback()}.`);
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    delete data.website;
    Object.assign(data, fCfg.extraFields || {}, { source: location.href, elapsedMs: Date.now() - startedAt });

    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), fCfg.timeoutMs || 15000);
    try {
      const res = await fetch(fCfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: ctrl.signal,
      });
      let body = {};
      try { body = await res.json(); } catch { /* non-JSON response */ }
      if (!res.ok || body.success === false || body.ok === false) throw new Error(body.error || body.message || `HTTP ${res.status}`);
      form.reset();
      counter.textContent = `0 / ${msg.maxLength}`;
      showSuccess();
    } catch (err) {
      const reason = err.name === 'AbortError' ? 'The request timed out.' : 'Something went wrong sending your message.';
      showAlert(`${reason} Please try again, or email us directly at ${mailtoFallback()}.`);
      console.error('[contact form]', err);
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  });

  $('.js-reset', success).addEventListener('click', () => {
    success.hidden = true; form.hidden = false; startedAt = Date.now();
    form.elements.name.focus();
  });
})();
