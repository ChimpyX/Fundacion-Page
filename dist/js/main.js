/* Fundación Niños del Rey — interacciones del sitio (sin dependencias) */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var CFG = window.FNR_CONFIG || {};

  /* Año del pie */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Menú móvil */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu-principal');
  function closeMenu() { if (!toggle) return; toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
  }

  /* Submenú "Más" */
  var moreBtn = document.querySelector('.nav-more-btn');
  function closeMore() { if (moreBtn) moreBtn.setAttribute('aria-expanded', 'false'); }
  if (moreBtn) {
    moreBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      moreBtn.setAttribute('aria-expanded', String(moreBtn.getAttribute('aria-expanded') !== 'true'));
    });
    document.addEventListener('click', function (e) {
      if (window.matchMedia('(min-width: 68em)').matches && !e.target.closest('.nav-more')) closeMore();
    });
    document.querySelector('.nav-more').addEventListener('focusout', function (e) {
      if (window.matchMedia('(min-width: 68em)').matches && !e.currentTarget.contains(e.relatedTarget)) closeMore();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (moreBtn && moreBtn.getAttribute('aria-expanded') === 'true') { closeMore(); moreBtn.focus(); return; }
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); }
  });

  /* Abrir automáticamente el submenú en móvil si la página actual está dentro */
  if (moreBtn && moreBtn.classList.contains('is-active') && !window.matchMedia('(min-width: 68em)').matches) {
    moreBtn.setAttribute('aria-expanded', 'true');
  }

  /* Botones de donación: si hay enlace de pago configurado, se usa en lugar de WhatsApp */
  var pay = (CFG.payments && CFG.payments.links) || {};
  document.querySelectorAll('[data-donate]').forEach(function (a) {
    var link = pay[a.getAttribute('data-donate')];
    if (link) { a.href = link; a.target = '_blank'; a.rel = 'noopener'; }
  });

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* Entrada del hero: el titular sube palabra por palabra y luego el resto, una sola vez */
  (function enter() {
    var hero = document.querySelector('[data-enter]');
    if (!hero || reduced) { root.classList.add('m-entered'); return; }
    var h1 = hero.querySelector('h1');
    var words = 0;
    if (h1) {
      var walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (node) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span'); w.className = 'w';
          var inner = document.createElement('span'); inner.textContent = part;
          inner.style.setProperty('--d', Math.min(words * 30, 240) + 'ms');
          w.appendChild(inner); frag.appendChild(w); words++;
        });
        node.parentNode.replaceChild(frag, node);
      });
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    }
    var after = hero.querySelectorAll('.enter-up');
    after.forEach(function (el, i) { el.style.setProperty('--d', (380 + i * 60) + 'ms'); });
    var art = hero.querySelector('.hero-art');
    if (art) art.style.setProperty('--d', '200ms');
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('m-entered'); }); });
    setTimeout(function () { if (h1) h1.removeAttribute('aria-label'); }, 1600);
  })();

  /* Momento: la frase se ilumina palabra por palabra mientras se desliza */
  var moments = [];
  if (!reduced) {
    document.querySelectorAll('[data-moment="words"]').forEach(function (el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (node) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span'); w.className = 'mw'; w.textContent = part; frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      });
      moments.push({ el: el, words: el.querySelectorAll('.mw') });
    });
    if (moments.length) root.classList.add('js-moment');
  }
  function updateMoments() {
    var vh = window.innerHeight;
    moments.forEach(function (m) {
      var r = m.el.getBoundingClientRect();
      var p = (vh * 0.9 - r.top) / (vh * 0.55 + r.height * 0.6);
      p = Math.max(0, Math.min(1, p));
      var lit = Math.round(p * m.words.length);
      for (var i = 0; i < m.words.length; i++) m.words[i].classList.toggle('on', i < lit);
    });
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; updateMoments(); });
  }
  if (moments.length) { window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); updateMoments(); }

  /* Deslizamiento suave: solo mouse/trackpad, nunca en táctil ni con "reducir movimiento" */
  var lenis = null;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (CFG.smoothScroll !== false && !reduced && finePointer && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // El mapa y los menús con scroll propio no se secuestran
    document.querySelectorAll('iframe, .site-nav, textarea').forEach(function (el) { el.setAttribute('data-lenis-prevent', ''); });
  }

  /* Enlaces internos (#seccion): desplazamiento suave y el foco llega al destino */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    var header = document.querySelector('.site-header');
    var offset = (header ? header.offsetHeight : 0) + 16;
    if (lenis) lenis.scrollTo(target, { offset: -offset, duration: 1.1 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: reduced ? 'auto' : 'smooth' });
    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.pushState(null, '', url.hash);
  });

  /* El botón flotante de WhatsApp se esconde mientras otro botón de WhatsApp está a la vista */
  var waFloat = document.querySelector('.wa-float');
  var waBtns = document.querySelectorAll('main .btn-wa');
  if (waFloat && waBtns.length && 'IntersectionObserver' in window) {
    var visible = new Set();
    var waIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
      waFloat.classList.toggle('is-hidden', visible.size > 0);
    });
    waBtns.forEach(function (b) { waIO.observe(b); });
  }

  /* Filtro de galería */
  var filters = document.querySelectorAll('[data-filter]');
  var status = document.getElementById('gallery-status');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var shown = 0;
      document.querySelectorAll('[data-category]').forEach(function (item) {
        var show = cat === 'todas' || item.getAttribute('data-category') === cat;
        item.hidden = !show;
        if (show) shown++;
      });
      if (status) status.textContent = 'Mostrando ' + shown + ' elementos' + (cat === 'todas' ? '' : ' de ' + btn.textContent.trim());
    });
  });

  /* Formularios: validación accesible + envío a servicio o a WhatsApp */
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var out = form.querySelector('.form-status');
    form.setAttribute('novalidate', '');

    function labelFor(el) {
      var l = form.querySelector('label[for="' + el.id + '"]');
      if (el.type === 'radio' || el.type === 'checkbox') {
        var fs = el.closest('fieldset');
        if (fs && fs.querySelector('legend')) return fs.querySelector('legend').textContent.trim();
      }
      return l ? l.textContent.replace('(obligatorio)', '').trim() : el.name;
    }

    function setError(el, msg) {
      var id = el.id + '-error';
      var err = document.getElementById(id);
      if (msg) {
        el.setAttribute('aria-invalid', 'true');
        if (!err) {
          err = document.createElement('p'); err.className = 'error-msg'; err.id = id;
          el.insertAdjacentElement('afterend', err);
          el.setAttribute('aria-describedby', ((el.getAttribute('aria-describedby') || '') + ' ' + id).trim());
        }
        err.textContent = msg;
      } else {
        el.removeAttribute('aria-invalid');
        if (err) err.remove();
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.type === 'radio' || el.type === 'hidden') return;
        var bad = !el.checkValidity();
        var msg = '';
        if (bad) {
          if (el.validity.valueMissing) msg = el.type === 'checkbox' ? 'Debes marcar esta casilla para continuar.' : 'Completa este campo.';
          else if (el.type === 'email') msg = 'Revisa el correo. Ejemplo: nombre@correo.cl';
          else msg = 'Revisa este dato.';
        }
        setError(el, msg);
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) { out.textContent = 'Faltan datos. Revisa los campos marcados.'; firstBad.focus(); return; }

      var data = new FormData(form);
      var lines = [form.getAttribute('data-title') || 'Mensaje desde el sitio web'];
      var seen = {};
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (!el.name || seen[el.name] || el.type === 'hidden') return;
        if (el.type === 'checkbox' && el.name === 'consentimiento') return;
        seen[el.name] = true;
        var val = data.getAll(el.name).join(', ').trim();
        if (val) lines.push(labelFor(el) + ': ' + val);
      });
      var text = lines.join('\n');

      if (CFG.formEndpoint) {
        out.textContent = 'Enviando…';
        data.append('_asunto', lines[0]);
        fetch(CFG.formEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) {
            if (!r.ok) throw new Error();
            form.reset();
            out.textContent = '¡Gracias! Recibimos tu mensaje y te responderemos pronto.';
          })
          .catch(function () {
            out.innerHTML = 'No pudimos enviar el formulario. Escríbenos por <a href="https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener">WhatsApp</a>.';
          });
        return;
      }
      var url = 'https://wa.me/' + (CFG.whatsapp || '56986258318') + '?text=' + encodeURIComponent(text);
      out.innerHTML = 'Abrimos WhatsApp con tu mensaje listo. Solo toca <strong>Enviar</strong>. Si no se abrió, <a href="' + url + '" target="_blank" rel="noopener">toca aquí</a>.';
      window.open(url, '_blank', 'noopener');
    });
  });
})();
