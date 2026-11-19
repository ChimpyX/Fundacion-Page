# Sitio web — Fundación Niños del Rey (Valparaíso)

Sitio estático, liviano y sin dependencias (HTML + CSS + JS). Mobile first y accesible (contraste AA, textos ≥ 16 px, botones ≥ 44 px, navegación con teclado).

## Estructura
```
src/pages/*.html   Contenido de cada página (1.ª línea = título y descripción SEO)
build.mjs          Une cabecera, menú y pie con cada página → dist/
css/styles.css     Sistema de diseño (colores, tipografías, componentes)
js/config.js       WhatsApp, recepción de formularios y enlaces de pago
js/main.js         Menú, galería, formularios, animaciones
assets/            logo.png, logo-mark.webp, íconos y og-image.jpg
dist/              Sitio listo para publicar (se genera con `node build.mjs`)
```

## Editar y publicar
1. Edita el texto en `src/pages/…`. Lo que falta está entre `[corchetes]` (resaltado en amarillo en el sitio).
2. Ejecuta `node build.mjs` (Node 18+).
3. Publica la carpeta `dist/`:
   - **Netlify / Cloudflare Pages:** comando `node build.mjs`, carpeta `dist` (ya configurado en `netlify.toml`).
   - **GitHub Pages:** Settings → Pages → Source: *GitHub Actions* (usa `.github/workflows/pages.yml`).
4. Antes de publicar, cambia `SITE_URL` en `build.mjs` por el dominio real (sitemap, canonical y Open Graph).

## Formularios
Por defecto, cada formulario arma un mensaje y abre WhatsApp listo para enviar. Para recibirlos por correo, crea un formulario en Formspree (u otro servicio) y pega su URL en `formEndpoint` de `js/config.js`.

## Donaciones en línea (Flow, Mercado Pago, Webpay)
Todos los botones de donación llevan `data-donate="apadrinamiento" | "donacion" | "rifa"`. Cuando la fundación tenga un link de pago o suscripción, pégalo en `payments.links` de `js/config.js` y los botones dejarán de ir a WhatsApp automáticamente. Flow y Mercado Pago ofrecen links de pago y suscripciones sin programar; Webpay requiere backend o plugin.

## Agregar una noticia
Copia un bloque `<li class="news-card">` en `src/pages/noticias.html` y vuelve a generar.

## Fotos
No publicar rostros de niños. Solo fotos con autorización escrita de los apoderados, de espalda o de manos. Optimiza antes de subir: ancho máx. 1600 px, formato WebP o JPG calidad ~75.

Ver la lista de contenido por enviar en [CONTENIDO-PENDIENTE.md](CONTENIDO-PENDIENTE.md).

## Movimiento
- **Deslizamiento suave** (Lenis 1.1.20, MIT, en `js/vendor/`): solo con rueda del mouse o trackpad en computador. En celulares el desplazamiento es el nativo, y se desactiva solo con "reducir movimiento". Se apaga con `smoothScroll: false` en `js/config.js`.
- **Entrada del hero**: el titular sube palabra por palabra una sola vez al cargar.
- **Frase que se ilumina** al deslizar (`data-moment="words"`) en Inicio, Quiénes somos y Apadrina.
- **Hover**: botones que suben 1 px y se hunden al presionar, tarjetas con enlace que se elevan 2 px, subrayados que se dibujan.
- Sin movimiento al deslizar fuera de esas frases (nada aparece "flotando" en cada sección).
