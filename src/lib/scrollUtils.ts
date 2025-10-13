/**
 * Scroll suave a una sección considerando el offset del header fijo
 * @param sectionId - ID del elemento al que hacer scroll
 * @param headerOffset - Altura del header + espacio adicional (default: 100px)
 */
export const scrollToSection = (sectionId: string, headerOffset: number = 100) => {
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
