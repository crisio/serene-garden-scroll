/* ============================================================
   liquid-glass.js — VERSIÓN VANILLA (script clásico, sin módulos)
   ------------------------------------------------------------
   Refracción "Liquid Glass" (iOS 26) para cualquier elemento:
   lente real de borde con feDisplacementMap (perfil físico de
   Snell), aberración cromática sutil y fallback frosted donde no
   hay soporte (Safari, Firefox y todo iOS).

   USO 1 — automático, sin escribir JavaScript:
     <link rel="stylesheet" href="liquid-glass.css">
     <script src="liquid-glass.js" defer></script>
     <div class="liquid-glass" data-liquid-glass></div>
     <!-- opciones por atributo: -->
     <div class="liquid-glass" data-liquid-glass
          data-bisel="20" data-escala="50" data-croma="2"></div>

   USO 2 — manual:
     <script src="liquid-glass.js"></script>
     <script>
       var vidrio = liquidGlass(document.querySelector('.mi-vidrio'), {
         bisel: 16, escala: 40, croma: 1
       });
       // vidrio.soportado  → true si hay refracción real
       // vidrio.regenerar()
       // vidrio.destruir()
     </script>

   Funciona abriendo el HTML directamente (file://): al ser script
   clásico no le afecta el bloqueo CORS de los módulos ES.

   REGLAS DE ORO (aprendidas a base de capturas en Chromium):
     1. NO pongas box-shadow exterior en el elemento refractado:
        Chromium mete la sombra propia en el snapshot del backdrop
        y la lente la magnifica como una mancha oscura. Solo insets.
     2. NO encadenes blur() tras url() en backdrop-filter: degrada
        la resolución del snapshot y emborrona todo. El esmerilado
        va DENTRO del filtro (opción frost).
     3. El fondo del elemento debe ser translúcido (la clase
        .liquid-glass del CSS adjunto ya lo trae bien puesto).
   ============================================================ */
