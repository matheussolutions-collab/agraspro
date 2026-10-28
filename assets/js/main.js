(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(key, val) { try { localStorage.setItem(key, val) } catch (e) { } }
  function read(key) { try { return localStorage.getItem(key) } catch (e) { return null } }

  /* ===== Ano no rodapé ===== */
  document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear() });

  /* ===== Tema claro / escuro ===== */
  document.getElementById('theme').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    store('agras-theme', next);
  });

  /* ===== Idioma ===== */
  var langBtns = document.querySelectorAll('[data-lang]');
  var sweep = document.querySelector('.lang-sweep');

  function applyLang(lang) {
    var dict = window.I18N && window.I18N[lang];
    if (!dict) return;
    // Dicionário é conteúdo próprio do site (i18n.js), por isso pode conter <br>
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n-aria')];
      if (v != null) el.setAttribute('aria-label', v);
    });
    root.lang = lang === 'en' ? 'en' : 'pt-BR';
    langBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)) });
  }

  langBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.getAttribute('aria-pressed') === 'true') return;
      store('agras-lang', b.dataset.lang);
      if (reduce) return applyLang(b.dataset.lang);
      sweep.classList.remove('go');
      void sweep.offsetWidth;
      sweep.classList.add('go');
      setTimeout(function () { applyLang(b.dataset.lang) }, 260);
    });
  });
  sweep.addEventListener('animationend', function () { sweep.classList.remove('go') });

  var saved = read('agras-lang');
  if (saved && saved !== 'pt') applyLang(saved);

  /* ===== Faixa rolando: duplica o conteúdo para o loop ficar contínuo ===== */
  document.querySelectorAll('.ticker > div').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ===== Abas: Drones / Assistência técnica ===== */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selectTab(id, focus) {
    root.setAttribute('data-tab', id);
    tabs.forEach(function (t) {
      var on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) panel.classList.add('in');
      if (on && focus) t.focus();
    });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      selectTab(t.dataset.tab);
      history.replaceState(null, '', t.dataset.tab === 'drones' ? location.pathname + location.search : '#' + t.dataset.tab);
    });
    t.addEventListener('keydown', function (e) {
      var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      var next = tabs[(i + step + tabs.length) % tabs.length];
      selectTab(next.dataset.tab, true);
    });
  });

  // Links que abrem uma aba (ex.: botão "Assistência") e acesso direto por #assistencia
  document.querySelectorAll('[data-tab-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var id = a.dataset.tabLink;
      selectTab(id);
      history.replaceState(null, '', '#' + id);
      document.querySelector('.tabs').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });
  if (location.hash === '#assistencia') selectTab('assistencia');

  /* ===== Entrada suave dos blocos ===== */
  var items = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in') });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el) });
  }
})();
