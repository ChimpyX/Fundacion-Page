// Generador estático del sitio Fundación Niños del Rey.
// Uso: node build.mjs  → escribe el sitio listo para publicar en /dist
// Cabecera, pie y navegación viven aquí, una sola vez. Cada página es un
// fragmento HTML en src/pages con sus metadatos en la primera línea.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// ⚠️ Reemplazar por el dominio definitivo antes de publicar (sitemap, canonical, Open Graph).
const SITE_URL = 'https://DOMINIO-POR-DEFINIR.cl';

const ORG = {
  name: 'Fundación Niños del Rey',
  wa: '56986258318',
  waDisplay: '+56 9 8625 8318',
  email: 'fundacionninosdelrey.valpo@gmail.com',
  ig: 'fundacionninosdelrey.oficial',
  place: 'Cerro Esperanza, Valparaíso',
};

const waLink = (msg) => `https://wa.me/${ORG.wa}?text=${encodeURIComponent(msg)}`;
const WA_AGENDAR = waLink('Hola, quiero información para agendar una terapia en la Fundación Niños del Rey.');
const WA_APADRINAR = waLink('Hola, quiero apadrinar a un niño o niña con $5.000 al mes.');
const WA_GENERAL = waLink('Hola, me comunico desde el sitio web de la Fundación Niños del Rey.');

// Íconos de línea (trazo 1.75, 24×24). Sin emojis.
const ICONS = {
  whatsapp: '<path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.5z"/><path d="M9 8.6c0 3.3 2.9 6.4 6.3 6.4l1.2-1.4-1.9-1-1 .8a5 5 0 0 1-2.6-2.6l.8-1-1-1.9z"/>',
  heart: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.6 12 20 12 20z"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5"/><path d="M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7 6 6 0 0 1-5.3-3.2L3 14.4a1.5 1.5 0 0 1 2.5-1.6L8 15"/>',
  puzzle: '<path d="M10 3h4v2.2a1.8 1.8 0 1 0 3.6 0V3H21v6h-2.2a1.8 1.8 0 1 0 0 3.6H21V21h-6v-2.2a1.8 1.8 0 1 0-3.6 0V21H3v-6h2.2a1.8 1.8 0 1 0 0-3.6H3V3h7z"/>',
  speech: '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  brain: '<path d="M9.5 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5.5 1.5V5.5A2.5 2.5 0 0 0 9.5 4z"/><path d="M14.5 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-5.5 1.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  apple: '<path d="M12 7.5c-2-1.5-7-1.5-7 4.5 0 4 2.5 8.5 4.5 8.5 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c2 0 4.5-4.5 4.5-8.5 0-6-5-6-7-4.5z"/><path d="M12 7.5c0-2 1-3.5 3-4"/>',
  book: '<path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" transform="translate(0 2)"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  megaphone: '<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17 9a4 4 0 0 1 0 6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  cross: '<path d="M12 3v18M7 8h10"/>',
  family: '<circle cx="7" cy="6" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="12" cy="12.5" r="2"/><path d="M3 20v-5a4 4 0 0 1 8 0M13 20v-5a4 4 0 0 1 8 0M9.5 20v-2.5a2.5 2.5 0 0 1 5 0V20"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.7-2.5 1.9 0 2.6 5.2 1.4 5.2 4.1 0 1.2-1.2 2-2.7 2-1.2 0-2.2-.5-2.7-1.4M12 6.5V8M12 16v1.5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>',
};

const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

// Navegación: 6 secciones principales + "Más" para no saturar el menú.
const NAV_MAIN = [
  ['quienes-somos', 'Quiénes somos'],
  ['terapias', 'Terapias'],
  ['apadrina', 'Apadrina'],
  ['actividades', 'Actividades'],
  ['noticias', 'Noticias'],
  ['contacto', 'Contacto'],
];
const NAV_MORE = [
  ['trabaja-con-nosotros', 'Trabaja con nosotros'],
  ['compromiso-infancia', 'Compromiso con la infancia'],
  ['transparencia', 'Transparencia'],
  ['recursos', 'Recursos para familias'],
];

const href = (slug) => (slug === 'index' ? './' : `${slug}.html`);
const cur = (slug, active) => (slug === active ? ' aria-current="page"' : '');

function header(active) {
  const main = NAV_MAIN.map(([s, l]) => `<li><a href="${href(s)}"${cur(s, active)}>${l}</a></li>`).join('');
  const more = NAV_MORE.map(([s, l]) => `<li><a href="${href(s)}"${cur(s, active)}>${l}</a></li>`).join('');
  const moreActive = NAV_MORE.some(([s]) => s === active);
  return `
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="./" aria-label="Fundación Niños del Rey, ir al inicio">
      <img src="assets/logo.png" alt="" width="48" height="48" class="brand-logo" onerror="this.style.visibility='hidden'">
      <span class="brand-text"><span class="brand-small">Fundación</span> Niños del Rey</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu-principal">
      ${icon('menu', 'icon icon-open')}${icon('close', 'icon icon-close')}<span>Menú</span>
    </button>
    <nav class="site-nav" id="menu-principal" aria-label="Principal">
      <ul class="nav-list">
        ${main}
        <li class="nav-more">
          <button type="button" class="nav-more-btn${moreActive ? ' is-active' : ''}" aria-expanded="false" aria-controls="submenu-mas">Más ${icon('chevron', 'icon icon-sm')}</button>
          <ul class="submenu" id="submenu-mas">${more}</ul>
        </li>
      </ul>
      <a class="btn btn-primary btn-sm nav-cta" href="${WA_AGENDAR}" target="_blank" rel="noopener">${icon('whatsapp')}Agendar hora</a>
    </nav>
  </div>
</header>`;
}

