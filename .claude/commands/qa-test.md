---
description: Corre la suite de QA (errores, seguridad, velocidad, carga) contra una URL vía Chrome DevTools MCP
argument-hint: "[url]  (default: http://localhost:8080)"
---

Ejecuta una auditoría de QA completa usando el subagente `qa-engineer`.

**Target**: `$ARGUMENTS` — si está vacío, usa `http://localhost:8080` (la app local de este repo).

Lanza el subagente **qa-engineer** (vía la herramienta Agent / Task) con estas instrucciones:

1. Carga el presupuesto de calidad desde `.claude/qa/budget.json`.
2. Prueba el target indicado siguiendo todo el procedimiento de QA: errores de consola y
   red, performance y tiempos de carga (Core Web Vitals + Lighthouse), y seguridad (headers,
   HTTPS, mixed content, cookies).
3. Compara cada resultado contra el budget y emite un veredicto **PASS/FAIL** por métrica y global.
4. Genera el reporte en `.claude/qa/reports/` usando `.claude/qa/report-template.md`.

Al terminar, muéstrame: el **veredicto global**, los **3-5 hallazgos principales** (con
prioridad P0/P1/P2) y la **ruta del archivo de reporte** generado.
