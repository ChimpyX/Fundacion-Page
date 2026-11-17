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

  /* Aparición suave al hacer scroll */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
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
