/* ============================================================
   liquid-glass.js — refracción "Liquid Glass" (iOS 26) reutilizable
   ------------------------------------------------------------
   Un solo archivo, sin dependencias. Aplica a cualquier elemento un
   backdrop con refracción real de borde (lente por feDisplacementMap),
   aberración cromática sutil y fallback frosted para navegadores sin
   soporte (Safari, Firefox y todo iOS).

   USO BÁSICO
     import { liquidGlass } from './liquid-glass.js';
     const vidrio = liquidGlass(document.querySelector('.mi-pill'));
     // ...más tarde:
     vidrio.destruir();

   OPCIONES (todas opcionales)
     liquidGlass(el, {
       bisel: 16,        // px del anillo refractivo pegado al borde
       escala: 40,       // fuerza del desplazamiento (px máx ≈ escala/2)
       croma: 1,         // ±delta de escala entre canales R/B (0 = sin color)
       frost: 0.3,       // feGaussianBlur interno (esmerilado sutil)
       saturacion: 1.6,  // saturate() encadenado tras el filtro
       brillo: 1.05,     // brightness() encadenado tras el filtro
       indice: 1.5,      // índice de refracción del perfil de Snell
       fallback: 'blur(4px) saturate(180%) brightness(1.06)',
       observar: true,   // regenerar el mapa si el elemento cambia de tamaño
     });

   DEVUELVE
     { soportado, regenerar(), destruir() }
     - soportado: true si el navegador renderiza la refracción SVG
       (Chromium de escritorio/Android); false → queda el fallback.

   REGLAS DE ORO (aprendidas a base de capturas en Chromium)
     1. NO pongas box-shadow exterior en el elemento con refracción:
        Chromium mete la sombra propia en el snapshot del backdrop y la
        lente la magnifica como una mancha oscura. Usa insets, o pon la
        sombra en un elemento hermano.
     2. NO encadenes blur() tras url() en backdrop-filter: degrada la
        resolución del snapshot y emborrona todo. El esmerilado va
        DENTRO del filtro (opción frost).
     3. El fondo del elemento debe ser translúcido (p. ej.
        rgba(14,17,27,.28)) para que el vidrio se vea.
   ============================================================ */

const NS_SVG = 'http://www.w3.org/2000/svg';
const NS_XLINK = 'http://www.w3.org/1999/xlink';

let contadorIds = 0;
let svgHost = null;   // un único <svg> oculto compartido por todas las instancias

/* ¿Este navegador renderiza backdrop-filter: url(#filtroSVG)?
   Solo Chromium de verdad. En iOS TODOS los navegadores (Chrome/CriOS
   incluido) son WebKit y no lo soportan. */
export function soportaRefraccion(){
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const esIOS = /iPhone|iPad|iPod|CriOS|FxiOS|EdgiOS/.test(ua)
    || (/Mac/.test(navigator.platform) && navigator.maxTouchPoints > 1);
  if (esIOS) return false;
  if (navigator.userAgentData?.brands){
    return navigator.userAgentData.brands.some(b => /Chromium/i.test(b.brand));
  }
  return /Chrome\/\d+/.test(ua);
}

