/**
 * Scroll suave a una sección considerando el offset del header fijo
 * Acepta formatos: "seccion", "#seccion", "/#seccion"
 * @param sectionTarget - destino de sección
 * @param headerOffset - Altura del header + espacio adicional (default: 100px)
 */
export const scrollToSection = (sectionTarget: string, headerOffset: number = 100) => {
  const normalizedTarget = sectionTarget.trim();

  if (!normalizedTarget || normalizedTarget === "#" || normalizedTarget === "/") {
    return;
  }

  let sectionId = normalizedTarget;

  if (normalizedTarget.startsWith("/#")) {
    sectionId = normalizedTarget.slice(2);
  } else if (normalizedTarget.startsWith("#")) {
    sectionId = normalizedTarget.slice(1);
  } else if (normalizedTarget.startsWith("/")) {
    return;
  }

  if (!sectionId) {
    return;
  }

  const element = document.getElementById(sectionId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
};

/**
 * Scroll a una seccion esperando a que su posicion se estabilice.
 * Util cuando se navega desde otra ruta y secciones superiores (hero, about,
 * etc.) cargan datos async que mueven el offset del target.
 *
 * Estrategia:
 * 1. Sigue al elemento mientras se mueve por layout shifts: cada vez que su Y
 *    absoluta cambia, re-scrollea instantaneamente. Asi la seccion siempre
 *    queda visible aunque carguen datos arriba.
 * 2. Cuando la Y se mantiene estable por `settleFrames` consecutivos *y* paso
 *    al menos `minWaitMs`, hace el scroll smooth final y termina.
 * 3. Si supera `maxWaitMs`, hace un best-effort scroll y termina.
 */
export const scrollToSectionWhenReady = (
  sectionId: string,
  {
    headerOffset = 100,
    maxWaitMs = 6000,
    minWaitMs = 1200,
    settleFrames = 15,
    postCorrectionMs = 750,
  }: {
    headerOffset?: number;
    maxWaitMs?: number;
    minWaitMs?: number;
    settleFrames?: number;
    postCorrectionMs?: number;
  } = {}
) => {
  const start = performance.now();
  let lastY: number | null = null;
  let stable = 0;

  const targetY = (y: number) => Math.max(0, y - headerOffset);

  const finalSmooth = (y: number) => {
    window.scrollTo({ top: targetY(y), behavior: "smooth" });
    // Despues del smooth scroll, otro fetch async puede empujar el target
    // hacia abajo. Re-medi y corregi si se movio mas de 4px.
    window.setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const y2 = el.getBoundingClientRect().top + window.pageYOffset;
      if (Math.abs(y2 - y) >= 4) {
        window.scrollTo({ top: targetY(y2), behavior: "smooth" });
      }
    }, postCorrectionMs);
  };

  const tick = () => {
    const el = document.getElementById(sectionId);
    const elapsed = performance.now() - start;

    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset;

      if (lastY === null || Math.abs(y - lastY) >= 1) {
        // El target se movio: seguilo de forma instantanea para no perderlo.
        window.scrollTo({ top: targetY(y), behavior: "auto" });
        stable = 0;
      } else {
        stable += 1;
      }
      lastY = y;

      if (stable >= settleFrames && elapsed >= minWaitMs) {
        finalSmooth(y);
        return;
      }
    }

    if (elapsed >= maxWaitMs) {
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset;
        finalSmooth(y);
      }
      return;
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};