function footer() {
  const all = [['index', 'Inicio'], ...NAV_MAIN, ...NAV_MORE]
    .map(([s, l]) => `<li><a href="${href(s)}">${l}</a></li>`).join('');
  return `
<footer class="site-footer">
  <div class="rainbow-rule" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
  <div class="container close-type"><p>Que cada niño<br>pueda <span>brillar.</span></p></div>
  <div class="container footer-grid">
    <div>
      <p class="footer-brand">Fundación Niños del Rey</p>
      <p>Terapias a bajo costo para niñas, niños y jóvenes. ${ORG.place}.</p>
      <p class="footer-note">Enfoque cristiano, con respeto por la identidad y las creencias de cada familia.</p>
    </div>
    <nav aria-label="Mapa del sitio">
      <p class="footer-title">Secciones</p>
      <ul class="footer-links">${all}</ul>
    </nav>
    <div>
      <p class="footer-title">Contacto</p>
      <ul class="footer-contact">
        <li><a href="${WA_GENERAL}" target="_blank" rel="noopener">${icon('whatsapp')}${ORG.waDisplay}</a></li>
        <li><a href="mailto:${ORG.email}">${icon('mail')}<span class="break">${ORG.email}</span></a></li>
        <li><a href="https://www.instagram.com/${ORG.ig}/" target="_blank" rel="noopener">${icon('instagram')}@${ORG.ig}</a></li>
        <li><span>${icon('pin')}${ORG.place}</span></li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>© <span data-year>2026</span> Fundación Niños del Rey. [RUT de la fundación]</p>
  </div>
</footer>
<a class="wa-float" href="${WA_GENERAL}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${icon('whatsapp')}<span class="wa-float-label">WhatsApp</span></a>`;
}

function jsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: ORG.name,
    url: SITE_URL + '/',
    logo: SITE_URL + '/assets/logo.png',
    email: ORG.email,
    telephone: '+' + ORG.wa,
    sameAs: [`https://www.instagram.com/${ORG.ig}/`],
    address: { '@type': 'PostalAddress', addressLocality: 'Valparaíso', addressRegion: 'Valparaíso', addressCountry: 'CL', streetAddress: 'Cerro Esperanza' },
    areaServed: 'Valparaíso',
    knowsAbout: ['Terapia ocupacional', 'Fonoaudiología', 'Psicología infantil', 'Trabajo social', 'Nutrición', 'Educación diferencial', 'Autismo', 'TDAH', 'Neurodivergencia'],
  });
}

function page(meta, body) {
  const url = SITE_URL + '/' + (meta.slug === 'index' ? '' : meta.slug + '.html');
  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#FFFCF0">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_CL">
<meta property="og:site_name" content="${ORG.name}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/assets/og-image.png">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:ital,wght@0,400;0,600;0,700;1,400&display=swap">
<link rel="stylesheet" href="css/styles.css">
<script>document.documentElement.classList.add('m-enter');setTimeout(function(){document.documentElement.classList.add('m-enter-done')},1200)</script>
${meta.slug === 'index' ? `<script type="application/ld+json">${jsonLd()}</script>` : ''}
<script src="js/config.js" defer></script>
<script src="js/vendor/lenis.min.js" defer></script>
<script src="js/main.js" defer></script>
</head>
<body data-page="${meta.slug}">
${header(meta.slug)}
<main id="contenido" tabindex="-1">
${body}
</main>
${footer()}
</body>
</html>
`;
}

// Tokens disponibles en los fragmentos de página.
function expand(html) {
  return html
    .replace(/\{\{icon:([a-z]+)\}\}/g, (_, n) => icon(n))
    .replace(/\{\{wa:agendar\}\}/g, WA_AGENDAR)
    .replace(/\{\{wa:apadrinar\}\}/g, WA_APADRINAR)
    .replace(/\{\{wa:general\}\}/g, WA_GENERAL)
    .replace(/\{\{wa:(\w[^}]*)\}\}/g, (_, msg) => waLink(msg))
    .replace(/\{\{email\}\}/g, ORG.email)
    .replace(/\{\{ig\}\}/g, ORG.ig)
    .replace(/\{\{waDisplay\}\}/g, ORG.waDisplay);
}

const OUT = 'dist';
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

const urls = [];
for (const file of readdirSync('src/pages').filter((f) => f.endsWith('.html')).sort()) {
  const raw = readFileSync(join('src/pages', file), 'utf8');
  const m = raw.match(/^<!--meta\s+(\{[\s\S]*?\})\s*-->\n?/);
  if (!m) throw new Error(`Falta el bloque de metadatos en ${file}`);
  const meta = JSON.parse(m[1]);
  meta.slug = file.replace(/\.html$/, '');
  writeFileSync(join(OUT, file), page(meta, expand(raw.slice(m[0].length))));
  urls.push(SITE_URL + '/' + (meta.slug === 'index' ? '' : file));
}

for (const dir of ['css', 'js', 'assets']) cpSync(dir, join(OUT, dir), { recursive: true });
for (const f of ['_headers', '_redirects', '.nojekyll']) if (existsSync(join('static', f))) cpSync(join('static', f), join(OUT, f));

writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
writeFileSync(join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);

console.log(`Sitio generado en ${OUT}/ (${urls.length} páginas)`);