/* SDF de rectángulo redondeado (Iñigo Quílez): <0 dentro, 0 en el borde */
function sdfRect(x, y, cx, cy, hx, hy, r){
  const qx = Math.abs(x - cx) - (hx - r);
  const qy = Math.abs(y - cy) - (hy - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
       + Math.min(Math.max(qx, qy), 0) - r;
}

/* Perfil físico de lente (ley de Snell en un bisel circular de vidrio):
   s=0 al empezar el bisel → desviación ~0; s=1 en el borde → máxima.
   Concentra la deformación pegada a la orilla, como el vidrio real. */
function perfilSnell(s, n){
  const SMAX = 0.9999;
  const norm = Math.tan(Math.asin(SMAX) - Math.asin(SMAX / n));
  const th = Math.asin(Math.min(s, SMAX));
  return Math.tan(th - Math.asin(Math.sin(th) / n)) / norm;
}

/* Genera el mapa de desplazamiento del tamaño EXACTO del elemento.
   R = desplazamiento X, G = desplazamiento Y, 128 = neutro.
   Dirección hacia el centro (efecto lupa): las muestras nunca caen
   fuera del elemento, evitando el clamp de borde de Chromium. */
function generarMapa(ancho, alto, radio, bisel, indice){
  const SS = 2;                              // supermuestreo interno (antialias)
  const W = ancho * SS, H = alto * SS;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(W, H);
  const px = img.data;

  const cx = W / 2, cy = H / 2, hx = W / 2, hy = H / 2;
  const r = Math.min(radio, ancho / 2, alto / 2) * SS;
  const bz = Math.min(bisel, alto / 2, ancho / 2) * SS;
  const sdf = (x, y) => sdfRect(x, y, cx, cy, hx, hy, r);

  for (let y = 0; y < H; y++){
    for (let x = 0; x < W; x++){
      const d = sdf(x + .5, y + .5);
      let nx = 0, ny = 0, t = 0;
      if (d < 0 && d > -bz){
        t = perfilSnell((d + bz) / bz, indice);
        const gx = sdf(x + 1.5, y + .5) - sdf(x - .5, y + .5);
        const gy = sdf(x + .5, y + 1.5) - sdf(x + .5, y - .5);
        const len = Math.hypot(gx, gy) || 1;
        nx = -gx / len;                      // negada: muestrear hacia DENTRO
        ny = -gy / len;
      }
      const i = (y * W + x) * 4;
      px[i]     = Math.round(128 + nx * t * 127);
      px[i + 1] = Math.round(128 + ny * t * 127);
      px[i + 2] = 128;
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // reescalar al tamaño real: el mapa debe medir LO MISMO que el elemento
  const fin = document.createElement('canvas');
  fin.width = ancho; fin.height = alto;
  const f = fin.getContext('2d');
  f.imageSmoothingEnabled = true;
  f.imageSmoothingQuality = 'high';
  f.drawImage(c, 0, 0, ancho, alto);
  return fin.toDataURL();
}

function nodoSVG(tag, attrs){
  const el = document.createElementNS(NS_SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/* Construye el <filter> con la cadena completa:
   frost → 3 desplazamientos (R/G/B con escalas ±croma) → recombinación.
   Las matrices PRESERVAN alfa: forzar alfa=1 vuelve negro opaco lo que
   caiga fuera de la región del filtro. */
function crearFiltro(id, ancho, alto, cfg){
  if (!svgHost){
    svgHost = nodoSVG('svg', { width: 0, height: 0, 'aria-hidden': 'true' });
    svgHost.style.position = 'absolute';
    document.body.appendChild(svgHost);
  }
  const filtro = nodoSVG('filter', {
    id,
    'color-interpolation-filters': 'sRGB',   // OBLIGATORIO: linearRGB rompe el gris neutro
    filterUnits: 'userSpaceOnUse',           // región = píxeles del elemento
    x: 0, y: 0, width: ancho, height: alto,
  });

  const feImage = nodoSVG('feImage', { x: 0, y: 0, width: ancho, height: alto, result: 'mapa' });
  filtro.appendChild(feImage);
  filtro.appendChild(nodoSVG('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: cfg.frost, result: 'frost' }));

  const escalas = [cfg.escala - cfg.croma, cfg.escala, cfg.escala + cfg.croma];
  const canales = ['R', 'G', 'B'];
  const desplazamientos = [];
  escalas.forEach((esc, i) => {
    const d = nodoSVG('feDisplacementMap', {
      in: 'frost', in2: 'mapa', scale: esc,
      xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' + canales[i],
    });
    desplazamientos.push(d);
    filtro.appendChild(d);
  });

  const filas = {
    R: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
    G: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
    B: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
  };
  canales.forEach(cn => {
    filtro.appendChild(nodoSVG('feColorMatrix', { in: 'd' + cn, type: 'matrix', values: filas[cn], result: 'solo' + cn }));
  });
  filtro.appendChild(nodoSVG('feComposite', { in: 'soloR', in2: 'soloG', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0, result: 'rg' }));
  filtro.appendChild(nodoSVG('feComposite', { in: 'rg', in2: 'soloB', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0 }));

  svgHost.appendChild(filtro);
  return { filtro, feImage, desplazamientos };
}

/* ============================================================
   API principal
   ============================================================ */
export function liquidGlass(el, opciones = {}){
  const cfg = {
    bisel: 16,
    escala: 40,
    croma: 1,
    frost: 0.3,
    saturacion: 1.6,
    brillo: 1.05,
    indice: 1.5,
    fallback: 'blur(4px) saturate(180%) brightness(1.06)',
    observar: true,
    ...opciones,
  };

  const estilosPrevios = {
    backdropFilter: el.style.backdropFilter,
    webkitBackdropFilter: el.style.webkitBackdropFilter,
  };

  // Fallback SIEMPRE primero: si algo falla después, hay frosted glass
  el.style.backdropFilter = cfg.fallback;
  el.style.webkitBackdropFilter = cfg.fallback;

  if (!soportaRefraccion()){
    return {
      soportado: false,
      regenerar(){},
      destruir(){
        el.style.backdropFilter = estilosPrevios.backdropFilter;
        el.style.webkitBackdropFilter = estilosPrevios.webkitBackdropFilter;
      },
    };
  }

  const id = 'lente-lg-' + (++contadorIds);
  let ancho = 0, alto = 0;
  let piezas = null;

  function regenerar(){
    const rect = el.getBoundingClientRect();
    const w = Math.max(2, Math.round(rect.width));
    const h = Math.max(2, Math.round(rect.height));
    if (w === ancho && h === alto && piezas) return;   // nada que hacer
    ancho = w; alto = h;

    const radio = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;

    if (!piezas){
      piezas = crearFiltro(id, w, h, cfg);
    } else {
      piezas.filtro.setAttribute('width', w);
      piezas.filtro.setAttribute('height', h);
      piezas.feImage.setAttribute('width', w);
      piezas.feImage.setAttribute('height', h);
    }
    const mapa = generarMapa(w, h, radio, cfg.bisel, cfg.indice);
    piezas.feImage.setAttributeNS(NS_XLINK, 'href', mapa);
    piezas.feImage.setAttribute('href', mapa);
  }

  regenerar();

  // Refracción encima del fallback. Recuerda: NADA de blur() aquí.
  el.style.backdropFilter =
    `url(#${id}) saturate(${cfg.saturacion * 100}%) brightness(${cfg.brillo})`;

  let observador = null;
  if (cfg.observar && typeof ResizeObserver !== 'undefined'){
    observador = new ResizeObserver(() => regenerar());
    observador.observe(el);
  }

  return {
    soportado: true,
    regenerar,
    destruir(){
      observador?.disconnect();
      piezas?.filtro.remove();
      el.style.backdropFilter = estilosPrevios.backdropFilter;
      el.style.webkitBackdropFilter = estilosPrevios.webkitBackdropFilter;
    },
  };
}

export default liquidGlass;
