export const DEFAULT_WHATSAPP_MESSAGE = "Hola, quisiera informacion sobre los servicios.";

/**
 * Construye una URL valida de wa.me. Limpia separadores, prefija 504 cuando
 * detecta un numero local hondureno de 8 digitos, y agrega ?text= con el
 * mensaje (default si no se pasa explicito; pasa "" para no agregar mensaje).
 */
export const buildWhatsappUrl = (
  number?: string | null,
  message: string = DEFAULT_WHATSAPP_MESSAGE
): string | null => {
  if (!number) return null;
  const digits = String(number).replace(/\D/g, "");
  if (!digits) return null;
  const intl = digits.length === 8 ? `504${digits}` : digits;
  const url = new URL(`https://wa.me/${intl}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
};
