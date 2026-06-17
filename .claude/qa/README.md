# Agente de QA web (Chrome DevTools MCP)

Toolkit para probar apps web con estándar de calidad alto: **errores** (consola + red),
**seguridad** (headers, HTTPS, mixed content, cookies), **velocidad** y **tiempos de carga**
(Core Web Vitals + Lighthouse), comparando todo contra un presupuesto editable.

## Componentes
| Archivo | Qué es |
|---|---|
| `../../.mcp.json` | Registra el servidor MCP `chrome-devtools` |
| `../agents/qa-engineer.md` | El subagente de QA (metodología + tools) |
| `../commands/qa-test.md` | Slash command `/qa-test [url]` |
| `budget.json` | Parámetros / umbrales de calidad (edítalos) |
| `report-template.md` | Plantilla del reporte |
| `reports/` | Reportes generados (`<fecha>-<host>.md`) |
| `setup.sh` | Hook de SessionStart: deps + Chrome (best-effort) |
| `install-global.sh` | Copia el toolkit a `~/.claude` para otras apps |

## Uso
```text
/qa-test                         # prueba http://localhost:8080 (este repo)
/qa-test https://tu-app.com      # prueba cualquier URL
```
También puedes invocar directamente al subagente `qa-engineer`.

## Permisos (opcional, para evitar prompts)
Añade a `.claude/settings.local.json` → `permissions.allow`:
```json
"Bash(npx:*)", "Bash(node:*)", "Bash(bash .claude/qa/setup.sh)", "mcp__chrome-devtools__*"
```
(No se añadieron automáticamente porque ampliar permisos requiere tu aprobación.)

## Requisitos / troubleshooting
- Necesita **Node** y salida a internet para `npx chrome-devtools-mcp@latest` (descarga Chrome la 1ª vez).
- **Chrome en contenedor (sandbox):** si el MCP falla por sandbox corriendo como root, usa el fallback:
  ```bash
  google-chrome --headless --no-sandbox --remote-debugging-port=9222 &
  # y registra el MCP con:  --browserUrl=http://127.0.0.1:9222
  ```
- Ajusta el rigor editando `budget.json` (los defaults son Core Web Vitals "good" = estándar alto).
