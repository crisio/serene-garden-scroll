# Reporte de QA — {{TARGET}}

- **Fecha**: {{FECHA}}
- **Target**: {{URL}}
- **Rutas probadas**: {{RUTAS}}
- **Budget aplicado**: `.claude/qa/budget.json`

## Veredicto global: {{PASS_FAIL}}

> {{RESUMEN_EJECUTIVO_1_3_LINEAS}}

---

## 1. Performance y tiempos de carga

| Métrica | Valor | Umbral (budget) | Estado |
|---|---|---|---|
| LCP (ms) | {{}} | 2500 | {{✅/❌}} |
| CLS | {{}} | 0.1 | {{}} |
| INP / TBT (ms) | {{}} | 200 | {{}} |
| FCP (ms) | {{}} | 1800 | {{}} |
| TTFB (ms) | {{}} | 800 | {{}} |
| Carga total (ms) | {{}} | 3000 | {{}} |
| Peso transferido (KB) | {{}} | 1500 | {{}} |
| Nº de requests | {{}} | 80 | {{}} |

**Insights / causas raíz** (de `performance_analyze_insight`):
- {{}}

## 2. Lighthouse

| Categoría | Score | Mínimo | Estado |
|---|---|---|---|
| Performance | {{}} | 90 | {{}} |
| Accesibilidad | {{}} | 90 | {{}} |
| Best Practices | {{}} | 90 | {{}} |
| SEO | {{}} | 90 | {{}} |

## 3. Errores

### Consola
| Ruta | Nivel | Mensaje | Origen |
|---|---|---|---|
| {{}} | error/warning | {{}} | {{}} |

### Red (requests fallidos / problemáticos)
| Ruta | URL | Status | Problema |
|---|---|---|---|
| {{}} | {{}} | {{}} | 4xx/5xx/mixed-content/lento |

## 4. Seguridad

| Header / Check | Esperado | Encontrado | Estado |
|---|---|---|---|
| Content-Security-Policy | presente | {{}} | {{}} |
| Strict-Transport-Security | presente | {{}} | {{}} |
| X-Content-Type-Options | nosniff | {{}} | {{}} |
| X-Frame-Options | DENY/SAMEORIGIN | {{}} | {{}} |
| Referrer-Policy | presente | {{}} | {{}} |
| HTTPS | sí | {{}} | {{}} |
| Mixed content | ninguno | {{}} | {{}} |
| Cookies (Secure/HttpOnly/SameSite) | sí | {{}} | {{}} |
| Secretos expuestos en bundle | ninguno | {{}} | {{}} |

## 5. Screenshots
- {{ruta_screenshot_1}}
- {{ruta_screenshot_2}}

## 6. Recomendaciones priorizadas

### P0 — Bloqueante (rompe el estándar de calidad)
- [ ] {{}}

### P1 — Importante
- [ ] {{}}

### P2 — Mejora
- [ ] {{}}
