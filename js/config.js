/* Configuración editable del sitio — Fundación Niños del Rey
 * ---------------------------------------------------------------
 * Este es el único archivo que hay que tocar para:
 *  1. Recibir los formularios en un correo (formEndpoint).
 *  2. Activar donaciones en línea (payments) con Flow, Mercado Pago o Webpay.
 * Mientras estén vacíos, los formularios y botones de donación abren WhatsApp.
 */
window.FNR_CONFIG = {
  whatsapp: '56986258318',
  email: 'fundacionninosdelrey.valpo@gmail.com',

  // Deslizamiento suave con rueda del mouse o trackpad (solo computador).
  // En celulares el desplazamiento es siempre el nativo, y se desactiva solo
  // si la persona tiene activado "reducir movimiento". Poner false para apagarlo.
  smoothScroll: true,

  // URL de un servicio de formularios (Formspree, Getform, Netlify Forms, etc.).
  // Ej.: 'https://formspree.io/f/XXXXXXX'. Vacío = el formulario arma un mensaje de WhatsApp.
  formEndpoint: '',

  // Donaciones en línea. provider: 'flow' | 'mercadopago' | 'webpay' | null
  // Cada botón con data-donate="<clave>" usará el enlace de pago que pongas aquí.
  // Flow y Mercado Pago entregan "links de pago" o "suscripciones" sin programar;
  // Webpay (Transbank) requiere un backend o un plugin del proveedor.
  payments: {
    provider: null,
    links: {
      apadrinamiento: '', // suscripción mensual de $5.000
      donacion: '',       // aporte único de monto libre
      rifa: '',           // compra de números de rifa
    },
  },
};
