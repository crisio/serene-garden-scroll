# Hero + Strapi (sin código)

Esta guía describe, sin código, cómo consumir slides del hero desde Strapi con endpoints, parámetros y checklist.

## 1) Variables y base

- Base URL API (env): `VITE_API_URL=https://tu-strapi.com`
- Token (si no das acceso público): `VITE_API_TOKEN=<read-only>`
- Idioma (si usas i18n): añade `&locale=es` a los endpoints.

## 2) Endpoint principal (slides del hero)

Usa siempre orden, activos, media y, si aplica, ventana de fechas.

Listado para producción (ordenado y con media):

```
GET /api/hero-slides
  ?sort=order:asc
  &filters[isActive][$eq]=true
  &populate[cover]=*
```

( Opcional ) Habilitar programación por fechas:

```
GET /api/hero-slides
  ?sort=order:asc
  &filters[isActive][$eq]=true
  &filters[$and][0][$or][0][startAt][$null]=true
  &filters[$and][0][$or][1][startAt][$lte]=<ISO_NOW>
  &filters[$and][1][$or][0][endAt][$null]=true
  &filters[$and][1][$or][1][endAt][$gte]=<ISO_NOW>
  &populate[cover]=*
```

( Opcional ) Campos mínimos para payload lean:

```
GET /api/hero-slides
  ?sort=order:asc
  &filters[isActive][$eq]=true
  &fields[0]=title
  &fields[1]=subtitle
  &fields[2]=ctaText
  &fields[3]=ctaUrl
  &fields[4]=overlayOpacity
  &populate[cover][fields][0]=url
  &populate[cover][fields][1]=formats
```

Cabeceras (si usas token):

```
Authorization: Bearer <VITE_API_TOKEN>
```

## 3) Paginación y conteo (si lo necesitas)

- Paginación: `pagination[page]=1&pagination[pageSize]=N`
- Solo metas rápidas: `?pagination[pageSize]=1&fields[0]=id`

## 4) Endpoints auxiliares

- Un slide por ID: `GET /api/hero-slides/:id?populate[cover]=*`
- Borradores en preview: `GET /api/hero-slides?publicationState=preview&populate[cover]=*`
- Localización específica: `GET /api/hero-slides?locale=es&sort=order:asc&filters[isActive][$eq]=true&populate[cover]=*`

## 5) Imágenes (cómo tomarlas)

- Strapi devuelve rutas relativas en `cover.url` y `cover.formats.*.url`.
- En el front, compón URL absoluta con `VITE_API_URL + ruta`.
- Estrategia tamaños:
  - desktop: `formats.large.url` o `url`
  - tablet: `formats.medium.url`
  - móvil: `formats.small.url`
- Usa `cover.alternativeText` para `alt`.

## 6) Integración con el stack (operativo)

1. React Query – key `['hero-slides']`, fetcher al endpoint con headers.
2. Normaliza cada item: `{ title, subtitle, ctaText, ctaUrl, overlayOpacity, imageUrl }`.
3. Embla Carousel: autoplay 5–7s, loop, transición con fade.
4. Overlay: usa `overlayOpacity` (0.35–0.50 recomendado).
5. CTA: http(s) → nueva pestaña, `tel:` → llamada, rutas relativas → Router.
6. Errores/Fallback: imagen local por defecto si no hay datos.
7. SEO/A11y: `h1` solo en Home, `alt` desde CMS.
8. Build/ENV: `VITE_API_URL` por entorno, CORS en Strapi.
9. Reordenar/contenido: cambiar `order` y publicar; front se actualiza en próximo refetch.
10. Observabilidad (opcional): ETag/Last-Modified.

## 7) Checklist de publicación

- [ ] Permisos Public o API Token.
- [ ] CORS con tu dominio.
- [ ] 1–3 slides activos con `order` único.
- [ ] `alternativeText` completo.
- [ ] `overlayOpacity` para legibilidad.
- [ ] `ctaUrl` validado.
