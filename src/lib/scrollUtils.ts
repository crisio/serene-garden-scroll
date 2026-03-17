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
