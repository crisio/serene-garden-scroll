# liquid-glass.js — refracción "Liquid Glass" (iOS 26) para cualquier proyecto

Módulo ES autocontenido (`public/liquid-glass.js`, cero dependencias) que aplica
a cualquier elemento un backdrop con **refracción real de borde** (lente por
`feDisplacementMap` con perfil físico de Snell), aberración cromática sutil y
**fallback frosted** automático donde no hay soporte (Safari, Firefox y todo iOS).

## Instalación

Copia `public/liquid-glass.js` a tu proyecto. No hay build ni dependencias.

```html
<script type="module">
  import { liquidGlass } from './liquid-glass.js';
  liquidGlass(document.querySelector('.mi-vidrio'));
</script>
```

> Los módulos ES no cargan desde `file://` — sirve la página por HTTP
> (cualquier dev server vale).

## El elemento debe aportar el "material"

La librería solo pone la refracción. El vidrio (tinte, borde, rim) es CSS tuyo:

```css
.mi-vidrio{
  background: rgba(14,17,27,.28);            /* tinte translúcido, nunca opaco */
  border: 1px solid rgba(255,255,255,.28);
  border-radius: 999px;                       /* la librería lee el radio computado */
  box-shadow: inset 0 1px 0 rgba(255,255,255,.5),
              inset 0 -1px 1px rgba(0,0,0,.12);   /* solo insets, ver reglas de oro */
}
```

## API

```js
const vidrio = liquidGlass(el, {
  bisel: 16,        // px del anillo refractivo pegado al borde
  escala: 40,       // fuerza del desplazamiento (px máx ≈ escala/2)
  croma: 1,         // ±delta de escala entre canales R/B (0 = sin fleco de color)
  frost: 0.3,       // esmerilado interno (feGaussianBlur del filtro)
  saturacion: 1.6,  // saturate() encadenado tras el filtro
  brillo: 1.05,     // brightness() encadenado tras el filtro
  indice: 1.5,      // índice de refracción del perfil de Snell
  fallback: 'blur(4px) saturate(180%) brightness(1.06)',
  observar: true,   // regenerar el mapa si el elemento cambia de tamaño
});

vidrio.soportado;   // true = refracción activa; false = quedó el fallback
vidrio.regenerar(); // re-mide y regenera el mapa a mano
vidrio.destruir();  // quita filtro, observer y restaura estilos previos
```

También exporta `soportaRefraccion()` por si quieres decidir UI según soporte.

## Uso en React

```jsx
import { useEffect, useRef } from 'react';
import { liquidGlass } from './liquid-glass.js';

function PanelVidrio({ children }){
  const ref = useRef(null);
  useEffect(() => {
    const vidrio = liquidGlass(ref.current);
    return () => vidrio.destruir();
  }, []);
  return <div ref={ref} className="mi-vidrio">{children}</div>;
}
```

En Vue/Svelte es igual: llamar en `onMounted`/`onMount`, destruir al desmontar.

## Reglas de oro (cada una costó una tarde de depuración)

1. **Nada de `box-shadow` exterior en el elemento refractado.** Chromium mete
   la sombra propia en el snapshot del backdrop y la lente la magnifica como
   una mancha oscura. Insets sí; la sombra de elevación, en un hermano.
2. **Nada de `blur()` encadenado tras `url()`** en `backdrop-filter`: degrada
   la resolución del snapshot y emborrona todo el interior. El esmerilado va
   dentro del filtro (opción `frost`).
3. **Fondo translúcido** en el elemento (p. ej. `rgba(14,17,27,.28)`); un
   fondo opaco tapa el efecto.
4. **Al arrastrar/animar el elemento no hace falta regenerar nada** — el
   navegador re-muestrea el backdrop solo. Solo el cambio de *tamaño*
   regenera el mapa (y eso ya lo hace el `ResizeObserver`).

## Soporte

| Plataforma | Resultado |
|---|---|
| Chrome / Edge / Opera / Brave escritorio y Android | Refracción completa |
| Safari (macOS/iOS), Firefox | Fallback frosted (blur + saturate) |
| Cualquier navegador de iOS (incl. Chrome/CriOS) | Fallback frosted — iOS es WebKit debajo |

La demo completa con el pill arrastrable vive en `public/liquid-glass.html`.