(function (global) {
  'use strict';

  var NS_SVG = 'http://www.w3.org/2000/svg';
  var NS_XLINK = 'http://www.w3.org/1999/xlink';

  var contadorIds = 0;
  var svgHost = null;   // un único <svg> oculto compartido por todas las instancias

  /* ¿Este navegador renderiza backdrop-filter: url(#filtroSVG)?
     Solo Chromium de verdad. En iOS TODOS los navegadores (Chrome
     incluido, que ahí es CriOS sobre WebKit) carecen de soporte. */
  function soportaRefraccion() {
    if (typeof window === 'undefined') return false;
    var ua = navigator.userAgent;
    var esIOS = /iPhone|iPad|iPod|CriOS|FxiOS|EdgiOS/.test(ua) ||
      (/Mac/.test(navigator.platform) && navigator.maxTouchPoints > 1);
    if (esIOS) return false;
    if (navigator.userAgentData && navigator.userAgentData.brands) {
      return navigator.userAgentData.brands.some(function (b) {
        return /Chromium/i.test(b.brand);
      });
    }
    return /Chrome\/\d+/.test(ua);
  }

  /* SDF de rectángulo redondeado (Iñigo Quílez): <0 dentro, 0 en el borde */
  function sdfRect(x, y, cx, cy, hx, hy, r) {
    var qx = Math.abs(x - cx) - (hx - r);
    var qy = Math.abs(y - cy) - (hy - r);
    var ax = Math.max(qx, 0), ay = Math.max(qy, 0);
    return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
  }

  /* Perfil físico de lente (ley de Snell en un bisel circular de
     vidrio): s=0 al empezar el bisel → desviación ~0; s=1 en el
     borde → máxima. Concentra la deformación pegada a la orilla. */
  function perfilSnell(s, n) {
    var SMAX = 0.9999;
    var norm = Math.tan(Math.asin(SMAX) - Math.asin(SMAX / n));
    var th = Math.asin(Math.min(s, SMAX));
    return Math.tan(th - Math.asin(Math.sin(th) / n)) / norm;
  }

  /* Genera el mapa de desplazamiento del tamaño EXACTO del elemento.
     R = desplazamiento X, G = desplazamiento Y, 128 = neutro.
     Dirección hacia el centro (efecto lupa): las muestras nunca caen
     fuera del elemento, evitando el clamp de borde de Chromium. */
  function generarMapa(ancho, alto, radio, bisel, indice) {
    var SS = 2;   // supermuestreo interno (antialias del mapa)
    var W = ancho * SS, H = alto * SS;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(W, H);
    var px = img.data;

    var cx = W / 2, cy = H / 2, hx = W / 2, hy = H / 2;
    var r = Math.min(radio, ancho / 2, alto / 2) * SS;
    var bz = Math.min(bisel, alto / 2, ancho / 2) * SS;

    function sdf(x, y) { return sdfRect(x, y, cx, cy, hx, hy, r); }

    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var d = sdf(x + 0.5, y + 0.5);
        var nx = 0, ny = 0, t = 0;
        if (d < 0 && d > -bz) {
          t = perfilSnell((d + bz) / bz, indice);
          var gx = sdf(x + 1.5, y + 0.5) - sdf(x - 0.5, y + 0.5);
          var gy = sdf(x + 0.5, y + 1.5) - sdf(x + 0.5, y - 0.5);
          var len = Math.hypot(gx, gy) || 1;
          nx = -gx / len;   // negada: muestrear hacia DENTRO (lupa)
          ny = -gy / len;
        }
        var i = (y * W + x) * 4;
        px[i] = Math.round(128 + nx * t * 127);
        px[i + 1] = Math.round(128 + ny * t * 127);
        px[i + 2] = 128;
        px[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // reescalar al tamaño real: el mapa debe medir LO MISMO que el elemento
    var fin = document.createElement('canvas');
    fin.width = ancho; fin.height = alto;
    var f = fin.getContext('2d');
    f.imageSmoothingEnabled = true;
    f.imageSmoothingQuality = 'high';
    f.drawImage(c, 0, 0, ancho, alto);
    return fin.toDataURL();
  }

  function nodoSVG(tag, attrs) {
    var el = document.createElementNS(NS_SVG, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* Construye el <filter>: frost → 3 desplazamientos (R/G/B con
     escalas ±croma) → recombinación. Las matrices PRESERVAN alfa:
     forzar alfa=1 vuelve negro opaco lo que caiga fuera de la región. */
  function crearFiltro(id, ancho, alto, cfg) {
    if (!svgHost) {
      svgHost = nodoSVG('svg', { width: 0, height: 0, 'aria-hidden': 'true' });
      svgHost.style.position = 'absolute';
      document.body.appendChild(svgHost);
    }
    var filtro = nodoSVG('filter', {
      id: id,
      'color-interpolation-filters': 'sRGB',  // OBLIGATORIO: linearRGB rompe el gris neutro
      filterUnits: 'userSpaceOnUse',          // región = píxeles del elemento
      x: 0, y: 0, width: ancho, height: alto
    });

    var feImage = nodoSVG('feImage', { x: 0, y: 0, width: ancho, height: alto, result: 'mapa' });
    filtro.appendChild(feImage);
    filtro.appendChild(nodoSVG('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: cfg.frost, result: 'frost' }));

    var escalas = [cfg.escala - cfg.croma, cfg.escala, cfg.escala + cfg.croma];
    var canales = ['R', 'G', 'B'];
    escalas.forEach(function (esc, i) {
      filtro.appendChild(nodoSVG('feDisplacementMap', {
        in: 'frost', in2: 'mapa', scale: esc,
        xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' + canales[i]
      }));
    });

    var filas = {
      R: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
      G: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
      B: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'
    };
    canales.forEach(function (cn) {
      filtro.appendChild(nodoSVG('feColorMatrix', {
        in: 'd' + cn, type: 'matrix', values: filas[cn], result: 'solo' + cn
      }));
    });
    filtro.appendChild(nodoSVG('feComposite', {
      in: 'soloR', in2: 'soloG', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0, result: 'rg'
    }));
    filtro.appendChild(nodoSVG('feComposite', {
      in: 'rg', in2: 'soloB', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0
    }));

    svgHost.appendChild(filtro);
    return { filtro: filtro, feImage: feImage };
  }

  /* ============================================================
     API principal
     ============================================================ */
  function liquidGlass(el, opciones) {
    var cfg = {
      bisel: 16,
      escala: 40,
      croma: 1,
      frost: 0.3,
      saturacion: 1.6,
      brillo: 1.05,
      indice: 1.5,
      fallback: 'blur(4px) saturate(180%) brightness(1.06)',
      observar: true
    };
    opciones = opciones || {};
    for (var k in opciones) cfg[k] = opciones[k];

    var estilosPrevios = {
      backdropFilter: el.style.backdropFilter,
      webkitBackdropFilter: el.style.webkitBackdropFilter
    };

    // Fallback SIEMPRE primero: si algo falla después, hay frosted glass
    el.style.backdropFilter = cfg.fallback;
    el.style.webkitBackdropFilter = cfg.fallback;

    if (!soportaRefraccion()) {
      return {
        soportado: false,
        regenerar: function () {},
        destruir: function () {
          el.style.backdropFilter = estilosPrevios.backdropFilter;
          el.style.webkitBackdropFilter = estilosPrevios.webkitBackdropFilter;
        }
      };
    }

    var id = 'lente-lg-' + (++contadorIds);
    var ancho = 0, alto = 0;
    var piezas = null;

    function regenerar() {
      var rect = el.getBoundingClientRect();
      var w = Math.max(2, Math.round(rect.width));
      var h = Math.max(2, Math.round(rect.height));
      if (w === ancho && h === alto && piezas) return;   // nada que hacer
      ancho = w; alto = h;

      var radio = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;

      if (!piezas) {
        piezas = crearFiltro(id, w, h, cfg);
      } else {
        piezas.filtro.setAttribute('width', w);
        piezas.filtro.setAttribute('height', h);
        piezas.feImage.setAttribute('width', w);
        piezas.feImage.setAttribute('height', h);
      }
      var mapa = generarMapa(w, h, radio, cfg.bisel, cfg.indice);
      piezas.feImage.setAttributeNS(NS_XLINK, 'href', mapa);
      piezas.feImage.setAttribute('href', mapa);
    }

    regenerar();

    // Refracción encima del fallback. Recuerda: NADA de blur() aquí.
    el.style.backdropFilter =
      'url(#' + id + ') saturate(' + (cfg.saturacion * 100) + '%) brightness(' + cfg.brillo + ')';

    var observador = null;
    if (cfg.observar && typeof ResizeObserver !== 'undefined') {
      observador = new ResizeObserver(function () { regenerar(); });
      observador.observe(el);
    }

    return {
      soportado: true,
      regenerar: regenerar,
      destruir: function () {
        if (observador) observador.disconnect();
        if (piezas) piezas.filtro.remove();
        el.style.backdropFilter = estilosPrevios.backdropFilter;
        el.style.webkitBackdropFilter = estilosPrevios.webkitBackdropFilter;
      }
    };
  }

  /* ============================================================
     Auto-inicialización: todo elemento con [data-liquid-glass]
     se activa solo al cargar la página. Opciones por atributo:
     data-bisel, data-escala, data-croma, data-frost, data-indice,
     data-saturacion, data-brillo.
     La instancia queda en el propio elemento: el._liquidGlass
     ============================================================ */
  function autoInit() {
    var nodos = document.querySelectorAll('[data-liquid-glass]');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      if (el._liquidGlass) continue;   // ya inicializado
      var ds = el.dataset;
      var op = {};
      if (ds.bisel) op.bisel = parseFloat(ds.bisel);
      if (ds.escala) op.escala = parseFloat(ds.escala);
      if (ds.croma) op.croma = parseFloat(ds.croma);
      if (ds.frost) op.frost = parseFloat(ds.frost);
      if (ds.indice) op.indice = parseFloat(ds.indice);
      if (ds.saturacion) op.saturacion = parseFloat(ds.saturacion);
      if (ds.brillo) op.brillo = parseFloat(ds.brillo);
      el._liquidGlass = liquidGlass(el, op);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // API pública en el ámbito global
  global.liquidGlass = liquidGlass;
  global.soportaRefraccion = soportaRefraccion;

})(window);
