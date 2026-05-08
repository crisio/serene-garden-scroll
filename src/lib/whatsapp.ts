export const DEFAULT_WHATSAPP_MESSAGE = "Hola, quisiera informacion sobre los servicios.";

/**
 * Normaliza un numero a formato internacional E.164 sin separadores.
 * Si llega un numero local hondureno de 8 digitos, prefija 504.
 */
const toIntlDigits = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length === 8 ? `504${digits}` : digits;
};

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
  const intl = toIntlDigits(String(number));
  if (!intl) return null;
  const url = new URL(`https://wa.me/${intl}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
};

/**
 * Construye un href tel: con prefijo +504 (Honduras) cuando detecta un
 * numero local de 8 digitos. Acepta separadores en la entrada.
 */
export const buildTelHref = (number?: string | null): string | null => {
  if (!number) return null;
  const intl = toIntlDigits(String(number));
  if (!intl) return null;
  return `tel:+${intl}`;
};
