// Resolver universal de iconos Lucide.
// Acepta cualquier nombre que devuelva Strapi: "Heart", "hand-heart", "user_round",
// "User Round", etc. Convierte a la export PascalCase de lucide-react y la retorna.
//
// Trade-off conocido: import * impide el tree-shaking, asi que el bundle final
// incluye todos los iconos de lucide-react. A cambio, los editores pueden cambiar
// el nombre del icono desde el CMS sin necesidad de recompilar el frontend.

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconRegistry = LucideIcons as unknown as Record<string, LucideIcon>;

const toPascalCase = (s: string) =>
  s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");

const isLucideIcon = (value: unknown): value is LucideIcon =>
  typeof value === "function" || typeof value === "object";

const cache = new Map<string, LucideIcon>();

export const resolveIcon = (
  name?: string | null,
  fallback: LucideIcon = LucideIcons.Heart
): LucideIcon => {
  if (!name || typeof name !== "string") return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;

  const cached = cache.get(trimmed);
  if (cached) return cached;

  const candidates = [
    trimmed,
    toPascalCase(trimmed),
    `${toPascalCase(trimmed)}Icon`,
  ];

  for (const candidate of candidates) {
    const found = iconRegistry[candidate];
    if (isLucideIcon(found) && found !== (iconRegistry as any).default) {
      cache.set(trimmed, found);
      return found;
    }
  }

  return fallback;
};
